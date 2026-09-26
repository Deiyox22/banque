import "./style.css";
import { BOARD, BOARD_SIZE, JAIL_TILE_ID, GO_TO_JAIL_TILE_ID } from "./board";
import { GameState, Player } from "./game";
import { Board3D, computePathBetween } from "./scene";
import { playDiceSound, playBuySound, playVictorySound } from "./sound";

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

let board3D: Board3D | null = null;
let game: GameState | null = null;
let awaitingBuyDecision = false;
let victoryAnnounced = false;

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
    card.innerHTML = `
      <div class="name"><span class="swatch" style="background:${colorHex}"></span>${p.name}</div>
      <div class="money">${p.money} M</div>
      <div class="props">${p.properties.length} propriete(s)</div>
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

function setButtonsForRollPhase() {
  rollBtn.classList.remove("hidden");
  rollBtn.disabled = false;
  buyBtn.classList.add("hidden");
  endTurnBtn.classList.add("hidden");
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
    log("Partie terminee ! Rechargez la page pour rejouer.");
    if (!victoryAnnounced) {
      victoryAnnounced = true;
      playVictorySound();
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

rollBtn.addEventListener("click", handleRoll);
buyBtn.addEventListener("click", handleBuy);
endTurnBtn.addEventListener("click", handleEndTurn);
