import Phaser from "phaser";
import Sprite = Phaser.GameObjects.Sprite;
import StaticTilemapLayer = Phaser.Tilemaps.StaticTilemapLayer;
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;
import Body = Phaser.Physics.Arcade.Body;
import Text = Phaser.GameObjects.Text;
import { MapScene } from "../scenes/MapScene";

export default class Player extends Sprite {
  cursors: CursorKeys;
  scene: MapScene;
  body: Body;
  oldPosition: { x: number; y: number };
  speed: number;
  playerNickname: Text;
  map: string;

  constructor(config: {
    scene: MapScene;
    worldLayer: StaticTilemapLayer;
    key: string;
    x: number;
    y: number;
  }) {
    super(config.scene, config.x, config.y, config.key);

    this.scene.add.existing(this);
    this.scene.physics.world.enableBody(this);
    this.scene.physics.add.collider(this, config.worldLayer);

    this.setTexture("currentPlayer", `jedi-front-00.png`).setScale(
      1 / 2,
      1 / 2
    );

    // Register cursors for player movement
    this.cursors = this.scene.input.keyboard.createCursorKeys();

    // Player Offset
    this.body.setOffset(0, 0);

    // Player can't go out of the world
    this.body.setCollideWorldBounds(true);

    // Set depth (z-index)
    this.setDepth(5);

    // store previous position
    this.oldPosition = undefined;

    // Player speed
    this.speed = 50;

    // Player nickname text
    this.playerNickname = this.scene.add.text(
      this.x - this.width * 1.4,
      this.y - this.height / 2,
      "Player",
      {
        fontSize: 8,
        resolution: 10,
      }
    );
    this.playerNickname.setDepth(11);
  }

  update(time: number, delta: number) {
    const prevVelocity = this.body.velocity.clone();

    // Show player nickname above player
    this.showPlayerNickname();

    // Stop any previous movement from the last frame
    this.body.setVelocity(0);

    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.body.setVelocityX(-this.speed);
    } else if (this.cursors.right.isDown) {
      this.body.setVelocityX(this.speed);
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      this.body.setVelocityY(-this.speed);
    } else if (this.cursors.down.isDown) {
      this.body.setVelocityY(this.speed);
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    this.body.velocity.normalize().scale(this.speed);

    // Update the animation last and give left/right animations precedence over up/down animations
    if (this.cursors.left.isDown) {
      this.anims.play("jedi-left", true);
    } else if (this.cursors.right.isDown) {
      this.anims.play("jedi-right", true);
    } else if (this.cursors.up.isDown) {
      this.anims.play("jedi-back", true);
    } else if (this.cursors.down.isDown) {
      this.anims.play("jedi-front", true);
    } else {
      this.anims.stop();

      // If we were moving, pick and idle frame to use
      if (prevVelocity.x < 0)
        this.setTexture("currentPlayer", "jedi-left-00.png");
      else if (prevVelocity.x > 0)
        this.setTexture("currentPlayer", "jedi-right-00.png");
      else if (prevVelocity.y < 0)
        this.setTexture("currentPlayer", "jedi-back-00.png");
      else if (prevVelocity.y > 0)
        this.setTexture("currentPlayer", "jedi-front-00.png");
    }
  }

  showPlayerNickname() {
    this.playerNickname.x = this.x - this.playerNickname.width / 2;
    this.playerNickname.y = this.y - this.height / 2;
  }

  isMoved() {
    if (
      this.oldPosition &&
      (this.oldPosition.x !== this.x || this.oldPosition.y !== this.y)
    ) {
      this.oldPosition = { x: this.x, y: this.y };
      return true;
    } else {
      this.oldPosition = { x: this.x, y: this.y };
      return false;
    }
  }
}
