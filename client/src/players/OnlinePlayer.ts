import Phaser, { Scene } from "phaser";
import StaticTilemapLayer = Phaser.Tilemaps.StaticTilemapLayer;
import Text = Phaser.GameObjects.Text;
import Sprite = Phaser.GameObjects.Sprite;
import Body = Phaser.Physics.Arcade.Body;
import { MapScene } from "../scenes/MapScene";

export default class OnlinePlayer extends Sprite {
  playerNickname: Text;
  body: Body;
  scene: MapScene;

  constructor(config: {
    scene: Scene;
    worldLayer?: StaticTilemapLayer;
    key: string;
    x: number;
    y: number;
    playerId: string;
  }) {
    super(config.scene, config.x, config.y, config.playerId);

    this.scene.add.existing(this);
    this.scene.physics.world.enableBody(this);
    this.scene.physics.add.collider(this, config.worldLayer);

    this.setTexture("players", "stormtrooper-front-00.png").setScale(
      1 / 2,
      1 / 2
    );

    // Player Offset
    this.body.setOffset(0, 0);

    // Display playerId above player
    this.playerNickname = this.scene.add.text(
      this.x - this.width * 1.4,
      this.y - this.height / 2,
      config.playerId,
      {
        fontSize: 8,
        resolution: 10,
      }
    );

    this.playerNickname.setDepth(11);
  }

  isWalking(position: string, x: number, y: number) {
    // Player
    this.anims.play(`stormtrooper-${position}`, true);
    this.setPosition(x, y);

    // PlayerId
    this.playerNickname.x = this.x - this.playerNickname.width / 2;
    this.playerNickname.y = this.y - this.height / 2;
  }

  stopWalking(position: string) {
    this.anims.stop();
    this.setTexture("players", `stormtrooper-${position}-00.png`);
  }

  destroy() {
    super.destroy();
    this.playerNickname.destroy();
  }
}
