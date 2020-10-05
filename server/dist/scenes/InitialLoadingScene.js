"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialLoadingScene = void 0;
const phaser_1 = require("phaser");
class InitialLoadingScene extends phaser_1.Scene {
    constructor() {
        super({
            key: "InitialLoadingScene",
        });
    }
    create() {
        const titleText = "Loading...";
        this.title = this.add.text(150, 200, titleText, {
            font: "128px Arial Bold",
            fill: "#FBFBAC",
        });
    }
}
exports.InitialLoadingScene = InitialLoadingScene;
//# sourceMappingURL=InitialLoadingScene.js.map