import GameObject = Phaser.GameObjects.GameObject;
import BaseSound = Phaser.Sound.BaseSound;

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

export interface SpecialEffects {
  laserPlayer: BaseSound;
  laserEnemy: BaseSound;
}
