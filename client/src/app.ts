import GameConfig = Phaser.Types.Core.GameConfig;
import { Game } from "phaser";
import { GameScene } from "./gameScene";
import { WelcomeScene } from "./welcomeScene";
import { ScoreScene } from "./scoreScene";

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
  const game = new MultiplayerGame(config);
};
