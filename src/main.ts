import "./style.css";
import { BOARD, BOARD_SIZE, GROUP_COLORS, JAIL_TILE_ID, Tile } from "./board";
import { GameState } from "./game";
import { Board2D, computePathBetween } from "./board2d";
import { playDiceSound, playBuySound, playVictorySound, setMuted, isMuted } from "./sound";
import { BroadcastRoom, GameEvent, RosterEntry, randomClientId, randomRoomCode } from "./network";

const boardContainer = document.getElementById("board2d") as HTMLDivElement;
const setupModal = document.getElementById("setup-modal")!;
const playerCountButtons = document.getElementById("player-count-buttons")!;
const playersPanel = document.getElementById("players-panel")!;
const currentPlayerNameEl = document.getElementById("current-player-name")!;
const die1El = document.getElementById("die1")!;
const die2El = document.getElementById("die2")!;
const actionLogEl = document.getElementById("action-log")!;
const rollBtn = document.getElementById("roll-btn") as HTMLButtonElement;
const buyBtn = document.getElementById("buy-btn") as HTMLButtonElement;
const endTurnBtn = document.getElementById("end-turn-btn") as HTMLButtonElement;
const buildPanel = document.getElementById("build-panel") as HTMLDivElement;
const soundToggleBtn = document.getElementById("sound-toggle") as HTMLButtonElement;
const restartBtn = document.getElementById("restart-btn") as HTMLButtonElement;
const tileCard = document.getElementById("tile-card") as HTMLDivElement;
const victoryModal = document.getElementById("victory-modal")!;
const victoryTitle = document.getElementById("victory-title")!;
const victoryText = document.getElementById("victory-text")!;
const victoryRestartBtn = document.getElementById("victory-restart-btn") as HTMLButtonElement;
const roomBadge = document.getElementById("room-badge") as HTMLDivElement;
const turnTracker = document.getElementById("turn-tracker") as HTMLDivElement;
const waitingBanner = document.getElementById("waiting-banner") as HTMLDivElement;
const waitingForNameEl = document.getElementById("waiting-for-name")!;

const modeLocalBtn = document.getElementById("mode-local-btn")!;
const modeCreateBtn = document.getElementById("mode-create-btn")!;
const modeJoinBtn = document.getElementById("mode-join-btn")!;
const createNameInput = document.getElementById("create-name-input") as HTMLInputElement;
const createConfirmBtn = document.getElementById("create-confirm-btn")!;
const joinCodeInput = document.getElementById("join-code-input") as HTMLInputElement;
const joinNameInput = document.getElementById("join-name-input") as HTMLInputElement;
const joinConfirmBtn = document.getElementById("join-confirm-btn")!;
const lobbyCodeDisplay = document.getElementById("lobby-code-display")!;
const lobbyRoster = document.getElementById("lobby-roster")!;
const lobbyStartBtn = document.getElementById("lobby-start-btn") as HTMLButtonElement;
const lobbyWaitText = document.getElementById("lobby-wait-text")!;

let boardView: Board2D | null = null;
let game: GameState | null = null;
let victoryAnnounced = false;
let room: BroadcastRoom | null = null;
let mode: "local" | "online" = "local";
let myIndex = -1;
const lastRolls: Record<number, [number, number]> = {};

const TYPE_LABELS: Record<string, string> = {
  go: "Depart",
  property: "Propriete",
  railroad: "Gare",
  utility: "Compagnie",
  tax: "Taxe",
  chance: "Chance",
  chest: "Caisse de communaute",
  jail: "Prison",
  "free-parking": "Parc gratuit",
  "go-to-jail": "Allez en prison",
};

function log(msg: string) {
  const div = document.createElement("div");
  div.textContent = msg;
  actionLogEl.appendChild(div);
  actionLogEl.scrollTop = actionLogEl.scrollHeight;
}

