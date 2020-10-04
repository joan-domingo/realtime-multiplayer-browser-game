"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const phaser_1 = __importDefault(require("phaser"));
var Sprite = phaser_1.default.GameObjects.Sprite;
class PlayerLaser extends Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "sprLaserPlayer");
        this.scene.add.existing(this);
        this.scene.physics.world.enableBody(this, 0);
    }
}
exports.default = PlayerLaser;
//# sourceMappingURL=PlayerLaser.js.map