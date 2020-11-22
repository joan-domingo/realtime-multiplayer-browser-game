import GameConfig = Phaser.Types.Core.GameConfig;
import { Game } from "phaser";
import { InitialLoadingScene } from "./scenes/InitialLoadingScene";
import { ErrorLoadingScene } from "./scenes/ErrorLoadingScene";
import { MapScene } from "./scenes/MapScene";
import { RoomClient } from "./RoomClient";
import { Chat } from "./Chat";
import { EnterNickNameScene } from "./scenes/EnterNicknameScene";

// Load game
const config: GameConfig = {
  type: Phaser.AUTO,
  parent: "content",
  width: 960,
  height: 640,
  physics: {
    default: "arcade",
    arcade: {
      debug: process.env.NODE_ENV === "development", // set to true to view zones
    },
  },
  render: {
    // prevent tile bleeding
    antialiasGL: false,
    // prevent pixel art from becoming blurre when scaled
    pixelArt: true,
  },
  /*scale: {
    mode: Phaser.Scale.FIT,
    parent: "content",
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
  },*/
  scene: [EnterNickNameScene, InitialLoadingScene, ErrorLoadingScene, MapScene],
  dom: {
    createContainer: true,
  },
};
new Game(config);

// Backend endpoint
export const endpoint =
  process.env.NODE_ENV === "production"
    ? "https://multiplayer-game-be.herokuapp.com/".replace(/^http/, "ws")
    : "ws://localhost:4000";

// Room client
export const roomClient = new RoomClient();

// Chat
export const chat = new Chat(roomClient);