function snapshotMoney(): Record<number, number> {
  const snap: Record<number, number> = {};
  if (!game) return snap;
  for (const p of game.players) snap[p.index] = p.money;
  return snap;
}

function popupMoneyDeltas(before: Record<number, number>) {
  if (!game) return;
  for (const p of game.players) {
    const delta = p.money - (before[p.index] ?? p.money);
    if (delta !== 0) showMoneyPopup(p.index, delta);
  }
}

function showMoneyPopup(playerIndex: number, delta: number) {
  if (!boardView) return;
  const pos = boardView.getTokenScreenPosition(playerIndex);
  if (!pos) return;
  const el = document.createElement("div");
  el.className = "money-popup " + (delta > 0 ? "positive" : "negative");
  el.textContent = (delta > 0 ? "+" : "") + delta + " M";
  el.style.left = pos.x + "px";
  el.style.top = pos.y + "px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

function launchConfetti() {
  const layer = document.createElement("div");
  layer.id = "confetti-layer";
  document.body.appendChild(layer);
  const colors = ["#ffd54a", "#7be08a", "#6cc3ff", "#ff7373", "#c77bff"];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = 2 + Math.random() * 1.5 + "s";
    piece.style.animationDelay = Math.random() * 0.5 + "s";
    layer.appendChild(piece);
  }
  setTimeout(() => layer.remove(), 4000);
}

function canAct(actorIndex: number): boolean {
  return mode === "local" || myIndex === actorIndex;
}

function sendEvent(event: GameEvent) {
  if (mode === "online" && room) {
    room.sendGameEvent(event);
  } else {
    applyGameEvent(event);
  }
}

function renderPlayersPanel() {
  if (!game) return;
  playersPanel.innerHTML = "";
  for (const p of game.players) {
    const card = document.createElement("div");
    card.className = "player-card" + (p.index === game.currentPlayerIndex ? " active" : "") + (p.bankrupt ? " bankrupt" : "");
    const colorHex = "#" + p.color.toString(16).padStart(6, "0");
    const jailBadge = p.inJail ? `<span class="status-badge">en prison</span>` : "";
    const groups = new Set<string>();
    for (const tileId of p.properties) {
      const t = BOARD[tileId];
      if (t.group) groups.add(t.group);
    }
    const dots = Array.from(groups)
      .map((g) => `<span class="dot" style="background:#${GROUP_COLORS[g as keyof typeof GROUP_COLORS].toString(16).padStart(6, "0")}"></span>`)
      .join("");
    card.innerHTML = `
      <div class="name"><span class="swatch" style="background:${colorHex}"></span>${p.name}${jailBadge}</div>
      <div class="money">${p.money} M</div>
      <div class="props">${p.properties.length} propriete(s)</div>
      ${dots ? `<div class="portfolio">${dots}</div>` : ""}
    `;
    playersPanel.appendChild(card);
  }
  currentPlayerNameEl.textContent = game.currentPlayer.name;
}

function renderTurnTracker() {
  if (!game) return;
  turnTracker.classList.remove("hidden");
  turnTracker.innerHTML = "";
  for (const p of game.players) {
    const chip = document.createElement("div");
    chip.className = "tracker-chip" + (p.index === game.currentPlayerIndex ? " current" : "");
    const colorHex = "#" + p.color.toString(16).padStart(6, "0");
    const roll = lastRolls[p.index];
    chip.innerHTML = `<span class="swatch" style="background:${colorHex}"></span>${p.name}${
      roll ? `<span class="last-roll">${roll[0]}+${roll[1]}</span>` : ""
    }`;
    turnTracker.appendChild(chip);
  }
}

