"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlinePlayers = exports.room = void 0;
const phaser_1 = require("phaser");
const colyseus_js_1 = require("colyseus.js");
const welcomeScene_1 = require("./scenes/welcomeScene");
const gameScene_1 = require("./scenes/gameScene");
const scoreScene_1 = require("./scenes/scoreScene");
const InitialLoadingScene_1 = require("./scenes/InitialLoadingScene");
const ErrorLoadingScene_1 = require("./scenes/ErrorLoadingScene");
const MapScene_1 = require("./scenes/MapScene");
const config = {
    type: Phaser.AUTO,
    parent: "content",
    width: 320,
    height: 240,
    zoom: 3,
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y: 0,
            },
            debug: false,
        },
    },
    scene: [
        InitialLoadingScene_1.InitialLoadingScene,
        ErrorLoadingScene_1.ErrorLoadingScene,
        MapScene_1.MapScene,
        welcomeScene_1.WelcomeScene,
        gameScene_1.GameScene,
        scoreScene_1.ScoreScene,
    ],
};
// Load game
const game = new phaser_1.Game(config);
const endpoint = process.env.ENDPOINT || "http://localhost:4000";
// Join server room
exports.room = new colyseus_js_1.Client(endpoint)
    .joinOrCreate("Room1")
    .then((room) => {
    console.log(room.sessionId, "joined", room.name);
    game.scene.switch("InitialLoadingScene", "MapScene");
    return room;
})
    .catch((e) => {
    console.log("JOIN ERROR", e);
    game.scene.switch("InitialLoadingScene", "ErrorLoadingScene");
});
exports.onlinePlayers = [];
//# sourceMappingURL=app.js.map