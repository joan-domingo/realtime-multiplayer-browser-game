import GameConfig = Phaser.Types.Core.GameConfig;
import { Game } from "phaser";
import { Client, Room } from "colyseus.js";
import { InitialLoadingScene } from "./scenes/InitialLoadingScene";
import { ErrorLoadingScene } from "./scenes/ErrorLoadingScene";
import OnlinePlayer from "./players/OnlinePlayer";
import { MapScene } from "./scenes/MapScene";
import { EnterNameScene } from "./scenes/EnterNameScene";

const config: GameConfig = {
  type: Phaser.AUTO,
  parent: "content",
  width: 960,
  height: 640,
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        y: 0,
      },
      debug: process.env.NODE_ENV === "development", // set to true to view zones
    },
  },
  render: {
    // prevent tile bleeding
    antialiasGL: false,
    // prevent pixel art from becoming blurre when scaled
    pixelArt: true,
  },
  scene: [EnterNameScene, InitialLoadingScene, ErrorLoadingScene, MapScene],
};

// Load game
export const game = new Game(config);

// Backend endpoint
export const endpoint =
  process.env.NODE_ENV === "production"
    ? "https://multiplayer-game-be.herokuapp.com/".replace(/^http/, "ws")
    : "ws://localhost:4000";

// Backend (Colyseus) room
// export let room: undefined | Room = undefined;

export const onlinePlayers: OnlinePlayer[] = [];