function renderBuildPanel() {
  if (!game) return;
  const player = game.currentPlayer;
  if (!canAct(player.index)) {
    buildPanel.classList.add("hidden");
    buildPanel.innerHTML = "";
    return;
  }
  const buildable = BOARD.filter((t) => game!.canBuildHouse(player, t));
  buildPanel.innerHTML = "";
  if (buildable.length === 0) {
    buildPanel.classList.add("hidden");
    return;
  }
  buildPanel.classList.remove("hidden");
  const title = document.createElement("div");
  title.className = "build-title";
  title.textContent = "Construire";
  buildPanel.appendChild(title);
  for (const tile of buildable) {
    const cost = game.houseCost(tile);
    const current = game.houses[tile.id] ?? 0;
    const label = current === 4 ? "hotel" : "maison";
    const btn = document.createElement("button");
    btn.textContent = `${tile.name} : +1 ${label} (${cost} M)`;
    btn.addEventListener("click", () => {
      if (!game || !canAct(player.index)) return;
      sendEvent({ type: "buildHouse", actor: player.index, tileId: tile.id });
    });
    buildPanel.appendChild(btn);
  }
}

function hideTileCard() {
  tileCard.classList.add("hidden");
  tileCard.innerHTML = "";
}

function renderTileCard(tile: Tile) {
  if (!game) return;
  const groupColor = tile.group ? GROUP_COLORS[tile.group] : null;
  const bandColor = groupColor !== null ? `#${groupColor.toString(16).padStart(6, "0")}` : "#3a4a5c";
  const owner = game.tileOwner(tile.id);

  let rows = "";
  if (tile.type === "property") {
    const houseCount = game.houses[tile.id] ?? 0;
    const groupFull = owner && tile.group ? game.countGroupOwned(owner, tile.group) === BOARD.filter((t) => t.group === tile.group).length : false;
    let currentLabel: string | null = null;
    if (owner) {
      if (houseCount > 0) {
        const tierLabels = ["1 maison", "2 maisons", "3 maisons", "4 maisons", "Hotel"];
        currentLabel = tierLabels[houseCount - 1];
      } else {
        currentLabel = groupFull ? "Groupe complet" : "Loyer de base";
      }
    }
    for (const entry of game.rentSchedule(tile)) {
      const isCurrent = entry.label === currentLabel;
      rows += `<div class="tile-card-row${isCurrent ? " highlight" : ""}"><span>${entry.label}</span><span>${entry.rent} M</span></div>`;
    }
  } else if (tile.type === "railroad") {
    rows = `
      <div class="tile-card-row"><span>1 gare</span><span>25 M</span></div>
      <div class="tile-card-row"><span>2 gares</span><span>50 M</span></div>
      <div class="tile-card-row"><span>3 gares</span><span>100 M</span></div>
      <div class="tile-card-row"><span>4 gares</span><span>200 M</span></div>
    `;
  } else if (tile.type === "utility") {
    rows = `
      <div class="tile-card-row"><span>1 compagnie</span><span>4x les des</span></div>
      <div class="tile-card-row"><span>2 compagnies</span><span>10x les des</span></div>
    `;
  } else if (tile.type === "tax") {
    rows = `<div class="tile-card-row highlight"><span>Montant</span><span>${tile.taxAmount} M</span></div>`;
  }

  let ownerHtml = "";
  if (owner) {
    const colorHex = "#" + owner.color.toString(16).padStart(6, "0");
    ownerHtml = `<div class="tile-card-owner"><span class="swatch" style="width:10px;height:10px;border-radius:50%;background:${colorHex};display:inline-block;"></span>Propriete de ${owner.name}</div>`;
  }

  tileCard.innerHTML = `
    <div class="tile-card-band" style="background:${bandColor}">${tile.name}</div>
    <div class="tile-card-body">
      <div class="tile-card-type">${TYPE_LABELS[tile.type] ?? tile.type}</div>
      ${tile.price ? `<div class="tile-card-row"><span>Prix</span><span>${tile.price} M</span></div>` : ""}
      ${rows}
      ${ownerHtml}
    </div>
  `;
  tileCard.classList.remove("hidden");
}

