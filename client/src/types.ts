import BaseSound = Phaser.Sound.BaseSound;

export enum RoomEvents {
  PLAYER_MOVEMENT_ENDED = "PLAYER_MOVEMENT_ENDED",
  PLAYER_MOVED = "PLAYER_MOVED",
  CURRENT_PLAYERS = "CURRENT_PLAYERS",
  PLAYER_JOINED = "PLAYER_JOINED",
  PLAYER_LEFT = "PLAYER_LEFT",
}

export interface SpecialEffects {
  laserPlayer: BaseSound;
  laserEnemy: BaseSound;
}

export interface ServerPlayer {
  x: number;
  y: number;
  sessionId: string;
  nickname: string;
  position: string;
}
