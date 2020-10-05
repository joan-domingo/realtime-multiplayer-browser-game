"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const phaser_1 = __importDefault(require("phaser"));
var Sprite = phaser_1.default.GameObjects.Sprite;
class Player extends Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        this.scene.add.existing(this);
        this.scene.physics.world.enableBody(this);
        this.scene.physics.add.collider(this, config.worldLayer);
        this.setTexture("currentPlayer", `misa-front`).setScale(1 / 3, 1 / 3);
        // Register cursors for player movement
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        // Player Offset
        this.body.setOffset(0, 24);
        // Player can't go out of the world
        this.body.setCollideWorldBounds(true);
        // Set depth (z-index)
        this.setDepth(5);
        // store previous position
        this.oldPosition = undefined;
        // Player speed
        this.speed = 50;
        // Player nickname text
        this.playerNickname = this.scene.add.text(this.x - this.width * 1.4, 0, "Player", {
            fontSize: 8,
            resolution: 1,
        });
    }
    update(time, delta) {
        const prevVelocity = this.body.velocity.clone();
        // Show player nickname above player
        this.showPlayerNickname();
        // Stop any previous movement from the last frame
        this.body.setVelocity(0);
        // Horizontal movement
        if (this.cursors.left.isDown) {
            this.body.setVelocityX(-this.speed);
        }
        else if (this.cursors.right.isDown) {
            this.body.setVelocityX(this.speed);
        }
        // Vertical movement
        if (this.cursors.up.isDown) {
            this.body.setVelocityY(-this.speed);
        }
        else if (this.cursors.down.isDown) {
            this.body.setVelocityY(this.speed);
        }
        // Normalize and scale the velocity so that player can't move faster along a diagonal
        this.body.velocity.normalize().scale(this.speed);
        // Update the animation last and give left/right animations precedence over up/down animations
        if (this.cursors.left.isDown) {
            this.anims.play("misa-left-walk", true);
        }
        else if (this.cursors.right.isDown) {
            this.anims.play("misa-right-walk", true);
        }
        else if (this.cursors.up.isDown) {
            this.anims.play("misa-back-walk", true);
        }
        else if (this.cursors.down.isDown) {
            this.anims.play("misa-front-walk", true);
        }
        else {
            this.anims.stop();
            // If we were moving, pick and idle frame to use
            if (prevVelocity.x < 0)
                this.setTexture("currentPlayer", "misa-left");
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
        this.playerNickname.y = this.y - this.height / 4;
    }
    isMoved() {
        if (this.oldPosition &&
            (this.oldPosition.x !== this.x || this.oldPosition.y !== this.y)) {
            this.oldPosition = { x: this.x, y: this.y };
            return true;
        }
        else {
            this.oldPosition = { x: this.x, y: this.y };
            return false;
        }
    }
}
exports.default = Player;
//# sourceMappingURL=Player.js.map