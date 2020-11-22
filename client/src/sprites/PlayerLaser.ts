import Phaser from "phaser";
import Sprite = Phaser.GameObjects.Sprite;
import { MapScene } from "../scenes/MapScene";
import OnlinePlayer from "./OnlinePlayer";
import { ClientRoomEvents } from "../clientModels";

export default class PlayerLaser extends Sprite {
  body: Phaser.Physics.Arcade.Body;
  private laserVelocity = 100;
  private laserId: string;

  constructor(scene: MapScene, x: number, y: number, lastPosition: string) {
    super(scene, x, y, scene.laserKey);
    this.laserId = `${scene.room.sessionId}-${scene.time.now}`;

    this.scene.add.existing(this);
    this.scene.physics.world.enableBody(this);

    this.setInteractive();
    this.body.setCollideWorldBounds(true);

    this.scene.physics.add.collider(this, scene.obstaclesLayer, () => {
      this.destroy();
      scene.room.send(ClientRoomEvents.LASER_ENDED, { laserId: this.laserId });
    });

    this.scene.physics.add.collider(this, scene.enemies, (laser, enemy) => {
      laser.destroy();
      // TODO explosion
      const sessionId = (enemy as OnlinePlayer).getSessionId();
      scene.room.send(ClientRoomEvents.PLAYER_DIED, { sessionId });
      scene.room.send(ClientRoomEvents.LASER_ENDED, { laserId: this.laserId });
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

    // scene.sfx.laserPlayer.play();
  }

  update() {
    (this.scene as MapScene).room.send(ClientRoomEvents.LASER_MOVED, {
      laserId: this.laserId,
      position: "xxx",
      x: this.body.x,
      y: this.body.y,
    });
  }
}
