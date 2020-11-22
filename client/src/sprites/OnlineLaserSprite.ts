import Phaser from "phaser";
import Sprite = Phaser.GameObjects.Sprite;
import { MapScene } from "../scenes/MapScene";

export default class OnlineLaserSprite extends Sprite {
  constructor(scene: MapScene, x: number, y: number, lastPosition: string) {
    super(scene, x, y, scene.onlineLaserKey);

    console.log(lastPosition);
    if (lastPosition === "right" || lastPosition === "left") {
      this.setRotation(1.57);
    }

    this.scene.add.existing(this);
  }

  move(x: number, y: number) {
    this.setPosition(x, y);
  }
}
