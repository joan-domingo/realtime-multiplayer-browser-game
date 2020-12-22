import Phaser from "phaser";
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;
import { MapScene } from "../scenes/MapScene";
import Key = Phaser.Input.Keyboard.Key;
import Pointer = Phaser.Input.Pointer;
import { ClientRoomEvents } from "../clientModels";
import Group = Phaser.GameObjects.Group;
import PlayerLaserSprite from "./PlayerLaserSprite";
import TiledObject = Phaser.Types.Tilemaps.TiledObject;
import { chat } from "../app";
import BasePlayerSprite from "./BasePlayerSprite";

export default class PlayerSprite extends BasePlayerSprite {
  // controls
  private cursors: CursorKeys;
  private keySpace: Key;
  private pointer: Pointer;
  // player
  private playerKey: string;
  private lastPosition: "back" | "front" | "left" | "right" = "front";
  // Lasers
  private lasers: Group;
  private nextFire = 0;

  constructor(scene: MapScene, spawnPoint: TiledObject) {
    super(
      scene,
      spawnPoint.x,
      spawnPoint.y,
      scene.playerKey,
      scene.playerNickname,
      "jedi"
    );

    this.setInteractive();
    this.body.setCollideWorldBounds(true);
    this.scene.physics.add.collider(this, scene.obstaclesLayer);

    // Register cursors for player movement
    this.scene.input.setPollAlways();
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.keySpace = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.pointer = this.scene.input.activePointer;

    this.playerKey = scene.playerKey;

    this.lasers = this.scene.add.group();
  }

  update(time: number, delta: number) {
    this.renderNickname();

    this.updatePlayerPosition();

    this.updatePlayerLaser();
  }

  private updatePlayerLaser() {
    const fireRate = 200;
    const timeNow = this.scene.time.now;

    if (!chat.isFocused() && this.keySpace.isDown && timeNow > this.nextFire) {
      this.nextFire = timeNow + fireRate;
      this.lasers.add(
        new PlayerLaserSprite(
          this.scene as MapScene,
          this.x + this.width / 4,
          this.y + this.height / 4,
          this.lastPosition
        )
      );
    }

    for (let i = 0; i < this.lasers.getChildren().length; i++) {
      const laser = this.lasers.getChildren()[i] as PlayerLaserSprite;
      laser.update();
    }
  }

  private updatePlayerPosition() {
    const prevVelocity = this.body.velocity.clone();
    // Stop any previous movement from the last frame
    this.body.setVelocity(0, 0);

    // Keyboard
    if (this.cursors.left.isDown) {
      this.goLeft();
    } else if (this.cursors.right.isDown) {
      this.goRight();
    }

    if (this.cursors.up.isDown) {
      this.goBack();
    } else if (this.cursors.down.isDown) {
      this.goFront();
    }

    // Mouse
    if (this.pointer.isDown) {
      if (this.pointer.worldX < this.body.x) {
        this.goLeft();
      } else if (this.pointer.worldX > this.body.x + 16) {
        this.goRight();
      }

      if (this.pointer.worldY < this.body.y) {
        this.goBack();
      } else if (this.pointer.worldY > this.body.y + 24) {
        this.goFront();
      }
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    this.body.velocity.normalize().scale(this.playerSpeed);

    // Update the animation last and give left/right animations precedence over up/down animations
    if (
      this.cursors.left.isDown ||
      (this.pointer.isDown && this.pointer.worldX < this.body.x)
    ) {
      this.sendPlayerMovedEvent("left");
      this.anims.play("jedi-left", true);
    } else if (
      this.cursors.right.isDown ||
      (this.pointer.isDown && this.pointer.worldX > this.body.x + 16)
    ) {
      this.sendPlayerMovedEvent("right");
      this.anims.play("jedi-right", true);
    } else if (
      this.cursors.up.isDown ||
      (this.pointer.isDown && this.pointer.worldY < this.body.y)
    ) {
      this.sendPlayerMovedEvent("back");
      this.anims.play("jedi-back", true);
    } else if (
      this.cursors.down.isDown ||
      (this.pointer.isDown && this.pointer.worldY > this.body.y + 24)
    ) {
      this.sendPlayerMovedEvent("front");
      this.anims.play("jedi-front", true);
    } else {
      this.anims.stop();

      // If we were moving, pick and idle frame to use
      if (prevVelocity.x < 0) {
        this.setTexture(this.playerKey, "jedi-left-00.png");
        this.sendPlayerStoppedEvent("left");
      } else if (prevVelocity.x > 0) {
        this.setTexture(this.playerKey, "jedi-right-00.png");
        this.sendPlayerStoppedEvent("right");
      } else if (prevVelocity.y < 0) {
        this.setTexture(this.playerKey, "jedi-back-00.png");
        this.sendPlayerStoppedEvent("back");
      } else if (prevVelocity.y > 0) {
        this.setTexture(this.playerKey, "jedi-front-00.png");
        this.sendPlayerStoppedEvent("front");
      }
    }
  }

  sendPlayerMovedEvent(position: "back" | "front" | "left" | "right") {
    this.lastPosition = position;
    (this.scene as MapScene).room.send(ClientRoomEvents.PLAYER_MOVED, {
      position: position,
      x: this.body.x,
      y: this.body.y,
    });
  }

  private sendPlayerStoppedEvent(position: string) {
    (this.scene as MapScene).room.send(ClientRoomEvents.PLAYER_MOVEMENT_ENDED, {
      position: position,
    });
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

    this.setTexture(this.playerKey, "jedi-front-00.png");
    this.renderNickname();
  }
}
