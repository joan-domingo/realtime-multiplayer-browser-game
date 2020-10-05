"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorLoadingScene = void 0;
const phaser_1 = require("phaser");
class ErrorLoadingScene extends phaser_1.Scene {
    constructor() {
        super({
            key: "ErrorLoadingScene",
        });
    }
    create() {
        const titleText = "ERROR!!!!!";
        this.title = this.add.text(150, 200, titleText, {
            font: "128px Arial Bold",
            fill: "#FBFBAC",
        });
    }
}
exports.ErrorLoadingScene = ErrorLoadingScene;
//# sourceMappingURL=ErrorLoadingScene.js.map