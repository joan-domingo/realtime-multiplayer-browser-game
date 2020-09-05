import { Scene } from "phaser";
import { onlinePlayers, room } from "../app";
import Player from "../players/Player";
import OnlinePlayer from "../players/OnlinePlayer";
import GameObject = Phaser.GameObjects.GameObject;
import { Room } from "colyseus.js";
import StaticTilemapLayer = Phaser.Tilemaps.StaticTilemapLayer;

let cursors: any, socketKey: any;

export class Scene2 extends Scene {
  mapName: any;
  playerTexturePosition: any;
  container: any;
  map: any;
  belowLayer: any;
  worldLayer: StaticTilemapLayer;
  grassLayer: any;
  aboveLayer: any;
  player: Player;

  constructor() {
    super("Scene2");
  }

  init(data: any) {
    // Map data
    this.mapName = data.map;

    // Player Texture starter position
    this.playerTexturePosition = data.playerTexturePosition;

    // Set container
    this.container = [];
  }

  create() {
    room.then((room: Room) => {
      room.onMessage("CURRENT_PLAYERS", (data) => {
        console.log("CURRENT_PLAYERS");
        Object.keys(data.players).forEach((playerId) => {
          const player = data.players[playerId];

          if (playerId !== room.sessionId) {
            onlinePlayers[player.sessionId] = new OnlinePlayer({
              scene: this,
              playerId: player.sessionId,
              key: player.sessionId,
              map: player.map,
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
            map: data.map,
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
        // If player is in same map
        if (this.mapName === onlinePlayers[data.sessionId]?.map) {
          // If player isn't registered in this scene (map changing bug..)
          if (!onlinePlayers[data.sessionId].scene) {
            onlinePlayers[data.sessionId] = new OnlinePlayer({
              scene: this,
              playerId: data.sessionId,
              key: data.sessionId,
              map: data.map,
              x: data.x,
              y: data.y,
            });
          }
          // Start animation and set sprite position
          onlinePlayers[data.sessionId].isWalking(
            data.position,
            data.x,
            data.y
          );
        }
      });
      room.onMessage("PLAYER_MOVEMENT_ENDED", (data) => {
        // If player is in same map
        if (this.mapName === onlinePlayers[data.sessionId].map) {
          // If player isn't registered in this scene (map changing bug..)
          if (!onlinePlayers[data.sessionId].scene) {
            onlinePlayers[data.sessionId] = new OnlinePlayer({
              scene: this,
              playerId: data.sessionId,
              key: data.sessionId,
              map: data.map,
              x: data.x,
              y: data.y,
            });
          }
          // Stop animation & set sprite texture
          onlinePlayers[data.sessionId].stopWalking(data.position);
        }
      });
      room.onMessage("PLAYER_CHANGED_MAP", (data) => {
        console.log("PLAYER_CHANGED_MAP");

        if (onlinePlayers[data.sessionId]) {
          onlinePlayers[data.sessionId].destroy();

          if (
            data.map === this.mapName &&
            !onlinePlayers[data.sessionId].scene
          ) {
            onlinePlayers[data.sessionId] = new OnlinePlayer({
              scene: this,
              playerId: data.sessionId,
              key: data.sessionId,
              map: data.map,
              x: data.x,
              y: data.y,
            });
          }
        }
      });
    });

    this.map = this.make.tilemap({ key: this.mapName });

    // Set current map Bounds
    this.scene.scene.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = this.map.addTilesetImage(
      "tuxmon-sample-32px-extruded",
      "TilesTown"
    );

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    this.belowLayer = this.map.createStaticLayer("Below Player", tileset, 0, 0);
    this.worldLayer = this.map.createStaticLayer("World", tileset, 0, 0);
    this.grassLayer = this.map.createStaticLayer("Grass", tileset, 0, 0);
    this.aboveLayer = this.map.createStaticLayer("Above Player", tileset, 0, 0);

    this.worldLayer.setCollisionByProperty({ collides: true });

    // By default, everything gets depth sorted on the screen in the order we created things. Here, we
    // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
    // Higher depths will sit on top of lower depth objects.
    this.aboveLayer.setDepth(10);

    // Get spawn point from tiled map
    const spawnPoint = this.map.findObject(
      "SpawnPoints",
      (obj: GameObject) => obj.name === "Spawn Point"
    );

    // Set player
    this.player = new Player({
      scene: this,
      worldLayer: this.worldLayer,
      key: "player",
      x: spawnPoint.x,
      y: spawnPoint.y,
    });

    const camera = this.cameras.main;
    camera.startFollow(this.player);
    camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    cursors = this.input.keyboard.createCursorKeys();

    // Help text that has a "fixed" position on the screen
    this.add
      .text(16, 16, 'Arrow keys to move\nPress "D" to show hitboxes', {
        font: "18px monospace",
        fill: "#000000",
        padding: { x: 20, y: 10 },
        backgroundColor: "#ffffff",
      })
      .setScrollFactor(0)
      .setDepth(30);

    this.debugGraphics();

    this.movementTimer();
  }

  update(time: number, delta: number) {
    // Loop the player update method
    this.player.update(time, delta);

    // console.log('PlayerX: ' + this.player.x);
    // console.log('PlayerY: ' + this.player.y);

    // Horizontal movement
    if (cursors.left.isDown) {
      if (socketKey) {
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
        socketKey = false;
      }
    } else if (cursors.right.isDown) {
      if (socketKey) {
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
        socketKey = false;
      }
    }

    // Vertical movement
    if (cursors.up.isDown) {
      if (socketKey) {
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
        socketKey = false;
      }
    } else if (cursors.down.isDown) {
      if (socketKey) {
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
        socketKey = false;
      }
    }

    // Horizontal movement ended
    if (Phaser.Input.Keyboard.JustUp(cursors.left) === true) {
      room.then((room: any) =>
        room.send("PLAYER_MOVEMENT_ENDED", { position: "left" })
      );
    } else if (Phaser.Input.Keyboard.JustUp(cursors.right) === true) {
      room.then((room: any) =>
        room.send("PLAYER_MOVEMENT_ENDED", { position: "right" })
      );
    }

    // Vertical movement ended
    if (Phaser.Input.Keyboard.JustUp(cursors.up) === true) {
      room.then((room: any) =>
        room.send("PLAYER_MOVEMENT_ENDED", { position: "back" })
      );
    } else if (Phaser.Input.Keyboard.JustUp(cursors.down) === true) {
      room.then((room: any) =>
        room.send("PLAYER_MOVEMENT_ENDED", { position: "front" })
      );
    }
  }

  movementTimer() {
    setInterval(() => {
      socketKey = true;
    }, 50);
  }

  debugGraphics() {
    // Debug graphics
    this.input.keyboard.once("keydown_D", (event: any) => {
      // Turn on physics debugging to show player's hitbox
      this.physics.world.createDebugGraphic();

      // Create worldLayer collision graphic above the player, but below the help text
      const graphics = this.add.graphics().setAlpha(0.75).setDepth(20);
      this.worldLayer.renderDebug(graphics, {
        tileColor: null, // Color of non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
      });
    });
  }
}
