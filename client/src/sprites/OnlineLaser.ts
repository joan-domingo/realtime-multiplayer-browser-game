import Phaser from "phaser";
import Sprite = Phaser.GameObjects.Sprite;
import { MapScene } from "../scenes/MapScene";

export default class OnlineLaser extends Sprite {
  constructor(scene: MapScene, x: number, y: number, lastPosition: string) {
    super(scene, x, y, scene.laserKey);

    this.scene.add.existing(this);
  }

  move(x: number, y: number) {
    this.setPosition(x, y);
  }
}
