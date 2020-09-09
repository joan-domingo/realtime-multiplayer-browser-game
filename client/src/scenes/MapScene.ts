import { Scene } from "phaser";
import Tilemap = Phaser.Tilemaps.Tilemap;
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;
import StaticTilemapLayer = Phaser.Tilemaps.StaticTilemapLayer;
import { onlinePlayers, room } from "../app";
import { Room } from "colyseus.js";
import OnlinePlayer from "../players/OnlinePlayer";
import Player from "../players/Player";

export class MapScene extends Scene {
  map: Tilemap;
  player: Player;
  cursors: CursorKeys;
  obstaclesLayer: StaticTilemapLayer;
  socketKey: boolean;

  constructor() {
    super("MapScene");
  }

  preload() {
    // map tiles
    this.load.image("tiles", "assets/map/spritesheet-extruded.png");
    // map in json format
    this.load.tilemapTiledJSON("map", "assets/map/map.json");

    // Load player atlas
    this.load.atlas(
      "currentPlayer",
      "assets/atlas/atlas.png",
      "assets/atlas/atlas.json"
    );

    // Load online player atlas
    this.load.atlas(
      "players",
      "assets/images/players/players.png",
      "assets/atlas/players.json"
    );
  }

  create() {
    // create map
    this.createMap();

    // create player
    this.createPlayer();

    // create player animations
    this.createAnimations();

    // create online player animations
    this.createOnlinePlayerAnimations();

    // update camera
    this.updateCamera();

    this.obstaclesLayer.setCollisionBetween(1, 50);
    this.physics.add.collider(this.player, this.obstaclesLayer);

    // user input
    this.cursors = this.input.keyboard.createCursorKeys();

    // React to room changes
    this.updateRoom();

    this.movementTimer();
  }

  private createMap() {
    // create the map
    this.map = this.make.tilemap({
      key: "map",
    });

    // first parameter is the name of the tilemap in tiled
    const tiles = this.map.addTilesetImage(
      "spritesheet",
      "tiles",
      16,
      16,
      1,
      2
    );

    // creating the layers
    this.map.createStaticLayer("Grass", tiles, 0, 0);
    this.obstaclesLayer = this.map.createStaticLayer("Obstacles", tiles, 0, 0);

    // don't go out of the map
    this.physics.world.bounds.width = this.map.widthInPixels;
    this.physics.world.bounds.height = this.map.heightInPixels;
  }

