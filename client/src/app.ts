import GameConfig = Phaser.Types.Core.GameConfig;
import { Game } from "phaser";
import { GameScene } from "./gameScene";
import { WelcomeScene } from "./welcomeScene";
import { ScoreScene } from "./scoreScene";
// @ts-ignore
import { Room, Client } from "colyseus.js";

const config: GameConfig = {
  title: "MultiplayerGame",
  width: 800,
  height: 600,
  parent: "game",
  scene: [WelcomeScene, GameScene, ScoreScene],
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  backgroundColor: "#000033",
};

export class MultiplayerGame extends Game {
  constructor(config: GameConfig) {
    super(config);
  }
}

window.onload = () => {
  new MultiplayerGame(config);

  const client = new Client("ws://localhost:4000");

  client
    .joinOrCreate("Room1")
    .then((room: any) => {
      console.log(room.sessionId, "joined", room.name);
    })
    .catch((e: Error) => {
      console.log("JOIN ERROR", e);
    });
};
