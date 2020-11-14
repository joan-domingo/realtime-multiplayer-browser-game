import Phaser from "phaser";
import Text = Phaser.GameObjects.Text;
import Sprite = Phaser.GameObjects.Sprite;
import Body = Phaser.Physics.Arcade.Body;
import { MapScene } from "../scenes/MapScene";
import { ServerPlayer } from "../types";

export default class OnlinePlayer extends Sprite {
  body: Body;
  private playerNickname: Text;
  private readonly onlinePlayerKey: string;

  constructor(scene: MapScene, player: ServerPlayer) {
    super(
      scene,
      player.x,
      player.y,
      scene.onlinePlayerKey,
      `stormtrooper-front-00.png`
    );

    this.scene.add.existing(this);
    this.scene.physics.world.enableBody(this);
    this.scene.physics.add.collider(this, scene.obstaclesLayer);
    this.setScale(1 / 2, 1 / 2);

    // Player nickname text
    this.playerNickname = this.scene.add.text(0, 0, player.nickname, {
      fontSize: 8,
      resolution: 10,
    });
    this.showOnlinePlayerNickname();

    this.playerNickname.setDepth(11);

    OnlinePlayer.createAnimations(scene);

    this.onlinePlayerKey = scene.onlinePlayerKey;

    this.setOrigin(0, 0);
  }

  showOnlinePlayerNickname() {
    this.playerNickname.x = this.x;
    this.playerNickname.y = this.y - this.height / 4;
  }

  isWalking(position: string, x: number, y: number) {
    this.anims.play(`stormtrooper-${position}`, true);
    this.setPosition(x, y);

    this.showOnlinePlayerNickname();
  }

  stopWalking(position: string) {
    this.anims.stop();
    this.setTexture(this.onlinePlayerKey, `stormtrooper-${position}-00.png`);
  }

  private static createAnimations(scene: MapScene) {
    // Create the player's walking animations from the texture onlinePlayer.
    ["front", "back", "right", "left"].forEach((position) => {
      scene.anims.create({
        key: `stormtrooper-${position}`,
        frames: scene.anims.generateFrameNames(scene.onlinePlayerKey, {
          start: 0,
          end: 3,
          zeroPad: 2,
          prefix: `stormtrooper-${position}-`,
          suffix: ".png",
        }),
        frameRate: 10,
        repeat: -1,
      });
    });
  }

  destroy() {
    super.destroy();
    this.playerNickname.destroy();
  }
}
