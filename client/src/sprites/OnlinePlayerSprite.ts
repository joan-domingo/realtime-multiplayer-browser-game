import { MapScene } from "../scenes/MapScene";
import { ServerPlayer } from "../clientModels";
import BasePlayerSprite from "./BasePlayerSprite";

export default class OnlinePlayerSprite extends BasePlayerSprite {
  readonly sessionId: string;

  constructor(scene: MapScene, player: ServerPlayer) {
    super(
      scene,
      player.x,
      player.y,
      scene.onlinePlayerKey,
      player.nickname,
      "stormtrooper"
    );

    this.sessionId = player.sessionId;
  }

  isWalking(position: string, x: number, y: number) {
    this.anims.play(`stormtrooper-${position}`, true);
    this.setPosition(x, y);

    this.renderNickname();
  }

  stopWalking(position: string) {
    this.anims.stop();
    this.setTexture(position);
  }

  die() {
    this.body.setVelocity(0, 0);
    this.body.setEnable(false);
    this.setTint(0xff0000);
  }

  revive(x: number, y: number) {
    this.body.setEnable(true);
    this.clearTint();
    this.setPosition(x, y);

    this.setTextureFrame("front");
    this.renderNickname();
  }
}
