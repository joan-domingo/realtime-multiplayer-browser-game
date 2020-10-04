"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const phaser_1 = __importDefault(require("phaser"));
var Sprite = phaser_1.default.GameObjects.Sprite;
class OnlinePlayer extends Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.playerId);
        this.scene.add.existing(this);
        this.scene.physics.world.enableBody(this);
        this.scene.physics.add.collider(this, config.worldLayer);
        this.setTexture("players", "bob_front.png").setScale(0.8, 0.8);
        // Player Offset
        this.body.setOffset(0, 24);
        // Display playerId above player
        this.playerNickname = this.scene.add.text(this.x - this.width * 1.4, this.y - this.height / 2, config.playerId, {
            fontSize: 8,
            resolution: 1,
        });
    }
    isWalking(position, x, y) {
        // Player
        this.anims.play(`onlinePlayer-${position}-walk`, true);
        this.setPosition(x, y);
        // PlayerId
        this.playerNickname.x = this.x - this.playerNickname.width / 2;
        this.playerNickname.y = this.y - this.height / 2;
    }
    stopWalking(position) {
        this.anims.stop();
        this.setTexture("players", `bob_${position}.png`);
    }
    destroy() {
        super.destroy();
        this.playerNickname.destroy();
    }
}
exports.default = OnlinePlayer;
//# sourceMappingURL=OnlinePlayer.js.map