import { BOARD, BOARD_SIZE, GO_BONUS, GO_TO_JAIL_TILE_ID, JAIL_TILE_ID, START_MONEY, Tile } from "./board";

export interface Player {
  index: number;
  name: string;
  color: number;
  money: number;
  position: number;
  properties: number[];
  inJail: boolean;
  jailTurns: number;
  bankrupt: boolean;
}

export const PLAYER_COLORS = [0xff5555, 0x55aaff, 0x55ff88, 0xffcc33];
export const PLAYER_NAMES = ["Joueur 1", "Joueur 2", "Joueur 3", "Joueur 4"];

const CHANCE_TEXTS = [
  { text: "Avancez jusqu'a la case Depart. Recevez 200 M.", type: "goto-go" as const },
  { text: "La banque vous verse un dividende de 50 M.", type: "money" as const, amount: 50 },
  { text: "Amende pour exces de vitesse: payez 15 M.", type: "money" as const, amount: -15 },
  { text: "Vous avez gagne le prix de mots croises: 100 M.", type: "money" as const, amount: 100 },
  { text: "Allez en prison directement.", type: "goto-jail" as const },
  { text: "Erreur de la banque en votre faveur: recevez 200 M.", type: "money" as const, amount: 200 },
  { text: "Payez une amende de 50 M ou tirez une carte Chance.", type: "money" as const, amount: -50 },
  { text: "Vous heritez de 100 M.", type: "money" as const, amount: 100 },
];

const CHEST_TEXTS = [
  { text: "Erreur de la banque en votre faveur: recevez 200 M.", type: "money" as const, amount: 200 },
  { text: "Frais de medecin: payez 50 M.", type: "money" as const, amount: -50 },
  { text: "Vous vendez des actions: recevez 50 M.", type: "money" as const, amount: 50 },
  { text: "Frais d'hopital: payez 100 M.", type: "money" as const, amount: -100 },
  { text: "C'est votre anniversaire: chaque joueur vous donne 10 M.", type: "birthday" as const, amount: 10 },
  { text: "Retour de la case Depart: recevez 200 M.", type: "money" as const, amount: 200 },
  { text: "Allez en prison directement.", type: "goto-jail" as const },
  { text: "Vous heritez de 100 M.", type: "money" as const, amount: 100 },
];

export type LogFn = (msg: string) => void;

export interface MoveResult {
  passedGo: boolean;
  tile: Tile;
}

export class GameState {
  players: Player[] = [];
  currentPlayerIndex = 0;
  ownership: Record<number, number> = {}; // tileId -> playerIndex
  houses: Record<number, number> = {}; // tileId -> 0-4 houses, 5 = hotel
  log: LogFn;
  doublesCount = 0;
  gameOver = false;

  constructor(numPlayers: number, log: LogFn) {
    this.log = log;
    for (let i = 0; i < numPlayers; i++) {
      this.players.push({
        index: i,
        name: PLAYER_NAMES[i],
        color: PLAYER_COLORS[i],
        money: START_MONEY,
        position: 0,
        properties: [],
        inJail: false,
        jailTurns: 0,
        bankrupt: false,
      });
    }
  }

  get currentPlayer(): Player {
    return this.players[this.currentPlayerIndex];
  }

  activePlayers(): Player[] {
    return this.players.filter((p) => !p.bankrupt);
  }

