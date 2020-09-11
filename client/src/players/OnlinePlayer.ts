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

    this.setTexture("players", "bob_front.png").setScale(1.9, 2.1);

    // Player Offset
    this.body.setOffset(0, 24);

    // Display playerId above player
    this.playerNickname = this.scene.add.text(
      this.x - 40,
      this.y - 25,
      config.playerId
    );
  }

  isWalking(position: string, x: number, y: number) {
    // Player
    this.anims.play(`onlinePlayer-${position}-walk`, true);
    this.setPosition(x, y);

    // PlayerId
    this.playerNickname.x = this.x - 40;
    this.playerNickname.y = this.y - 25;
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