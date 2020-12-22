import Phaser from "phaser";
import Sprite = Phaser.GameObjects.Sprite;
import { MapScene } from "../scenes/MapScene";

export default class OnlineLaserSprite extends Sprite {
  constructor(scene: MapScene, x: number, y: number, lastPosition: string) {
    super(
      scene,
      x,
      y,
      lastPosition === "right" || lastPosition === "left"
        ? scene.horizontalOnlineLaserKey
        : scene.onlineLaserKey
    );

    this.scene.add.existing(this);
  }

  move(x: number, y: number) {
    this.setPosition(x, y);
  }
}
