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
