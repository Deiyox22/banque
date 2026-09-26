export type TileType =
  | "go"
  | "property"
  | "railroad"
  | "utility"
  | "tax"
  | "chance"
  | "chest"
  | "jail"
  | "free-parking"
  | "go-to-jail";

export type ColorGroup =
  | "brown"
  | "lightblue"
  | "pink"
  | "orange"
  | "red"
  | "yellow"
  | "green"
  | "darkblue"
  | null;

export interface Tile {
  id: number;
  name: string;
  type: TileType;
  price?: number;
  rent?: number;
  group?: ColorGroup;
  taxAmount?: number;
}

export const GROUP_COLORS: Record<Exclude<ColorGroup, null>, number> = {
  brown: 0x955436,
  lightblue: 0xaae0fa,
  pink: 0xd93a96,
  orange: 0xf7941d,
  red: 0xed1b24,
  yellow: 0xfef200,
  green: 0x1fb25a,
  darkblue: 0x0072bb,
};

export const BOARD: Tile[] = [
  { id: 0, name: "Depart", type: "go" },
  { id: 1, name: "Boulevard de Belleville", type: "property", price: 60, rent: 4, group: "brown" },
  { id: 2, name: "Caisse de Communaute", type: "chest" },
  { id: 3, name: "Rue Lecourbe", type: "property", price: 60, rent: 8, group: "brown" },
  { id: 4, name: "Impot sur le revenu", type: "tax", taxAmount: 200 },
  { id: 5, name: "Gare Montparnasse", type: "railroad", price: 200 },
  { id: 6, name: "Rue de Vaugirard", type: "property", price: 100, rent: 6, group: "lightblue" },
  { id: 7, name: "Chance", type: "chance" },
  { id: 8, name: "Rue de Courcelles", type: "property", price: 100, rent: 6, group: "lightblue" },
  { id: 9, name: "Avenue de la Republique", type: "property", price: 120, rent: 8, group: "lightblue" },
  { id: 10, name: "Prison / Simple visite", type: "jail" },
  { id: 11, name: "Boulevard de la Villette", type: "property", price: 140, rent: 10, group: "pink" },
  { id: 12, name: "Compagnie de Distribution d'Electricite", type: "utility", price: 150 },
  { id: 13, name: "Avenue de Neuilly", type: "property", price: 140, rent: 10, group: "pink" },
  { id: 14, name: "Rue de Paradis", type: "property", price: 160, rent: 12, group: "pink" },
  { id: 15, name: "Gare de Lyon", type: "railroad", price: 200 },
  { id: 16, name: "Avenue Mozart", type: "property", price: 180, rent: 14, group: "orange" },
  { id: 17, name: "Caisse de Communaute", type: "chest" },
  { id: 18, name: "Boulevard Saint-Michel", type: "property", price: 180, rent: 14, group: "orange" },
  { id: 19, name: "Place Pigalle", type: "property", price: 200, rent: 16, group: "orange" },
  { id: 20, name: "Parc Gratuit", type: "free-parking" },
  { id: 21, name: "Avenue Matignon", type: "property", price: 220, rent: 18, group: "red" },
  { id: 22, name: "Chance", type: "chance" },
  { id: 23, name: "Boulevard Malesherbes", type: "property", price: 220, rent: 18, group: "red" },
  { id: 24, name: "Avenue Henri-Martin", type: "property", price: 240, rent: 20, group: "red" },
  { id: 25, name: "Gare du Nord", type: "railroad", price: 200 },
  { id: 26, name: "Faubourg Saint-Honore", type: "property", price: 260, rent: 22, group: "yellow" },
  { id: 27, name: "Place de la Bourse", type: "property", price: 260, rent: 22, group: "yellow" },
  { id: 28, name: "Compagnie de Distribution des Eaux", type: "utility", price: 150 },
  { id: 29, name: "Rue La Fayette", type: "property", price: 280, rent: 24, group: "yellow" },
  { id: 30, name: "Allez en Prison", type: "go-to-jail" },
  { id: 31, name: "Avenue de Breteuil", type: "property", price: 300, rent: 26, group: "green" },
  { id: 32, name: "Avenue Foch", type: "property", price: 300, rent: 26, group: "green" },
  { id: 33, name: "Caisse de Communaute", type: "chest" },
  { id: 34, name: "Boulevard des Capucines", type: "property", price: 320, rent: 28, group: "green" },
  { id: 35, name: "Gare Saint-Lazare", type: "railroad", price: 200 },
  { id: 36, name: "Chance", type: "chance" },
  { id: 37, name: "Avenue des Champs-Elysees", type: "property", price: 350, rent: 35, group: "darkblue" },
  { id: 38, name: "Taxe de luxe", type: "tax", taxAmount: 100 },
  { id: 39, name: "Rue de la Paix", type: "property", price: 400, rent: 50, group: "darkblue" },
];

export const CHANCE_CARDS: { text: string; effect: (playerIndex: number) => void }[] = [];
export const START_MONEY = 1500;
export const GO_BONUS = 200;
export const JAIL_TILE_ID = 10;
export const GO_TO_JAIL_TILE_ID = 30;
export const BOARD_SIZE = BOARD.length;
