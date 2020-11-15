import { Scene } from "phaser";
import Tilemap = Phaser.Tilemaps.Tilemap;
import StaticTilemapLayer = Phaser.Tilemaps.StaticTilemapLayer;
import { roomClient } from "../app";
import { Room } from "colyseus.js";
import OnlinePlayer from "../sprites/OnlinePlayer";
import Player from "../sprites/Player";
import {
  RoomEvents,
  ServerLaser,
  ServerPlayer,
  SpecialEffects,
} from "../types";
import Group = Phaser.GameObjects.Group;
import GameObject = Phaser.GameObjects.GameObject;
import OnlineLaser from "../sprites/OnlineLaser";

export class MapScene extends Scene {
  // room
  room: Room;
  // map
  private tileMapKey: string;
  private tileSetKey: string;
  private map: Tilemap;
  obstaclesLayer: StaticTilemapLayer;
  // player
  playerKey: string;
  playerNickname: string;
  private player: Player;
  // Online players
  onlinePlayerKey: string;
  private onlinePlayers: { [sessionId: string]: OnlinePlayer } = {};
  enemies: Group;
  // Laser
  laserKey: string;
  sfx: SpecialEffects;
  onlineLasers: Group;

  constructor() {
    super("MapScene");
  }

  init(data: { nickname: string }): void {
    // room
    this.room = roomClient.getRoomInstance();

    // map
    this.tileMapKey = "/assets/tilemaps/scifi";
    this.tileSetKey = "/assets/tilesets/scifitiles-sheet";

    // player
    this.playerKey = "currentPlayer";
    this.playerNickname = data.nickname;

    // Online player
    this.onlinePlayerKey = "onlinePlayer";

    this.laserKey = "sprLaserPlayer";
  }

  preload() {
    this.load.image(this.tileSetKey);
    this.load.tilemapTiledJSON(this.tileMapKey);

    // Load player atlas
    this.load.atlas(
      this.playerKey,
      "assets/atlas/sprite_jedi.png",
      "assets/atlas/sprite_jedi.json"
    );

    // Load online player atlas
    this.load.atlas(
      this.onlinePlayerKey,
      "assets/atlas/sprite_stormtrooper.png",
      "assets/atlas/sprite_stormtrooper.json"
    );

    // Load player laser
    this.load.image(this.laserKey, "assets/images/sprLaserPlayer.png");
    this.load.audio("sndLaserPlayer", "assets/sounds/sndLaserPlayer.wav");
  }

  create() {
    // create map
    this.createMap();

    // create player
    const spawnPoint: GameObject = this.map.findObject(
      "Objects",
      (obj) => obj.name === "Spawn Point"
    );
    this.player = new Player(this, spawnPoint);

    // Online players
    this.enemies = this.add.group();
    this.onlineLasers = this.add.group();

    // Special effects
    this.sfx = {
      laserPlayer: this.sound.add("sndLaserPlayer"),
      laserEnemy: this.sound.add("sndLaserPlayer"),
    };

    // update camera
    this.updateCamera();

    // React to room changes
    this.updateRoom();

    // Create worldLayer collision graphic above the player, but below the help text
    if (process.env.NODE_ENV === "development") {
      const graphics = this.add.graphics().setAlpha(0.75).setDepth(20);
      this.obstaclesLayer.renderDebug(graphics, {
        tileColor: null, // Color of non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
      });
    }
  }

  private createMap() {
    // create the map
    this.map = this.make.tilemap({
      key: this.tileMapKey,
    });

    // Set current map Bounds
    this.scene.scene.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    const tileSetName = MapScene.getDefaultTilesetName(this.tileSetKey);
    const tileSet = this.map.addTilesetImage(tileSetName, this.tileSetKey);

    // creating the layers
    this.map.createStaticLayer("Floor", tileSet, 0, 0);
    this.obstaclesLayer = this.map.createStaticLayer("Walls", tileSet, 0, 0);

    // Create collision for obstacles layer
    this.obstaclesLayer.setCollision([5, 47]);
  }

  private static getDefaultTilesetName(tilesetKey: string): string {
    return tilesetKey.slice(tilesetKey.lastIndexOf("/") + 1);
  }

  private updateCamera() {
    // limit camera to map
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
    this.cameras.main.setZoom(3);
    this.cameras.main.startFollow(this.player, true);
  }

  update(time: number, delta: number) {
    // Loop the player update method
    this.player.update(time, delta);
  }

  private updateRoom() {
    this.room.onMessage(RoomEvents.CURRENT_PLAYERS, (data) => {
      // console.debug(RoomEvents.CURRENT_PLAYERS, data);
      Object.keys(data.players).forEach((playerId) => {
        const player: ServerPlayer = data.players[playerId];

        if (playerId !== this.room.sessionId) {
          this.onlinePlayers[player.sessionId] = new OnlinePlayer(this, player);
          this.enemies.add(this.onlinePlayers[player.sessionId]);
        }
      });
    });
    this.room.onMessage(RoomEvents.PLAYER_JOINED, (data: ServerPlayer) => {
      // console.debug(RoomEvents.PLAYER_JOINED, data);
      if (!this.onlinePlayers[data.sessionId]) {
        this.onlinePlayers[data.sessionId] = new OnlinePlayer(this, data);
        this.enemies.add(this.onlinePlayers[data.sessionId]);
      }
    });
    this.room.onMessage(RoomEvents.PLAYER_LEFT, (data) => {
      // console.debug("PLAYER_LEFT");
      if (this.onlinePlayers[data.sessionId]) {
        this.enemies.remove(this.onlinePlayers[data.sessionId]);
        this.onlinePlayers[data.sessionId].destroy();
        delete this.onlinePlayers[data.sessionId];
      }
    });
    this.room.onMessage(RoomEvents.PLAYER_MOVED, (data: ServerPlayer) => {
      if (!this.onlinePlayers[data.sessionId]) {
        this.onlinePlayers[data.sessionId] = new OnlinePlayer(this, data);
        this.enemies.add(this.onlinePlayers[data.sessionId]);
      }
      // Start animation and set sprite position
      this.onlinePlayers[data.sessionId].isWalking(
        data.position,
        data.x,
        data.y
      );
    });
    this.room.onMessage(
      RoomEvents.PLAYER_MOVEMENT_ENDED,
      (data: ServerPlayer) => {
        if (!this.onlinePlayers[data.sessionId]) {
          this.enemies.add(this.onlinePlayers[data.sessionId]);
          this.onlinePlayers[data.sessionId] = new OnlinePlayer(this, data);
        }
        // Stop animation & set sprite texture
        this.onlinePlayers[data.sessionId].stopWalking(data.position);
      }
    );
    this.room.onMessage(RoomEvents.LASER_MOVED, (data: ServerLaser) => {
      if (this.onlineLasers.getLength() > 0) {
        this.onlineLasers.getChildren()[0].destroy(true);
      }
      this.onlineLasers.add(
        new OnlineLaser(this, data.x, data.y, data.position)
      );
    });
  }
}
