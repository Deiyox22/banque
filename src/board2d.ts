import { BOARD, GROUP_COLORS, Tile } from "./board";

const TYPE_ICONS: Record<string, string> = {
  go: "🏁",
  jail: "🚔",
  "free-parking": "🎉",
  "go-to-jail": "🚨",
  chance: "❓",
  chest: "📦",
  tax: "💰",
  railroad: "🚂",
  utility: "💡",
};

const TOKEN_EMOJI = ["🎩", "🚗", "🐶", "👢"];

function iconFor(tile: Tile): string {
  if (tile.type === "utility" && tile.name.toLowerCase().includes("eau")) return "🚰";
  return TYPE_ICONS[tile.type] ?? "";
}

function tileGridPosition(id: number): { col: number; row: number } {
  if (id === 0) return { col: 11, row: 11 };
  if (id <= 9) return { col: 11 - id, row: 11 };
  if (id === 10) return { col: 1, row: 11 };
  if (id <= 19) return { col: 1, row: 11 - (id - 10) };
  if (id === 20) return { col: 1, row: 1 };
  if (id <= 29) return { col: 1 + (id - 20), row: 1 };
  if (id === 30) return { col: 11, row: 1 };
  return { col: 11, row: 1 + (id - 30) };
}

function hex(color: number): string {
  return "#" + color.toString(16).padStart(6, "0");
}

interface TokenEntry {
  el: HTMLDivElement;
  playerIndex: number;
  x: number;
  y: number;
}

export function computePathBetween(from: number, to: number, boardSize: number): number[] {
  const path: number[] = [];
  let cur = from;
  while (cur !== to) {
    cur = (cur + 1) % boardSize;
    path.push(cur);
  }
  return path;
}

export class Board2D {
  private container: HTMLDivElement;
  private tokenLayer: HTMLDivElement;
  private tileElements = new Map<number, HTMLDivElement>();
  private ownershipMarkers = new Map<number, HTMLDivElement>();
  private houseLayers = new Map<number, HTMLDivElement>();
  private tokens: TokenEntry[] = [];
  private dice: [HTMLDivElement, HTMLDivElement];
  onTileClick: ((tile: Tile) => void) | null = null;

  constructor(container: HTMLDivElement) {
    this.container = container;
    this.container.innerHTML = "";
    this.container.className = "board2d";

    for (const tile of BOARD) {
      const el = this.buildTileElement(tile);
      this.container.appendChild(el);
      this.tileElements.set(tile.id, el);
    }

    const center = document.createElement("div");
    center.className = "board2d-center";
    center.innerHTML = `
      <div class="board2d-logo">MONOPOLY<span>edition cartoon</span></div>
      <div class="board2d-dice">
        <div class="die2d" id="board-die-1" data-value="1">
          ${this.pipMarkup()}
        </div>
        <div class="die2d" id="board-die-2" data-value="1">
          ${this.pipMarkup()}
        </div>
      </div>
    `;
    this.container.appendChild(center);
    this.dice = [
      center.querySelector("#board-die-1") as HTMLDivElement,
      center.querySelector("#board-die-2") as HTMLDivElement,
    ];

    this.tokenLayer = document.createElement("div");
    this.tokenLayer.className = "board2d-tokens";
    this.container.appendChild(this.tokenLayer);
  }

  private pipMarkup(): string {
    return `<span class="dot tl"></span><span class="dot tr"></span><span class="dot ml"></span><span class="dot mm"></span><span class="dot mr"></span><span class="dot bl"></span><span class="dot br"></span>`;
  }

  private buildTileElement(tile: Tile): HTMLDivElement {
    const el = document.createElement("div");
    const pos = tileGridPosition(tile.id);
    el.className = "tile2d" + (tile.id % 10 === 0 ? " corner" : "");
    el.style.gridColumn = String(pos.col);
    el.style.gridRow = String(pos.row);
    el.dataset.tileId = String(tile.id);

    if (tile.group) {
      el.style.setProperty("--band-color", hex(GROUP_COLORS[tile.group]));
      el.classList.add("has-band");
    }

    const icon = iconFor(tile);
    const price = tile.price ? `${tile.price} M` : tile.taxAmount ? `${tile.taxAmount} M` : "";

    el.innerHTML = `
      ${tile.group ? '<div class="tile2d-band"></div>' : ""}
      <div class="tile2d-body">
        ${icon ? `<div class="tile2d-icon">${icon}</div>` : ""}
        <div class="tile2d-name">${tile.name}</div>
        ${price ? `<div class="tile2d-price">${price}</div>` : ""}
      </div>
      <div class="tile2d-marker-zone"></div>
    `;

    el.addEventListener("click", () => this.onTileClick?.(tile));
    return el;
  }

