"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WelcomeScene = void 0;
const phaser_1 = require("phaser");
class WelcomeScene extends phaser_1.Scene {
    constructor() {
        super({
            key: "WelcomeScene",
        });
    }
    create() {
        var titleText = "Starfall";
        this.title = this.add.text(150, 200, titleText, {
            font: "128px Arial Bold",
            fill: "#FBFBAC",
        });
        var hintText = "Click to start";
        this.hint = this.add.text(300, 350, hintText, {
            font: "24px Arial Bold",
            fill: "#FBFBAC",
        });
        this.input.on("pointerdown", function ( /*pointer*/) {
            this.scene.start("GameScene");
        }, this);
    }
}
exports.WelcomeScene = WelcomeScene;
//# sourceMappingURL=welcomeScene.js.map