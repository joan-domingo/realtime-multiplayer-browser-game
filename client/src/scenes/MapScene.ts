import { Scene } from "phaser";
import Tilemap = Phaser.Tilemaps.Tilemap;
import StaticTilemapLayer = Phaser.Tilemaps.StaticTilemapLayer;
import { roomClient } from "../app";
import { Room } from "colyseus.js";
import OnlinePlayer from "../players/OnlinePlayer";
import Player from "../players/Player";
import { RoomEvents, ServerPlayer, SpecialEffects } from "../types";
import Group = Phaser.GameObjects.Group;

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
  // controls
  // Laser
  private sfx: SpecialEffects;
  private playerLasers: Group;
  private enemyLasers: Group;
  private playerShootDelay: number;
  private playerShootTick: number;

  constructor() {
    super("MapScene");
  }

  init(data: { nickname: string }): void {
    // room
    this.room = roomClient.getRoomInstance();

    // map
    this.tileMapKey = "/assets/tilemaps/test_map";
    this.tileSetKey = "/assets/tilesets/tiles";

    // player
    this.playerKey = "currentPlayer";
    this.playerNickname = data.nickname;

    // Online player
    this.onlinePlayerKey = "onlinePlayer";
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
    this.load.image("sprLaserPlayer", "assets/images/sprLaserPlayer.png");
    this.load.audio("sndLaserPlayer", "assets/sounds/sndLaserPlayer.wav");
  }

  create() {
    // create map
    this.createMap();

    // create player
    this.player = new Player(this);

    // update camera
    this.updateCamera();

    // user input
    //this.cursors = this.input.keyboard.createCursorKeys();

    // React to room changes
    this.updateRoom();

    // Special effects
    this.createLasers();

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
    this.map.createStaticLayer("floor", tileSet, 0, 0);
    this.obstaclesLayer = this.map.createStaticLayer("walls", tileSet, 0, 0);
    const aboveLayer = this.map.createStaticLayer("top", tileSet, 0, 0);

    // Create collision for obstacles layer
    this.obstaclesLayer.setCollision([7, 10, 13, 14, 49, 50, 53, 54, 59, 60]);

    // Layer hides player
    this.obstaclesLayer.setDepth(10);
    aboveLayer.setDepth(10);
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
        }
      });
    });
    this.room.onMessage(RoomEvents.PLAYER_JOINED, (data: ServerPlayer) => {
      // console.debug(RoomEvents.PLAYER_JOINED, data);
      if (!this.onlinePlayers[data.sessionId]) {
        this.onlinePlayers[data.sessionId] = new OnlinePlayer(this, data);
      }
    });
    this.room.onMessage(RoomEvents.PLAYER_LEFT, (data) => {
      // console.debug("PLAYER_LEFT");
      if (this.onlinePlayers[data.sessionId]) {
        this.onlinePlayers[data.sessionId].destroy();
        delete this.onlinePlayers[data.sessionId];
      }
    });
    this.room.onMessage(RoomEvents.PLAYER_MOVED, (data: ServerPlayer) => {
      if (!this.onlinePlayers[data.sessionId]) {
        this.onlinePlayers[data.sessionId] = new OnlinePlayer(this, data);
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
          this.onlinePlayers[data.sessionId] = new OnlinePlayer(this, data);
        }
        // Stop animation & set sprite texture
        this.onlinePlayers[data.sessionId].stopWalking(data.position);
      }
    );
  }

  private createLasers() {
    this.sfx = {
      laserPlayer: this.sound.add("sndLaserPlayer"),
      laserEnemy: this.sound.add("sndLaserPlayer"),
    };

    this.enemyLasers = this.add.group();
    this.playerLasers = this.add.group();

    this.updateLasers();
    this.updatePlayerShooting();

    this.playerShootDelay = 30;
    this.playerShootTick = 30;
  }

  private updateLasers() {
    this.time.addEvent({
      delay: 30,
      callback: function () {
        for (let i = 0; i < this.playerLasers.getChildren().length; i++) {
          const laser = this.playerLasers.getChildren()[i];

          laser.y -= laser.displayHeight;

          if (laser.y < 1) {
            // this.createExplosion(laser.x, laser.y);

            if (laser) {
              laser.destroy();
            }
          }
        }
      },
      callbackScope: this,
      loop: true,
    });
  }

  private updatePlayerShooting() {
    /*const spaceKey = this.cursors.space;
    this.time.addEvent({
      delay: 0,
      callback: function () {
        if (spaceKey.isDown && this.player.active) {
          if (this.playerShootTick < this.playerShootDelay) {
            this.playerShootTick++;
          } else {
            const laser = new PlayerLaser(this, this.player.x, this.player.y);
            this.playerLasers.add(laser);

            // this.sfx.laserPlayer.play();

            this.playerShootTick = 0;
          }
        }
      },
      callbackScope: this,
      loop: true,
    });*/
  }
}
