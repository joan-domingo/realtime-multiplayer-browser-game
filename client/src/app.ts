import GameConfig = Phaser.Types.Core.GameConfig;
import { Game } from "phaser";
import { Client, Room } from "colyseus.js";
import { WelcomeScene } from "./scenes/welcomeScene";
import { GameScene } from "./scenes/gameScene";
import { ScoreScene } from "./scenes/scoreScene";
import { InitialLoadingScene } from "./scenes/InitialLoadingScene";
import { ErrorLoadingScene } from "./scenes/ErrorLoadingScene";
import OnlinePlayer from "./players/OnlinePlayer";
import { MapScene } from "./scenes/MapScene";

const config: GameConfig = {
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
      debug: false, // set to true to view zones
    },
  },
  scene: [
    InitialLoadingScene,
    ErrorLoadingScene,
    MapScene,
    WelcomeScene,
    GameScene,
    ScoreScene,
  ],
};

// Load game
const game = new Game(config);

const port = Number(process.env.PORT || 4000);
const endpoint = location.origin.replace(/^http/, "ws");
console.log(endpoint);

// Join server room
export const room = new Client(endpoint)
  .joinOrCreate("Room1")
  .then((room: Room) => {
    console.log(room.sessionId, "joined", room.name);
    game.scene.switch("InitialLoadingScene", "MapScene");
    return room;
  })
  .catch((e: Error) => {
    console.log("JOIN ERROR", e);
    game.scene.switch("InitialLoadingScene", "ErrorLoadingScene");
  });

export const onlinePlayers: OnlinePlayer[] = [];
