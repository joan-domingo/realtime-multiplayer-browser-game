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

    this.setTexture("players", "bob_front.png").setScale(0.8, 0.8);

    // Player Offset
    this.body.setOffset(0, 24);

    // Display playerId above player
    this.playerNickname = this.scene.add.text(
      this.x - this.width * 1.4,
      this.y - this.height / 2,
      config.playerId,
      {
        fontSize: 8,
        resolution: 1,
      }
    );
  }

  isWalking(position: string, x: number, y: number) {
    // Player
    this.anims.play(`onlinePlayer-${position}-walk`, true);
    this.setPosition(x, y);

    // PlayerId
    this.playerNickname.x = this.x - this.playerNickname.width / 2;
    this.playerNickname.y = this.y - this.height / 2;
  }

  stopWalking(position: string) {
    this.anims.stop();
    this.setTexture("players", `bob_${position}.png`);
  }

  destroy() {
    super.destroy();
    this.playerNickname.destroy();
  }
}
