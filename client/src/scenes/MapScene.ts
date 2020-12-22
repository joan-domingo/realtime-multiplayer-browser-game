import { Scene } from "phaser";
import Tilemap = Phaser.Tilemaps.Tilemap;
import StaticTilemapLayer = Phaser.Tilemaps.StaticTilemapLayer;
import { roomClient } from "../app";
import { Room } from "colyseus.js";
import OnlinePlayerSprite from "../sprites/OnlinePlayerSprite";
import PlayerSprite from "../sprites/PlayerSprite";
import {
  ClientRoomEvents,
  ServerLaser,
  ServerPlayer,
  SpecialEffects,
} from "../clientModels";
import Group = Phaser.GameObjects.Group;
import GameObject = Phaser.GameObjects.GameObject;
import OnlineLaserSprite from "../sprites/OnlineLaserSprite";
import TiledObject = Phaser.Types.Tilemaps.TiledObject;

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
  private player: PlayerSprite;
  // Online players
  onlinePlayerKey: string;
  private onlinePlayers: { [sessionId: string]: OnlinePlayerSprite } = {};
  enemies: Group;
  // Laser
  laserKey: string;
  horizontalLaserKey: string;
  onlineLaserKey: string;
  horizontalOnlineLaserKey: string;
  sfx: SpecialEffects;
  private onlineLasers: { [laserId: string]: OnlineLaserSprite } = {};
  enemyLasers: Group;

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

    this.laserKey = "laser";
    this.horizontalLaserKey = "laser_horizontal";
    this.onlineLaserKey = "onlineLaser";
    this.horizontalOnlineLaserKey = "onlineLaser_horizontal";
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

    // Load lasers
    this.load.image(this.laserKey, "assets/images/laser.png");
    this.load.image(
      this.horizontalLaserKey,
      "assets/images/laser_horizontal.png"
    );
    this.load.image(this.onlineLaserKey, "assets/images/onlineLaser.png");
    this.load.image(
      this.horizontalOnlineLaserKey,
      "assets/images/onlineLaser_horizontal.png"
    );
    this.load.audio("sndLaserPlayer", "assets/sounds/sndLaserPlayer.wav");
  }

  create() {
    // create map
    this.createMap();

    // create player
    const spawnPoint: TiledObject = {
      ...this.map.findObject("Objects", (obj) => obj.name === "Spawn Point"),
      id: 0,
    };
    this.player = new PlayerSprite(this, spawnPoint);

    // Online players
    this.enemies = this.add.group();
    this.enemyLasers = this.add.group();

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
    this.obstaclesLayer.setCollision([5, 15, 72, 47]);
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
    this.room.onMessage(ClientRoomEvents.CURRENT_PLAYERS, (data) => {
      // console.debug(RoomEvents.CURRENT_PLAYERS, data);
      Object.keys(data.players).forEach((playerId) => {
        const player: ServerPlayer = data.players[playerId];

        if (playerId !== this.room.sessionId) {
          this.onlinePlayers[player.sessionId] = new OnlinePlayerSprite(
            this,
            player
          );
          this.enemies.add(this.onlinePlayers[player.sessionId]);
        }
      });
    });
    this.room.onMessage(
      ClientRoomEvents.PLAYER_JOINED,
      (data: ServerPlayer) => {
        // console.debug(RoomEvents.PLAYER_JOINED, data);
        if (!this.onlinePlayers[data.sessionId]) {
          this.onlinePlayers[data.sessionId] = new OnlinePlayerSprite(
            this,
            data
          );
          this.enemies.add(this.onlinePlayers[data.sessionId]);
        }
      }
    );
    this.room.onMessage(ClientRoomEvents.PLAYER_LEFT, (data) => {
      // console.debug("PLAYER_LEFT");
      if (this.onlinePlayers[data.sessionId]) {
        this.enemies.remove(this.onlinePlayers[data.sessionId]);
        this.onlinePlayers[data.sessionId].destroy();
        delete this.onlinePlayers[data.sessionId];
      }
    });
    this.room.onMessage(ClientRoomEvents.PLAYER_MOVED, (data: ServerPlayer) => {
      if (!this.onlinePlayers[data.sessionId]) {
        this.onlinePlayers[data.sessionId] = new OnlinePlayerSprite(this, data);
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
      ClientRoomEvents.PLAYER_MOVEMENT_ENDED,
      (data: ServerPlayer) => {
        if (!this.onlinePlayers[data.sessionId]) {
          this.enemies.add(this.onlinePlayers[data.sessionId]);
          this.onlinePlayers[data.sessionId] = new OnlinePlayerSprite(
            this,
            data
          );
        }
        // Stop animation & set sprite texture
        this.onlinePlayers[data.sessionId].stopWalking(data.position);
      }
    );
    this.room.onMessage(ClientRoomEvents.PLAYER_DIED, (data: ServerPlayer) => {
      if (this.room.sessionId === data.sessionId) {
        this.player.die();
      } else {
        if (!this.onlinePlayers[data.sessionId]) {
          this.enemies.add(this.onlinePlayers[data.sessionId]);
          this.onlinePlayers[data.sessionId] = new OnlinePlayerSprite(
            this,
            data
          );
        }
        this.onlinePlayers[data.sessionId].die();
        // TODO show seconds counter back to life
      }
    });
    this.room.onMessage(
      ClientRoomEvents.PLAYER_REVIVED,
      (data: ServerPlayer) => {
        if (this.room.sessionId === data.sessionId) {
          this.player.revive(data.x, data.y);
        } else {
          if (!this.onlinePlayers[data.sessionId]) {
            this.enemies.add(this.onlinePlayers[data.sessionId]);
            this.onlinePlayers[data.sessionId] = new OnlinePlayerSprite(
              this,
              data
            );
          }
          this.onlinePlayers[data.sessionId].revive(data.x, data.y);
        }
      }
    );
    this.room.onMessage(ClientRoomEvents.LASER_MOVED, (data: ServerLaser) => {
      if (!this.onlineLasers[data.laserId]) {
        this.onlineLasers[data.laserId] = new OnlineLaserSprite(
          this,
          data.x,
          data.y,
          data.position
        );
        this.enemyLasers.add(this.onlineLasers[data.laserId]);
      }
      this.onlineLasers[data.laserId].move(data.x, data.y);
    });
    this.room.onMessage(
      ClientRoomEvents.LASER_ENDED,
      (data: { laserId: string }) => {
        if (this.onlineLasers[data.laserId]) {
          this.enemyLasers.remove(this.onlineLasers[data.laserId]);
          this.onlineLasers[data.laserId].destroy();
          delete this.onlineLasers[data.laserId];
        }
      }
    );
  }
}
