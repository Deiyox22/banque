import { PLAYER_COLORS } from "./game";

export type GameEvent =
  | { type: "roll"; actor: number; d1: number; d2: number; seed: number }
  | { type: "buy"; actor: number; tileId: number }
  | { type: "buildHouse"; actor: number; tileId: number }
  | { type: "endTurn"; actor: number };

export interface RosterEntry {
  clientId: string;
  name: string;
  color: number;
}

export function randomRoomCode(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 4; i++) code += letters[Math.floor(Math.random() * letters.length)];
  return code;
}

export function randomClientId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

type RoomMessage =
  | { type: "join"; clientId: string; name: string }
  | { type: "roster"; roster: RosterEntry[] }
  | { type: "start"; roster: RosterEntry[] }
  | { type: "game-event"; event: GameEvent };

/**
 * Same-device multiplayer transport: syncs a room across browser tabs/windows
 * on one machine via BroadcastChannel. No external service required.
 * A message posted on this channel is NOT delivered back to its own sender,
 * so every send() also applies the effect locally to keep behavior symmetric.
 */
export class BroadcastRoom {
  readonly code: string;
  readonly clientId: string;
  readonly isHost: boolean;
  roster: RosterEntry[] = [];
  private channel: BroadcastChannel;

  onRosterChange: ((roster: RosterEntry[]) => void) | null = null;
  onStart: ((roster: RosterEntry[]) => void) | null = null;
  onGameEvent: ((event: GameEvent) => void) | null = null;

  constructor(code: string, clientId: string, isHost: boolean) {
    this.code = code;
    this.clientId = clientId;
    this.isHost = isHost;
    this.channel = new BroadcastChannel("monopoly-room-" + code);
    this.channel.onmessage = (e: MessageEvent<RoomMessage>) => this.handleMessage(e.data);
  }

  private handleMessage(msg: RoomMessage) {
    if (msg.type === "join" && this.isHost) {
      if (this.roster.length < 4 && !this.roster.find((p) => p.clientId === msg.clientId)) {
        this.roster.push({ clientId: msg.clientId, name: msg.name, color: PLAYER_COLORS[this.roster.length] });
        this.broadcastRoster();
      }
    } else if (msg.type === "roster") {
      this.roster = msg.roster;
      this.onRosterChange?.(this.roster);
    } else if (msg.type === "start") {
      this.onStart?.(msg.roster);
    } else if (msg.type === "game-event") {
      this.onGameEvent?.(msg.event);
    }
  }

  private broadcastRoster() {
    this.channel.postMessage({ type: "roster", roster: this.roster } satisfies RoomMessage);
    this.onRosterChange?.(this.roster);
  }

  hostSelf(name: string) {
    this.roster = [{ clientId: this.clientId, name, color: PLAYER_COLORS[0] }];
    this.onRosterChange?.(this.roster);
  }

  requestJoin(name: string) {
    this.channel.postMessage({ type: "join", clientId: this.clientId, name } satisfies RoomMessage);
  }

  startGame() {
    this.channel.postMessage({ type: "start", roster: this.roster } satisfies RoomMessage);
    this.onStart?.(this.roster);
  }

  sendGameEvent(event: GameEvent) {
    this.channel.postMessage({ type: "game-event", event } satisfies RoomMessage);
    this.onGameEvent?.(event);
  }

  myIndex(): number {
    return this.roster.findIndex((p) => p.clientId === this.clientId);
  }

  close() {
    this.channel.close();
  }
}