  private tileCenter(tileId: number): { x: number; y: number } {
    const el = this.tileElements.get(tileId)!;
    return { x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight / 2 };
  }

  private tokenOffset(playerIndex: number): { dx: number; dy: number } {
    const angle = (playerIndex / 4) * Math.PI * 2;
    return { dx: Math.cos(angle) * 10, dy: Math.sin(angle) * 10 };
  }

  createToken(playerIndex: number, color: number) {
    const el = document.createElement("div");
    el.className = "token2d";
    el.style.setProperty("--token-color", hex(color));
    el.textContent = TOKEN_EMOJI[playerIndex % TOKEN_EMOJI.length];
    this.tokenLayer.appendChild(el);

    const center = this.tileCenter(0);
    const off = this.tokenOffset(playerIndex);
    const x = center.x + off.dx;
    const y = center.y + off.dy;
    el.style.transform = `translate(${x}px, ${y}px)`;
    this.tokens.push({ el, playerIndex, x, y });
  }

  rollDiceAnimation(values: [number, number], onSettled: () => void) {
    for (const die of this.dice) die.classList.add("rolling");
    const shuffle = window.setInterval(() => {
      for (const die of this.dice) {
        die.dataset.value = String(1 + Math.floor(Math.random() * 6));
      }
    }, 80);

    setTimeout(() => {
      window.clearInterval(shuffle);
      this.dice[0].dataset.value = String(values[0]);
      this.dice[1].dataset.value = String(values[1]);
      for (const die of this.dice) die.classList.remove("rolling");
      onSettled();
    }, 800);
  }

  async animateTokenMove(playerIndex: number, path: number[], stepDurationMs = 260): Promise<void> {
    const entry = this.tokens.find((t) => t.playerIndex === playerIndex);
    if (!entry) return;
    const off = this.tokenOffset(playerIndex);

    for (const tileId of path) {
      const center = this.tileCenter(tileId);
      const targetX = center.x + off.dx;
      const targetY = center.y + off.dy;
      await this.tweenToken(entry, targetX, targetY, stepDurationMs);
    }
  }

  private tweenToken(entry: TokenEntry, targetX: number, targetY: number, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const startX = entry.x;
      const startY = entry.y;
      const start = performance.now();
      const hopHeight = 18;

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const x = startX + (targetX - startX) * ease;
        const y = startY + (targetY - startY) * ease;
        const hop = Math.sin(Math.PI * t) * hopHeight;
        entry.el.style.transform = `translate(${x}px, ${y - hop}px) scale(${1 + Math.sin(Math.PI * t) * 0.15})`;
        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          entry.x = targetX;
          entry.y = targetY;
          entry.el.style.transform = `translate(${targetX}px, ${targetY}px)`;
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });
  }

  markOwnership(tileId: number, color: number) {
    let marker = this.ownershipMarkers.get(tileId);
    const tileEl = this.tileElements.get(tileId);
    if (!tileEl) return;
    if (!marker) {
      marker = document.createElement("div");
      marker.className = "tile2d-owner-marker";
      tileEl.querySelector(".tile2d-marker-zone")?.appendChild(marker);
      this.ownershipMarkers.set(tileId, marker);
    }
    marker.style.background = hex(color);
  }

  updateHouses(tileId: number, count: number) {
    const tileEl = this.tileElements.get(tileId);
    if (!tileEl) return;
    let layer = this.houseLayers.get(tileId);
    if (layer) {
      layer.remove();
      this.houseLayers.delete(tileId);
    }
    if (count <= 0) return;
    layer = document.createElement("div");
    layer.className = "tile2d-houses";
    if (count >= 5) {
      layer.innerHTML = `<span class="hotel2d">🏨</span>`;
    } else {
      layer.innerHTML = `<span class="house2d">🏠</span>`.repeat(count);
    }
    tileEl.querySelector(".tile2d-marker-zone")?.appendChild(layer);
    this.houseLayers.set(tileId, layer);
  }

  getTokenScreenPosition(playerIndex: number): { x: number; y: number } | null {
    const entry = this.tokens.find((t) => t.playerIndex === playerIndex);
    if (!entry) return null;
    const rect = entry.el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top };
  }

  highlightTile(tileId: number) {
    const el = this.tileElements.get(tileId);
    if (!el) return;
    el.classList.remove("landed");
    void el.offsetWidth;
    el.classList.add("landed");
  }
}