function updateActionAvailability() {
  if (!game) return;
  const myTurn = canAct(game.currentPlayerIndex);
  const showWaiting = mode === "online" && !myTurn;
  waitingBanner.classList.toggle("hidden", !showWaiting);
  if (showWaiting) {
    waitingForNameEl.textContent = game.currentPlayer.name;
    rollBtn.disabled = true;
    buyBtn.disabled = true;
    endTurnBtn.disabled = true;
  }
}

function setButtonsForRollPhase() {
  rollBtn.classList.remove("hidden");
  rollBtn.disabled = false;
  buyBtn.classList.add("hidden");
  endTurnBtn.classList.add("hidden");
  hideTileCard();
  updateActionAvailability();
}

function setButtonsForPostMove(canBuy: boolean) {
  rollBtn.classList.add("hidden");
  if (canBuy) {
    buyBtn.classList.remove("hidden");
    buyBtn.disabled = false;
  } else {
    buyBtn.classList.add("hidden");
  }
  endTurnBtn.classList.remove("hidden");
  endTurnBtn.disabled = false;
  updateActionAvailability();
}

function handleRoll() {
  if (!game || !boardView) return;
  if (!canAct(game.currentPlayerIndex)) return;
  rollBtn.disabled = true;
  const [d1, d2] = game.rollDice();
  sendEvent({ type: "roll", actor: game.currentPlayerIndex, d1, d2, seed: Math.random() });
}

function applyGameEvent(event: GameEvent) {
  if (!game || !boardView) return;

  if (event.type === "roll") {
    die1El.textContent = "?";
    die2El.textContent = "?";
    playDiceSound();
    boardView.rollDiceAnimation([event.d1, event.d2], () => {
      die1El.textContent = String(event.d1);
      die2El.textContent = String(event.d2);
      lastRolls[event.actor] = [event.d1, event.d2];
      renderTurnTracker();
      void resolveMove(event.d1, event.d2, event.seed);
    });
  } else if (event.type === "buy") {
    const before = snapshotMoney();
    const bought = game.buyCurrentTile();
    if (bought) {
      playBuySound();
      popupMoneyDeltas(before);
      buyBtn.classList.add("hidden");
    }
    renderPlayersPanel();
    renderBuildPanel();
    updateOwnershipMarkers();
  } else if (event.type === "buildHouse") {
    const player = game.players[event.actor];
    const tile = BOARD[event.tileId];
    const before = snapshotMoney();
    if (game.buildHouse(player, tile)) {
      playBuySound();
      popupMoneyDeltas(before);
      boardView.updateHouses(tile.id, game.houses[tile.id] ?? 0);
      renderPlayersPanel();
      renderBuildPanel();
    }
  } else if (event.type === "endTurn") {
    game.nextTurn();
    renderPlayersPanel();
    renderBuildPanel();
    renderTurnTracker();
    if (!game.gameOver) {
      setButtonsForRollPhase();
    }
  }
}

