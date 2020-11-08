import Phaser from "phaser";
import Sprite = Phaser.GameObjects.Sprite;
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;
import Body = Phaser.Physics.Arcade.Body;
import Text = Phaser.GameObjects.Text;
import { MapScene } from "../scenes/MapScene";
import Key = Phaser.Input.Keyboard.Key;
import Pointer = Phaser.Input.Pointer;

export default class Player extends Sprite {
  private speed = 50;
  // controls
  cursors: CursorKeys;
  keyA: Key;
  keyS: Key;
  keyD: Key;
  keyW: Key;
  pointer: Pointer;

  private oldPosition: { x: number; y: number };
  body: Body;
  private playerNickname: Text;

  constructor(scene: MapScene) {
    super(scene, 50, 100, scene.playerKey, `jedi-front-00.png`);

    this.scene.add.existing(this);
    this.scene.physics.world.enableBody(this);
    this.scene.physics.add.collider(this, scene.obstaclesLayer);
    this.setScale(1 / 2, 1 / 2);

    // Register cursors for player movement
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.keyA = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.A
    );
    this.keyS = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.S
    );
    this.keyD = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.D
    );
    this.keyW = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.W
    );
    this.pointer = this.scene.input.activePointer;

    // Player Offset
    this.body.setOffset(0, 0);

    // Player can't go out of the world
    this.body.setCollideWorldBounds(true);

    // Set depth (z-index)
    this.setDepth(5);

    // Player nickname text
    this.playerNickname = this.scene.add.text(
      this.x - this.width * 1.4,
      this.y - this.height / 2,
      scene.playerNickname,
      {
        fontSize: 8,
        resolution: 10,
      }
    );
    this.playerNickname.setDepth(11);

    Player.createAnimations(scene);
  }

  update(time: number, delta: number) {
    const prevVelocity = this.body.velocity.clone();

    this.showPlayerNickname();

    // Stop any previous movement from the last frame
    this.body.setVelocity(0, 0);

    // Keyboard
    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.goLeft();
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      this.goRight();
    }

    if (this.cursors.up.isDown || this.keyW.isDown) {
      this.goDown();
    } else if (this.cursors.down.isDown || this.keyS.isDown) {
      this.goUp();
    }

    // Mouse
    if (this.pointer.isDown) {
      if (this.pointer.worldX < this.body.x) {
        this.goLeft();
      } else if (this.pointer.worldX > this.body.x + 16) {
        this.goRight();
      }

      if (this.pointer.worldY < this.body.y) {
        this.goDown();
      } else if (this.pointer.worldY > this.body.y + 24) {
        this.goUp();
      }
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    this.body.velocity.normalize().scale(this.speed);

    // Update the animation last and give left/right animations precedence over up/down animations
    if (
      this.cursors.left.isDown ||
      this.keyA.isDown ||
      (this.pointer.isDown && this.pointer.worldX < this.body.x)
    ) {
      this.anims.play("jedi-left", true);
    } else if (
      this.cursors.right.isDown ||
      this.keyD.isDown ||
      (this.pointer.isDown && this.pointer.worldX > this.body.x + 16)
    ) {
      this.anims.play("jedi-right", true);
    } else if (
      this.cursors.up.isDown ||
      this.keyW.isDown ||
      (this.pointer.isDown && this.pointer.worldY < this.body.y)
    ) {
      this.anims.play("jedi-back", true);
    } else if (
      this.cursors.down.isDown ||
      this.keyS.isDown ||
      (this.pointer.isDown && this.pointer.worldY > this.body.y + 24)
    ) {
      this.anims.play("jedi-front", true);
    } else {
      this.anims.stop();

      // If we were moving, pick and idle frame to use
      if (prevVelocity.x < 0) {
        this.setTexture("currentPlayer", "jedi-left-00.png");
        this.sendPlayerStoppedEvent("left");
      } else if (prevVelocity.x > 0) {
        this.setTexture("currentPlayer", "jedi-right-00.png");
        this.sendPlayerStoppedEvent("right");
      } else if (prevVelocity.y < 0) {
        this.setTexture("currentPlayer", "jedi-back-00.png");
        this.sendPlayerStoppedEvent("back");
      } else if (prevVelocity.y > 0) {
        this.setTexture("currentPlayer", "jedi-front-00.png");
        this.sendPlayerStoppedEvent("front");
      }
    }
  }

  private goUp() {
    this.body.setVelocityY(this.speed);
    this.sendPlayerMovedEvent("front");
  }

  private goDown() {
    this.body.setVelocityY(-this.speed);
    this.sendPlayerMovedEvent("back");
  }

  private goRight() {
    this.body.setVelocityX(this.speed);
    this.sendPlayerMovedEvent("right");
  }

  private goLeft() {
    this.body.setVelocityX(-this.speed);
    this.sendPlayerMovedEvent("left");
  }

  sendPlayerMovedEvent(position: string) {
    (this.scene as MapScene).room.send("PLAYER_MOVED", {
      position: position,
      x: this.body.x,
      y: this.body.y,
    });
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

  private static createAnimations(scene: MapScene) {
    // Create the player's walking animations from the texture currentPlayer. These are stored in the global
    // animation manager so any sprite can access them.
    scene.anims.create({
      key: "jedi-front",
      frames: scene.anims.generateFrameNames(scene.playerKey, {
        start: 0,
        end: 3,
        zeroPad: 2,
        prefix: "jedi-front-",
        suffix: ".png",
      }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: "jedi-back",
      frames: scene.anims.generateFrameNames(scene.playerKey, {
        prefix: "jedi-back-",
        start: 0,
        end: 3,
        zeroPad: 2,
        suffix: ".png",
      }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: "jedi-right",
      frames: scene.anims.generateFrameNames(scene.playerKey, {
        prefix: "jedi-right-",
        start: 0,
        end: 3,
        zeroPad: 2,
        suffix: ".png",
      }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: "jedi-left",
      frames: scene.anims.generateFrameNames(scene.playerKey, {
        prefix: "jedi-left-",
        start: 0,
        end: 3,
        zeroPad: 2,
        suffix: ".png",
      }),
      frameRate: 10,
      repeat: -1,
    });
  }

  private sendPlayerStoppedEvent(position: string) {
    (this.scene as MapScene).room.send("PLAYER_MOVEMENT_ENDED", {
      position: position,
    });
  }
}
