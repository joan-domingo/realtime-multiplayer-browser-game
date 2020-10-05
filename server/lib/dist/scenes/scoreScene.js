"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoreScene = void 0;
const phaser_1 = require("phaser");
class ScoreScene extends phaser_1.Scene {
    constructor() {
        super({
            key: "ScoreScene",
        });
    }
    init(params) {
        this.score = params.starsCaught;
    }
    create() {
        var resultText = "Your score is " + this.score + "!";
        this.result = this.add.text(200, 250, resultText, {
            font: "48px Arial Bold",
            fill: "#FBFBAC",
        });
        var hintText = "Click to restart";
        this.hint = this.add.text(300, 350, hintText, {
            font: "24px Arial Bold",
            fill: "#FBFBAC",
        });
        this.input.on("pointerdown", function ( /*pointer*/) {
            this.scene.start("WelcomeScene");
        }, this);
    }
}
exports.ScoreScene = ScoreScene;
//# sourceMappingURL=scoreScene.js.map