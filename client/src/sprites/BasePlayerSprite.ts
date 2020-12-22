import Phaser, { Scene } from "phaser";
import Sprite = Phaser.GameObjects.Sprite;
import Text = Phaser.GameObjects.Text;
import Body = Phaser.Physics.Arcade.Body;

export default class BasePlayerSprite extends Sprite {
  private nicknameText: Text;
  playerSpeed = 50;

  body: Body;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    textureKey: string,
    nickname: string,
    textureCharacter: string
  ) {
    super(scene, x, y, textureKey, `${textureCharacter}-front-00.png`);

    this.scene.add.existing(this);
    this.scene.physics.world.enableBody(this);
    this.setScale(1 / 2, 1 / 2);

    // Set depth (z-index)
    this.setDepth(1);

    BasePlayerSprite.createAnimations(scene, textureKey, textureCharacter);
    this.setOrigin(0, 0);

    // Player nickname text
    this.nicknameText = this.scene.add.text(0, 0, nickname, {
      fontSize: 8,
      resolution: 10,
      depth: 11,
    });

    this.renderNickname();
  }

  renderNickname() {
    this.nicknameText.x = this.x;
    this.nicknameText.y = this.y - this.height / 4;
  }

  goFront() {
    this.body.setVelocityY(this.playerSpeed);
  }

  goBack() {
    this.body.setVelocityY(-this.playerSpeed);
  }

  goRight() {
    this.body.setVelocityX(this.playerSpeed);
  }

  goLeft() {
    this.body.setVelocityX(-this.playerSpeed);
  }

  destroy(fromScene?: boolean) {
    super.destroy(fromScene);
    this.nicknameText.destroy(fromScene);
  }

  private static createAnimations(
    scene: Scene,
    textureKey: string,
    textureCharacter: string
  ) {
    ["front", "back", "right", "left"].forEach((position) => {
      scene.anims.create({
        key: `${textureCharacter}-${position}`,
        frames: scene.anims.generateFrameNames(textureKey, {
          start: 0,
          end: 3,
          zeroPad: 2,
          prefix: `${textureCharacter}-${position}-`,
          suffix: ".png",
        }),
        frameRate: 10,
        repeat: -1,
      });
    });
  }
}
