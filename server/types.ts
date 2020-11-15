export interface Player {
  x: number;
  y: number;
  map: string;
  sessionId: string;
  nickname: string;
  position: string;
}

export interface Players {
  [key: string]: Player;
}

export interface PlayerLaser {
  x: number;
  y: number;
  sessionId: string;
  position: string;
}
