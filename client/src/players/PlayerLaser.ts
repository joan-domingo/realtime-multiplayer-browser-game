import Phaser, { Scene } from "phaser";
import Sprite = Phaser.GameObjects.Sprite;

export default class PlayerLaser extends Sprite {
  scene: Scene;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, "sprLaserPlayer");
    this.scene.add.existing(this);
    this.scene.physics.world.enableBody(this, 0);
  }
}