async function resolveMove(d1: number, d2: number, seed: number) {
  if (!game || !boardView) return;
  const player = game.currentPlayer;
  const total = d1 + d2;
  const isDouble = d1 === d2;

  if (player.inJail) {
    if (isDouble) {
      player.inJail = false;
      log(`${player.name} fait un double et sort de prison !`);
    } else {
      player.jailTurns += 1;
      if (player.jailTurns >= 3) {
        player.inJail = false;
        const before = snapshotMoney();
        player.money -= 50;
        popupMoneyDeltas(before);
        log(`🔓 ${player.name} paie 50 M de caution et sort de prison.`);
      } else {
        log(`🔒 ${player.name} reste en prison (tentative ${player.jailTurns}/3).`);
        renderPlayersPanel();
        renderBuildPanel();
        setButtonsForPostMove(false);
        return;
      }
    }
  }

  const startPos = player.position;
  const path = computePathBetween(startPos, (startPos + total) % BOARD_SIZE, BOARD_SIZE);
  await boardView.animateTokenMove(player.index, path);

  const beforeGo = snapshotMoney();
  const result = game.moveCurrentPlayer(total);
  popupMoneyDeltas(beforeGo);
  const finalTile = result.tile;
  log(`➡️ ${player.name} avance de ${total} (case ${finalTile.name}).`);
  renderTileCard(finalTile);
  boardView.highlightTile(finalTile.id);

  if (finalTile.type === "go-to-jail") {
    game.sendToJail(player);
    await boardView.animateTokenMove(player.index, [JAIL_TILE_ID]);
  } else if (finalTile.type === "tax") {
    const before = snapshotMoney();
    game.payTax(finalTile.taxAmount ?? 0);
    popupMoneyDeltas(before);
  } else if (finalTile.type === "chance") {
    const card = game.drawChance(seed);
    log(`❓ Chance : ${card.text}`);
    const before = snapshotMoney();
    game.applyCard(card);
    popupMoneyDeltas(before);
  } else if (finalTile.type === "chest") {
    const card = game.drawChest(seed);
    log(`📦 Caisse de communaute : ${card.text}`);
    const before = snapshotMoney();
    game.applyCard(card);
    popupMoneyDeltas(before);
  } else if (finalTile.type === "property" || finalTile.type === "railroad" || finalTile.type === "utility") {
    const owner = game.tileOwner(finalTile.id);
    if (!owner) {
      if (game.canBuy(finalTile)) {
        setButtonsForPostMove(true);
        renderPlayersPanel();
        renderBuildPanel();
        checkGameOver();
        return;
      }
    } else if (owner.index !== player.index) {
      const rent = game.computeRent(finalTile, total);
      const before = snapshotMoney();
      game.payRent(player, owner, rent);
      popupMoneyDeltas(before);
    }
  }

  renderPlayersPanel();
  renderBuildPanel();
  updateOwnershipMarkers();
  checkGameOver();
  if (game.gameOver) return;

  if (isDouble && !player.bankrupt) {
    log(`🎲 ${player.name} a fait un double, rejouez !`);
    setButtonsForRollPhase();
  } else {
    setButtonsForPostMove(false);
  }
}

function updateOwnershipMarkers() {
  if (!game || !boardView) return;
  for (const tileIdStr of Object.keys(game.ownership)) {
    const tileId = Number(tileIdStr);
    const ownerIdx = game.ownership[tileId];
    const owner = game.players[ownerIdx];
    boardView.markOwnership(tileId, owner.color);
  }
}

function checkGameOver() {
  if (!game) return;
  if (game.gameOver) {
    setButtonsForRollPhase();
    rollBtn.disabled = true;
    if (!victoryAnnounced) {
      victoryAnnounced = true;
      playVictorySound();
      const winner = game.activePlayers()[0];
      if (winner) {
        victoryTitle.textContent = `🏆 ${winner.name} remporte la partie !`;
        victoryText.textContent = `${winner.money} M et ${winner.properties.length} propriete(s).`;
      } else {
        victoryTitle.textContent = "Partie terminee";
        victoryText.textContent = "";
      }
      victoryModal.classList.remove("hidden");
      launchConfetti();
    }
  }
}

function handleBuy() {
  if (!game) return;
  if (!canAct(game.currentPlayerIndex)) return;
  sendEvent({ type: "buy", actor: game.currentPlayerIndex, tileId: game.currentPlayer.position });
}

function handleEndTurn() {
  if (!game) return;
  if (!canAct(game.currentPlayerIndex)) return;
  sendEvent({ type: "endTurn", actor: game.currentPlayerIndex });
}

function launchGame(numPlayers: number, roster?: { name: string; color: number }[]) {
  setupModal.classList.add("hidden");
  boardView = new Board2D(boardContainer);
  boardView.onTileClick = (tile) => renderTileCard(tile);
  game = new GameState(numPlayers, log, roster);
  for (const p of game.players) {
    boardView.createToken(p.index, p.color);
  }
  renderPlayersPanel();
  renderBuildPanel();
  renderTurnTracker();
  setButtonsForRollPhase();
}

