import GameObject = Phaser.GameObjects.GameObject;

export interface WorldObject extends GameObject {
  x: number;
  y: number;
  height: number;
  width: number;
  properties: WorldObjectProperties[];
}
export interface DoorsObject extends GameObject {
  x: number;
  y: number;
  height: number;
  width: number;
}

export interface WorldObjectProperties {
  name: string;
  type: string;
  value: string;
}
