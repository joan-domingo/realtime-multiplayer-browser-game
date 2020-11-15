import Phaser from "phaser";
import Sprite = Phaser.GameObjects.Sprite;
import { MapScene } from "../scenes/MapScene";
import OnlinePlayer from "./OnlinePlayer";
import { RoomEvents } from "../types";

export default class PlayerLaser extends Sprite {
  body: Phaser.Physics.Arcade.Body;
  private laserVelocity = 100;

  constructor(scene: MapScene, x: number, y: number, lastPosition: string) {
    super(scene, x, y, scene.laserKey);

    this.scene.add.existing(this);
    this.scene.physics.world.enableBody(this);

    this.setInteractive();
    this.body.setCollideWorldBounds(true);

    this.scene.physics.add.collider(this, scene.obstaclesLayer, () =>
      this.destroy()
    );

    this.scene.physics.add.collider(this, scene.enemies, (laser, enemy) => {
      laser.destroy();
      // explosion
      const sessionId = (enemy as OnlinePlayer).getSessionId();
      scene.room.send(RoomEvents.PLAYER_DIED, { sessionId });
    });

    switch (lastPosition) {
      case "back":
        this.body.setVelocityY(-this.laserVelocity);
        break;
      case "front":
        this.body.setVelocityY(this.laserVelocity);
        break;
      case "left":
        this.body.setVelocityX(-this.laserVelocity);
        break;
      case "right":
        this.body.setVelocityX(this.laserVelocity);
        break;
      default:
        console.warn("No position with name " + lastPosition);
    }

    scene.sfx.laserPlayer.play();
  }

  update() {
    (this.scene as MapScene).room.send(RoomEvents.LASER_MOVED, {
      position: "xxx",
      x: this.body.x,
      y: this.body.y,
    });
  }
}
