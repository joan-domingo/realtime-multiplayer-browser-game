import Phaser from "phaser";
import { room } from "../app";
import Sprite = Phaser.GameObjects.Sprite;
import StaticTilemapLayer = Phaser.Tilemaps.StaticTilemapLayer;
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;
import Body = Phaser.Physics.Arcade.Body;
import Text = Phaser.GameObjects.Text;
import Key = Phaser.Input.Keyboard.Key;
import { Room } from "colyseus.js";
import { Scene2 } from "../scenes/Scene2";
import { DoorsObject, WorldObject, WorldObjectProperties } from "../types";

export default class Player extends Sprite {
  cursors: CursorKeys;
  scene: Scene2;
  body: Body;
  container:
    | { oldPosition: { x: number; y: number } }
    | { oldPosition: undefined };
  speed: number;
  canChangeMap: boolean;
  playerNickname: Text;
  spacebar: Key;
  playerTexturePosition: string;
  map: string;

  constructor(config: {
    scene: Scene2;
    worldLayer: StaticTilemapLayer;
    key: string;
    x: number;
    y: number;
  }) {
    super(config.scene, config.x, config.y, config.key);

    this.scene.add.existing(this);
    this.scene.physics.world.enableBody(this);
    this.scene.physics.add.collider(this, config.worldLayer);

    this.setTexture(
      "currentPlayer",
      `misa-${this.scene.playerTexturePosition}`
    );

    // Register cursors for player movement
    this.cursors = this.scene.input.keyboard.createCursorKeys();

    // Player Offset
    this.body.setOffset(0, 24);

    // Player can't go out of the world
    this.body.setCollideWorldBounds(true);

    // Set depth (z-index)
    this.setDepth(5);

    // Container to store old data
    this.container = { oldPosition: undefined };

    // Player speed
    this.speed = 150;

    this.canChangeMap = true;

    // Player nickname text
    this.playerNickname = this.scene.add.text(
      this.x - this.width * 1.4,
      this.y - this.height / 2,
      "Player"
    );

    // Add spacebar input
    this.spacebar = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
  }

  update(time: number, delta: number) {
    const prevVelocity = this.body.velocity.clone();

    // Show player nickname above player
    this.showPlayerNickname();

    // Player door interaction
    this.doorInteraction();

    // Player world interaction
    this.worldInteraction();

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
      this.anims.play("misa-left-walk", true);
    } else if (this.cursors.right.isDown) {
      this.anims.play("misa-right-walk", true);
    } else if (this.cursors.up.isDown) {
      this.anims.play("misa-back-walk", true);
    } else if (this.cursors.down.isDown) {
      this.anims.play("misa-front-walk", true);
    } else {
      this.anims.stop();

      // If we were moving, pick and idle frame to use
      if (prevVelocity.x < 0) this.setTexture("currentPlayer", "misa-left");
      else if (prevVelocity.x > 0)
        this.setTexture("currentPlayer", "misa-right");
      else if (prevVelocity.y < 0)
        this.setTexture("currentPlayer", "misa-back");
      else if (prevVelocity.y > 0)
        this.setTexture("currentPlayer", "misa-front");
    }
  }

  showPlayerNickname() {
    this.playerNickname.x = this.x - this.playerNickname.width / 2;
    this.playerNickname.y = this.y - this.height / 2;
  }

  isMoved() {
    if (
      this.container.oldPosition &&
      (this.container.oldPosition.x !== this.x ||
        this.container.oldPosition.y !== this.y)
    ) {
      this.container.oldPosition = { x: this.x, y: this.y };
      return true;
    } else {
      this.container.oldPosition = { x: this.x, y: this.y };
      return false;
    }
  }

  doorInteraction() {
    this.scene.map.findObject("Doors", (obj: DoorsObject) => {
      if (
        this.y >= obj.y &&
        this.y <= obj.y + obj.height &&
        this.x >= obj.x &&
        this.x <= obj.x + obj.width
      ) {
        console.log("Player is by " + obj.name);
        if (this.spacebar.isDown) {
          console.log("Door is open!");
        }
      }
    });
  }

  worldInteraction() {
    this.scene.map.findObject("Worlds", (world: WorldObject) => {
      if (
        this.y >= world.y &&
        this.y <= world.y + world.height &&
        this.x >= world.x &&
        this.x <= world.x + world.width
      ) {
        console.log("Player is by world entry: " + world.name);

        // Get playerTexturePosition from from Worlds object property
        let playerTexturePosition;
        if (world.properties)
          playerTexturePosition = world.properties.find(
            (property: WorldObjectProperties) =>
              property.name === "playerTexturePosition"
          );
        if (playerTexturePosition)
          this.playerTexturePosition = playerTexturePosition.value;

        // Load new level (tiles map)
        this.scene.registry.destroy();
        // TODO off() this.scene.events.off();
        this.scene.scene.restart({
          map: world.name,
          playerTexturePosition: this.playerTexturePosition,
        });

        room.then((room: Room) =>
          room.send("PLAYER_CHANGED_MAP", {
            map: world.name,
          })
        );
      }
    });
  }

  isWalking(position: unknown, x: number, y: number) {}

  stopWalking(position: unknown) {}
}
