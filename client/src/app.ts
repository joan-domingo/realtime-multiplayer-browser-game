import GameConfig = Phaser.Types.Core.GameConfig;
import { Game } from "phaser";
import { Client, Room } from "colyseus.js";
import { WelcomeScene } from "./scenes/welcomeScene";
import { GameScene } from "./scenes/gameScene";
import { ScoreScene } from "./scenes/scoreScene";
import { InitialLoadingScene } from "./scenes/InitialLoadingScene";
import { ErrorLoadingScene } from "./scenes/ErrorLoadingScene";

const config: GameConfig = {
  title: "MultiplayerGame",
  width: 800,
  height: 600,
  parent: "game",
  scene: [
    InitialLoadingScene,
    ErrorLoadingScene,
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

window.onload = () => {
  // Load game
  const game = new Game(config);

  // Join server room
  new Client("ws://localhost:4000")
    .joinOrCreate("Room1")
    .then((room: Room) => {
      console.log(room.sessionId, "joined", room.name);
      game.scene.switch("InitialLoadingScene", "WelcomeScene");

      room.onStateChange((state) =>
        console.log("onStateChange", JSON.stringify(state))
      );
    })
    .catch((e: Error) => {
      console.log("JOIN ERROR", e);
      game.scene.switch("InitialLoadingScene", "ErrorLoadingScene");
    });
};