  rollDice(): [number, number] {
    return [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)];
  }

  moveCurrentPlayer(steps: number): MoveResult {
    const player = this.currentPlayer;
    const start = player.position;
    let newPos = (start + steps) % BOARD_SIZE;
    const passedGo = start + steps >= BOARD_SIZE;
    player.position = newPos;
    if (passedGo) {
      player.money += GO_BONUS;
      this.log(`${player.name} passe par la case Depart et recoit ${GO_BONUS} M.`);
    }
    return { passedGo, tile: BOARD[newPos] };
  }

  sendToJail(player: Player) {
    player.position = JAIL_TILE_ID;
    player.inJail = true;
    player.jailTurns = 0;
    this.log(`${player.name} est envoye en prison !`);
  }

  tileOwner(tileId: number): Player | null {
    const ownerIdx = this.ownership[tileId];
    if (ownerIdx === undefined) return null;
    return this.players[ownerIdx];
  }

  canBuy(tile: Tile): boolean {
    if (tile.type !== "property" && tile.type !== "railroad" && tile.type !== "utility") return false;
    if (this.ownership[tile.id] !== undefined) return false;
    return this.currentPlayer.money >= (tile.price ?? 0);
  }

  buyCurrentTile(): boolean {
    const player = this.currentPlayer;
    const tile = BOARD[player.position];
    if (!this.canBuy(tile)) return false;
    player.money -= tile.price ?? 0;
    player.properties.push(tile.id);
    this.ownership[tile.id] = player.index;
    this.log(`${player.name} achete ${tile.name} pour ${tile.price} M.`);
    return true;
  }

  countGroupOwned(player: Player, group: string): number {
    return BOARD.filter((t) => t.group === group).filter((t) => this.ownership[t.id] === player.index).length;
  }

  countRailroadsOwned(player: Player): number {
    return BOARD.filter((t) => t.type === "railroad").filter((t) => this.ownership[t.id] === player.index).length;
  }

  countUtilitiesOwned(player: Player): number {
    return BOARD.filter((t) => t.type === "utility").filter((t) => this.ownership[t.id] === player.index).length;
  }

  houseCost(tile: Tile): number {
    return Math.round(((tile.price ?? 0) / 2) / 10) * 10;
  }

  canBuildHouse(player: Player, tile: Tile): boolean {
    if (tile.type !== "property" || !tile.group) return false;
    if (this.ownership[tile.id] !== player.index) return false;
    if (!playerOwnsGroup(this, player, tile.group)) return false;
    const current = this.houses[tile.id] ?? 0;
    if (current >= 5) return false;
    if (player.money < this.houseCost(tile)) return false;
    return true;
  }

  buildHouse(player: Player, tile: Tile): boolean {
    if (!this.canBuildHouse(player, tile)) return false;
    player.money -= this.houseCost(tile);
    const newCount = (this.houses[tile.id] ?? 0) + 1;
    this.houses[tile.id] = newCount;
    this.log(`${player.name} construit ${newCount === 5 ? "un hotel" : "une maison"} sur ${tile.name}.`);
    return true;
  }

  rentSchedule(tile: Tile): { label: string; rent: number }[] {
    if (tile.type !== "property") return [];
    const base = tile.rent ?? 0;
    const multipliers = [5, 15, 30, 45, 60];
    return [
      { label: "Loyer de base", rent: base },
      { label: "Groupe complet", rent: base * 2 },
      { label: "1 maison", rent: base * multipliers[0] },
      { label: "2 maisons", rent: base * multipliers[1] },
      { label: "3 maisons", rent: base * multipliers[2] },
      { label: "4 maisons", rent: base * multipliers[3] },
      { label: "Hotel", rent: base * multipliers[4] },
    ];
  }

  computeRent(tile: Tile, diceTotal: number): number {
    if (tile.type === "property") {
      const owner = this.tileOwner(tile.id)!;
      const base = tile.rent ?? 0;
      const houseCount = this.houses[tile.id] ?? 0;
      if (houseCount > 0) {
        const multipliers = [5, 15, 30, 45, 60];
        return base * multipliers[houseCount - 1];
      }
      const groupSize = BOARD.filter((t) => t.group === tile.group).length;
      const owned = this.countGroupOwned(owner, tile.group!);
      return owned === groupSize ? base * 2 : base;
    }
    if (tile.type === "railroad") {
      const owner = this.tileOwner(tile.id)!;
      const owned = this.countRailroadsOwned(owner);
      return [0, 25, 50, 100, 200][owned] ?? 200;
    }
    if (tile.type === "utility") {
      const owner = this.tileOwner(tile.id)!;
      const owned = this.countUtilitiesOwned(owner);
      return diceTotal * (owned >= 2 ? 10 : 4);
    }
    return 0;
  }

  payRent(payer: Player, owner: Player, amount: number): number {
    const actual = Math.min(amount, Math.max(0, payer.money));
    payer.money -= amount;
    owner.money += amount;
    this.log(`${payer.name} paie ${amount} M de loyer a ${owner.name}.`);
    if (payer.money < 0) {
      this.handleBankruptcy(payer, owner);
    }
    return actual;
  }

  handleBankruptcy(player: Player, creditor: Player | null) {
    player.bankrupt = true;
    for (const tileId of player.properties) {
      delete this.ownership[tileId];
      delete this.houses[tileId];
      if (creditor) {
        this.ownership[tileId] = creditor.index;
        creditor.properties.push(tileId);
      }
    }
    player.properties = [];
    this.log(`${player.name} est en faillite !`);
    const remaining = this.activePlayers();
    if (remaining.length <= 1) {
      this.gameOver = true;
      if (remaining.length === 1) {
        this.log(`${remaining[0].name} remporte la partie !`);
      }
    }
  }

  drawChance(): { text: string; type: string; amount?: number } {
    return CHANCE_TEXTS[Math.floor(Math.random() * CHANCE_TEXTS.length)];
  }

  drawChest(): { text: string; type: string; amount?: number } {
    return CHEST_TEXTS[Math.floor(Math.random() * CHEST_TEXTS.length)];
  }

  applyCard(card: { text: string; type: string; amount?: number }) {
    const player = this.currentPlayer;
    if (card.type === "money" && card.amount !== undefined) {
      player.money += card.amount;
      if (player.money < 0) this.handleBankruptcy(player, null);
    } else if (card.type === "goto-go") {
      player.position = 0;
      player.money += GO_BONUS;
    } else if (card.type === "goto-jail") {
      this.sendToJail(player);
    } else if (card.type === "birthday" && card.amount !== undefined) {
      for (const other of this.players) {
        if (other.index !== player.index && !other.bankrupt) {
          other.money -= card.amount;
          player.money += card.amount;
        }
      }
    }
  }

  payTax(amount: number) {
    const player = this.currentPlayer;
    player.money -= amount;
    this.log(`${player.name} paie une taxe de ${amount} M.`);
    if (player.money < 0) this.handleBankruptcy(player, null);
  }

  nextTurn() {
    if (this.gameOver) return;
    const n = this.players.length;
    let next = this.currentPlayerIndex;
    do {
      next = (next + 1) % n;
    } while (this.players[next].bankrupt && next !== this.currentPlayerIndex);
    this.currentPlayerIndex = next;
    this.doublesCount = 0;
  }

  tileAt(position: number): Tile {
    return BOARD[position];
  }
}

export function tileById(id: number): Tile {
  return BOARD[id];
}

export function playerOwnsGroup(state: GameState, player: Player, group: string): boolean {
  const groupSize = BOARD.filter((t) => t.group === group).length;
  return state.countGroupOwned(player, group) === groupSize;
}