  private createAnimations() {
    // Create the player's walking animations from the texture currentPlayer. These are stored in the global
    // animation manager so any sprite can access them.
    this.anims.create({
      key: "misa-left-walk",
      frames: this.anims.generateFrameNames("currentPlayer", {
        prefix: "misa-left-walk.",
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "misa-right-walk",
      frames: this.anims.generateFrameNames("currentPlayer", {
        prefix: "misa-right-walk.",
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "misa-front-walk",
      frames: this.anims.generateFrameNames("currentPlayer", {
        prefix: "misa-front-walk.",
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "misa-back-walk",
      frames: this.anims.generateFrameNames("currentPlayer", {
        prefix: "misa-back-walk.",
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }

  private createPlayer() {
    // our player sprite
    this.player = new Player({
      scene: this,
      worldLayer: this.obstaclesLayer,
      key: "currentplayer",
      x: 50,
      y: 100,
    });
  }

  private updateCamera() {
    // limit camera to map
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
    this.cameras.main.startFollow(this.player);
    this.cameras.main.roundPixels = true; // avoid tile bleed
  }

  update(time: number, delta: number) {
    // Loop the player update method
    this.player.update(time, delta);

    // Horizontal movement
    if (this.cursors.left.isDown) {
      if (this.socketKey) {
        if (this.player.isMoved()) {
          room.then((room: any) =>
            room.send("PLAYER_MOVED", {
              position: "left",
              // @ts-ignore
              x: this.player.x,
              // @ts-ignore
              y: this.player.y,
            })
          );
        }
        this.socketKey = false;
      }
    } else if (this.cursors.right.isDown) {
      if (this.socketKey) {
        if (this.player.isMoved()) {
          room.then((room: any) =>
            room.send("PLAYER_MOVED", {
              position: "right",
              // @ts-ignore
              x: this.player.x,
              // @ts-ignore
              y: this.player.y,
            })
          );
        }
        this.socketKey = false;
      }
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      if (this.socketKey) {
        if (this.player.isMoved()) {
          room.then((room: any) =>
            room.send("PLAYER_MOVED", {
              position: "back",
              // @ts-ignore
              x: this.player.x,
              // @ts-ignore
              y: this.player.y,
            })
          );
        }
        this.socketKey = false;
      }
    } else if (this.cursors.down.isDown) {
      if (this.socketKey) {
        if (this.player.isMoved()) {
          room.then((room: any) =>
            room.send("PLAYER_MOVED", {
              position: "front",
              // @ts-ignore
              x: this.player.x,
              // @ts-ignore
              y: this.player.y,
            })
          );
        }
        this.socketKey = false;
      }
    }

    // Horizontal movement ended
    if (Phaser.Input.Keyboard.JustUp(this.cursors.left) === true) {
      room.then((room: any) =>
        room.send("PLAYER_MOVEMENT_ENDED", { position: "left" })
      );
    } else if (Phaser.Input.Keyboard.JustUp(this.cursors.right) === true) {
      room.then((room: any) =>
        room.send("PLAYER_MOVEMENT_ENDED", { position: "right" })
      );
    }

    // Vertical movement ended
    if (Phaser.Input.Keyboard.JustUp(this.cursors.up) === true) {
      room.then((room: any) =>
        room.send("PLAYER_MOVEMENT_ENDED", { position: "back" })
      );
    } else if (Phaser.Input.Keyboard.JustUp(this.cursors.down) === true) {
      room.then((room: any) =>
        room.send("PLAYER_MOVEMENT_ENDED", { position: "front" })
      );
    }
  }

  private createOnlinePlayerAnimations() {
    // onlinePlayer animations
    this.anims.create({
      key: "onlinePlayer-left-walk",
      frames: this.anims.generateFrameNames("players", {
        start: 0,
        end: 3,
        zeroPad: 3,
        prefix: "bob_left_walk.",
        suffix: ".png",
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "onlinePlayer-right-walk",
      frames: this.anims.generateFrameNames("players", {
        start: 0,
        end: 3,
        zeroPad: 3,
        prefix: "bob_right_walk.",
        suffix: ".png",
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "onlinePlayer-front-walk",
      frames: this.anims.generateFrameNames("players", {
        start: 0,
        end: 3,
        zeroPad: 3,
        prefix: "bob_front_walk.",
        suffix: ".png",
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "onlinePlayer-back-walk",
      frames: this.anims.generateFrameNames("players", {
        start: 0,
        end: 3,
        zeroPad: 3,
        prefix: "bob_back_walk.",
        suffix: ".png",
      }),
      frameRate: 10,
      repeat: -1,
    });
  }

  private updateRoom() {
    room.then((room: Room) => {
      room.onMessage("CURRENT_PLAYERS", (data) => {
        console.log("CURRENT_PLAYERS");
        Object.keys(data.players).forEach((playerId) => {
          let player = data.players[playerId];

          if (playerId !== room.sessionId) {
            onlinePlayers[player.sessionId] = new OnlinePlayer({
              scene: this,
              playerId: player.sessionId,
              key: player.sessionId,
              x: player.x,
              y: player.y,
            });
          }
        });
      });
      room.onMessage("PLAYER_JOINED", (data) => {
        console.log("PLAYER_JOINED");
        if (!onlinePlayers[data.sessionId]) {
          onlinePlayers[data.sessionId] = new OnlinePlayer({
            scene: this,
            playerId: data.sessionId,
            key: data.sessionId,
            x: data.x,
            y: data.y,
          });
        }
      });
      room.onMessage("PLAYER_LEFT", (data) => {
        console.log("PLAYER_LEFT");
        if (onlinePlayers[data.sessionId]) {
          onlinePlayers[data.sessionId].destroy();
          delete onlinePlayers[data.sessionId];
        }
      });
      room.onMessage("PLAYER_MOVED", (data) => {
        if (!onlinePlayers[data.sessionId].scene) {
          onlinePlayers[data.sessionId] = new OnlinePlayer({
            scene: this,
            playerId: data.sessionId,
            key: data.sessionId,
            x: data.x,
            y: data.y,
          });
        }
        // Start animation and set sprite position
        onlinePlayers[data.sessionId].isWalking(data.position, data.x, data.y);
      });
      room.onMessage("PLAYER_MOVEMENT_ENDED", (data) => {
        // If player isn't registered in this scene (map changing bug..)
        if (!onlinePlayers[data.sessionId].scene) {
          onlinePlayers[data.sessionId] = new OnlinePlayer({
            scene: this,
            playerId: data.sessionId,
            key: data.sessionId,
            x: data.x,
            y: data.y,
          });
        }
        // Stop animation & set sprite texture
        onlinePlayers[data.sessionId].stopWalking(data.position);
      });
    });
  }

  movementTimer() {
    setInterval(() => {
      this.socketKey = true;
    }, 50);
  }
}
