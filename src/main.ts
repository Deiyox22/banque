import "./style.css";
import { BOARD, BOARD_SIZE, GROUP_COLORS, JAIL_TILE_ID, GO_TO_JAIL_TILE_ID, Tile } from "./board";
import { GameState, Player } from "./game";
import { Board3D, computePathBetween } from "./scene";
import { playDiceSound, playBuySound, playVictorySound, setMuted, isMuted } from "./sound";

const canvas = document.getElementById("scene") as HTMLCanvasElement;
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
const cameraHint = document.getElementById("camera-hint")!;
const tileCard = document.getElementById("tile-card") as HTMLDivElement;
const victoryModal = document.getElementById("victory-modal")!;
const victoryTitle = document.getElementById("victory-title")!;
const victoryText = document.getElementById("victory-text")!;
const victoryRestartBtn = document.getElementById("victory-restart-btn") as HTMLButtonElement;

let board3D: Board3D | null = null;
let game: GameState | null = null;
let awaitingBuyDecision = false;
let victoryAnnounced = false;

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

function renderBuildPanel() {
  if (!game) return;
  const player = game.currentPlayer;
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
      if (!game || !board3D) return;
      if (game.buildHouse(player, tile)) {
        playBuySound();
        board3D.updateHouses(tile.id, game.houses[tile.id] ?? 0);
        renderPlayersPanel();
        renderBuildPanel();
      }
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

function setButtonsForRollPhase() {
  rollBtn.classList.remove("hidden");
  rollBtn.disabled = false;
  buyBtn.classList.add("hidden");
  endTurnBtn.classList.add("hidden");
  hideTileCard();
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
}

async function handleRoll() {
  if (!game || !board3D) return;
  rollBtn.disabled = true;
  const [d1, d2] = game.rollDice();
  die1El.textContent = "?";
  die2El.textContent = "?";
  playDiceSound();

  board3D.rollDiceAnimation([d1, d2], async () => {
    die1El.textContent = String(d1);
    die2El.textContent = String(d2);
    await resolveMove(d1, d2);
  });
}

async function resolveMove(d1: number, d2: number) {
  if (!game || !board3D) return;
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
        player.money -= 50;
        log(`${player.name} paie 50 M de caution et sort de prison.`);
      } else {
        log(`${player.name} reste en prison (tentative ${player.jailTurns}/3).`);
        renderPlayersPanel();
        renderBuildPanel();
        setButtonsForPostMove(false);
        return;
      }
    }
  }

  const startPos = player.position;
  const path = computePathBetween(startPos, (startPos + total) % BOARD_SIZE, BOARD_SIZE);
  await board3D.animateTokenMove(player.index, path);

  const result = game.moveCurrentPlayer(total);
  const finalTile = result.tile;
  log(`${player.name} avance de ${total} (case ${finalTile.name}).`);
  renderTileCard(finalTile);

  if (finalTile.type === "go-to-jail") {
    game.sendToJail(player);
    const jailPos = tilePositionAfterJailSend();
    await board3D.animateTokenMove(player.index, [JAIL_TILE_ID]);
  } else if (finalTile.type === "tax") {
    game.payTax(finalTile.taxAmount ?? 0);
  } else if (finalTile.type === "chance") {
    const card = game.drawChance();
    log(`Chance: ${card.text}`);
    game.applyCard(card);
  } else if (finalTile.type === "chest") {
    const card = game.drawChest();
    log(`Caisse de communaute: ${card.text}`);
    game.applyCard(card);
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
      game.payRent(player, owner, rent);
    }
  }

  renderPlayersPanel();
  renderBuildPanel();
  updateOwnershipMarkers();
  checkGameOver();
  if (game.gameOver) return;

  if (isDouble && !player.bankrupt) {
    log(`${player.name} a fait un double, rejouez !`);
    setButtonsForRollPhase();
  } else {
    setButtonsForPostMove(false);
  }
}

function tilePositionAfterJailSend(): number {
  return JAIL_TILE_ID;
}

function updateOwnershipMarkers() {
  if (!game || !board3D) return;
  for (const tileIdStr of Object.keys(game.ownership)) {
    const tileId = Number(tileIdStr);
    const ownerIdx = game.ownership[tileId];
    const owner = game.players[ownerIdx];
    board3D.markOwnership(tileId, owner.color);
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
    }
  }
}

function handleBuy() {
  if (!game) return;
  const bought = game.buyCurrentTile();
  if (bought) {
    playBuySound();
    buyBtn.classList.add("hidden");
  }
  renderPlayersPanel();
  renderBuildPanel();
  updateOwnershipMarkers();
}

function handleEndTurn() {
  if (!game) return;
  game.nextTurn();
  renderPlayersPanel();
  renderBuildPanel();
  if (!game.gameOver) {
    setButtonsForRollPhase();
  }
}

function startGame(numPlayers: number) {
  setupModal.classList.add("hidden");
  board3D = new Board3D(canvas);
  game = new GameState(numPlayers, log);
  for (const p of game.players) {
    board3D.createToken(p.index, p.color);
  }
  renderPlayersPanel();
  renderBuildPanel();
  setButtonsForRollPhase();
  animate();
  showCameraHint();
}

function showCameraHint() {
  cameraHint.classList.remove("hidden");
  const hide = () => cameraHint.classList.add("hidden");
  setTimeout(hide, 6000);
  canvas.addEventListener("pointerdown", hide, { once: true });
}

function animate() {
  requestAnimationFrame(animate);
  board3D?.render();
}

playerCountButtons.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const count = target.getAttribute("data-count");
  if (count) {
    startGame(Number(count));
  }
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
