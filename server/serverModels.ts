export enum ServerRoomEvents {
  PLAYER_MOVEMENT_ENDED = "PLAYER_MOVEMENT_ENDED",
  PLAYER_MOVED = "PLAYER_MOVED",
  CURRENT_PLAYERS = "CURRENT_PLAYERS",
  PLAYER_JOINED = "PLAYER_JOINED",
  PLAYER_LEFT = "PLAYER_LEFT",
  PLAYER_DIED = "PLAYER_DIED",
  LASER_MOVED = "LASER_MOVED",
  LASER_ENDED = "LASER_ENDED",
}

export interface ServerPlayer {
  x: number;
  y: number;
  map: string;
  sessionId: string;
  nickname: string;
  position: string;
}

export interface ServerPlayers {
  [key: string]: ServerPlayer;
}

export interface ServerLaser {
  x: number;
  y: number;
  sessionId: string;
  position: string;
  laserId: string;
}
