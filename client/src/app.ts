import GameConfig = Phaser.Types.Core.GameConfig;
import { Game } from "phaser";
import { Client, Room } from "colyseus.js";
import { InitialLoadingScene } from "./scenes/InitialLoadingScene";
import { ErrorLoadingScene } from "./scenes/ErrorLoadingScene";
import OnlinePlayer from "./players/OnlinePlayer";
import { MapScene } from "./scenes/MapScene";

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
  scene: [InitialLoadingScene, ErrorLoadingScene, MapScene],
};

// Load game
const game = new Game(config);

const endpoint =
  process.env.NODE_ENV === "production"
    ? location.origin.replace(/^http/, "ws")
    : "ws://localhost:4000";

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
