import GameConfig = Phaser.Types.Core.GameConfig;
import { Game } from "phaser";
import { Client, Room } from "colyseus.js";
import { WelcomeScene } from "./scenes/welcomeScene";
import { GameScene } from "./scenes/gameScene";
import { ScoreScene } from "./scenes/scoreScene";
import { InitialLoadingScene } from "./scenes/InitialLoadingScene";
import { ErrorLoadingScene } from "./scenes/ErrorLoadingScene";
import { Scene1 } from "./scenes/Scene1";
import { Scene2 } from "./scenes/Scene2";
import OnlinePlayer from "./players/OnlinePlayer";
import Player from "./players/Player";

const config: GameConfig = {
  title: "MultiplayerGame",
  width: 800,
  height: 600,
  parent: "game",
  scene: [
    InitialLoadingScene,
    ErrorLoadingScene,
    Scene1,
    Scene2,
    WelcomeScene,
    GameScene,
    ScoreScene,
  ],
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  backgroundColor: "#000033",
};

// Load game
const game = new Game(config);

// Join server room
export const room = new Client("ws://localhost:4000")
  .joinOrCreate("Room1")
  .then((room: Room) => {
    game.scene.switch("InitialLoadingScene", "Scene1");
    return room;
  })
  .catch((e: Error) => {
    console.log("JOIN ERROR", e);
    game.scene.switch("InitialLoadingScene", "ErrorLoadingScene");
  });

export const onlinePlayers: (Player | OnlinePlayer)[] = [];