function startLocalGame(numPlayers: number) {
  mode = "local";
  myIndex = -1;
  room = null;
  roomBadge.classList.add("hidden");
  launchGame(numPlayers);
}

function beginOnlineGame(roster: RosterEntry[]) {
  if (!room) return;
  mode = "online";
  myIndex = roster.findIndex((p) => p.clientId === room!.clientId);
  const me = roster[myIndex];
  roomBadge.textContent = `Salle ${room.code} · Vous : ${me ? me.name : "?"}`;
  roomBadge.classList.remove("hidden");
  launchGame(
    roster.length,
    roster.map((r) => ({ name: r.name, color: r.color }))
  );
  room.onGameEvent = applyGameEvent;
}

// --- Setup flow ---

function showSetupStep(id: string) {
  document.querySelectorAll(".setup-step").forEach((el) => el.classList.add("hidden"));
  document.getElementById(id)?.classList.remove("hidden");
}

function renderLobbyRoster(roster: RosterEntry[]) {
  lobbyRoster.innerHTML = "";
  for (const p of roster) {
    const row = document.createElement("div");
    row.className = "lobby-player-row";
    const colorHex = "#" + p.color.toString(16).padStart(6, "0");
    row.innerHTML = `<span class="swatch" style="background:${colorHex}"></span>${p.name}`;
    lobbyRoster.appendChild(row);
  }
  if (room?.isHost) {
    lobbyStartBtn.classList.remove("hidden");
    lobbyStartBtn.disabled = roster.length < 2;
  }
}

modeLocalBtn.addEventListener("click", () => showSetupStep("setup-step-local"));
modeCreateBtn.addEventListener("click", () => showSetupStep("setup-step-create"));
modeJoinBtn.addEventListener("click", () => showSetupStep("setup-step-join"));

document.querySelectorAll(".setup-back-btn").forEach((btn) => {
  btn.addEventListener("click", () => showSetupStep("setup-step-mode"));
});

playerCountButtons.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const count = target.getAttribute("data-count");
  if (count) {
    startLocalGame(Number(count));
  }
});

createConfirmBtn.addEventListener("click", () => {
  const name = createNameInput.value.trim() || "Hote";
  const code = randomRoomCode();
  const clientId = randomClientId();
  room = new BroadcastRoom(code, clientId, true);
  room.onRosterChange = renderLobbyRoster;
  room.onStart = beginOnlineGame;
  room.hostSelf(name);
  lobbyCodeDisplay.textContent = code;
  lobbyWaitText.classList.add("hidden");
  showSetupStep("setup-step-lobby");
});

joinConfirmBtn.addEventListener("click", () => {
  const code = joinCodeInput.value.trim().toUpperCase();
  const name = joinNameInput.value.trim() || "Joueur";
  if (!code) return;
  const clientId = randomClientId();
  room = new BroadcastRoom(code, clientId, false);
  room.onRosterChange = renderLobbyRoster;
  room.onStart = beginOnlineGame;
  room.requestJoin(name);
  lobbyCodeDisplay.textContent = code;
  lobbyStartBtn.classList.add("hidden");
  lobbyWaitText.classList.remove("hidden");
  showSetupStep("setup-step-lobby");
});

lobbyStartBtn.addEventListener("click", () => {
  room?.startGame();
});

soundToggleBtn.addEventListener("click", () => {
  const nextMuted = !isMuted();
  setMuted(nextMuted);
  soundToggleBtn.textContent = nextMuted ? "🔇" : "🔊";
});

restartBtn.addEventListener("click", () => {
  window.location.reload();
});

victoryRestartBtn.addEventListener("click", () => {
  window.location.reload();
});

rollBtn.addEventListener("click", handleRoll);
buyBtn.addEventListener("click", handleBuy);
endTurnBtn.addEventListener("click", handleEndTurn);
