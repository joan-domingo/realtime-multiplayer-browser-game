import GameConfig = Phaser.Types.Core.GameConfig;
import { Game } from "phaser";
import { InitialLoadingScene } from "./scenes/InitialLoadingScene";
import { ErrorLoadingScene } from "./scenes/ErrorLoadingScene";
import OnlinePlayer from "./players/OnlinePlayer";
import { MapScene } from "./scenes/MapScene";
import { EnterNameScene } from "./scenes/EnterNameScene";
import { ChatScene } from "./scenes/ChatScene";
import { RoomClient } from "./RoomClient";

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
  scene: [
    EnterNameScene,
    InitialLoadingScene,
    ErrorLoadingScene,
    MapScene,
    ChatScene,
  ],
};

// Load game
export const game = new Game(config);

// Backend endpoint
export const endpoint =
  process.env.NODE_ENV === "production"
    ? "https://multiplayer-game-be.herokuapp.com/".replace(/^http/, "ws")
    : "ws://localhost:4000";

export const roomClient = new RoomClient();

export const onlinePlayers: OnlinePlayer[] = [];

const inputMessage = document.getElementById(
  "inputMessage"
) as HTMLInputElement;
export const messagesElement = document.getElementById("messages");

window.addEventListener("keydown", (event) => {
  if (event.which === 13) {
    sendMessage();
  }
  if (event.which === 32) {
    if (document.activeElement === inputMessage) {
      inputMessage.value = inputMessage.value + " ";
    }
  }
});

function sendMessage() {
  let message = inputMessage.value;
  if (message) {
    inputMessage.value = "";
    roomClient.getRoomInstance().send("message", message);
  }
}
