import { Scene } from "phaser";
import Tilemap = Phaser.Tilemaps.Tilemap;
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;
import StaticTilemapLayer = Phaser.Tilemaps.StaticTilemapLayer;
import { onlinePlayers } from "../app";
import { Room } from "colyseus.js";
import OnlinePlayer from "../players/OnlinePlayer";
import Player from "../players/Player";
import { SpecialEffects } from "../types";
import Group = Phaser.GameObjects.Group;
import PlayerLaser from "../players/PlayerLaser";
import Key = Phaser.Input.Keyboard.Key;

export class MapScene extends Scene {
  // room
  private room: Room;
  // map
  private tileMapKey: string;
  private tileSetKey: string;
  // player
  private playerKey: string;
  private playerTextureUrl: string;
  private playerAtlastUrl: string;
  private playerNickname: string;
  // online player
  private onlinePlayerKey: string;
  private onlinePlayerTextureUrl: string;
  private onlinePlayerAtlastUrl: string;

  map: Tilemap;
  player: Player;
  cursors: CursorKeys;
  obstaclesLayer: StaticTilemapLayer;
  socketKey: boolean;
  sfx: SpecialEffects;
  playerLasers: Group;
  enemyLasers: Group;
  private playerShootDelay: number;
  private playerShootTick: number;
  keySpace: Key;

  constructor() {
    super("MapScene");
  }

  init(data: { nickname: string; room: Room }): void {
    // room
    this.room = data.room;

    // map
    this.tileMapKey = "/assets/tilemaps/test_map";
    this.tileSetKey = "/assets/tilesets/tiles";

    // player
    this.playerKey = "currentPlayer";
    this.playerTextureUrl = "assets/atlas/sprite_jedi.png";
    this.playerAtlastUrl = "assets/atlas/sprite_jedi.json";
    this.playerNickname = data.nickname;

    // Online player
    this.onlinePlayerKey = "players";
    this.onlinePlayerTextureUrl = "assets/atlas/sprite_stormtrooper.png";
    this.onlinePlayerAtlastUrl = "assets/atlas/sprite_stormtrooper.json";
  }

  preload() {
    this.load.image(this.tileSetKey);
    this.load.tilemapTiledJSON(this.tileMapKey);

    // Load player atlas
    this.load.atlas(
      this.playerKey,
      this.playerTextureUrl,
      this.playerAtlastUrl
    );

    // Load online player atlas
    this.load.atlas(
      this.onlinePlayerKey,
      this.onlinePlayerTextureUrl,
      this.onlinePlayerAtlastUrl
    );

    // Load player laser
    this.load.image("sprLaserPlayer", "assets/images/sprLaserPlayer.png");
    this.load.audio("sndLaserPlayer", "assets/sounds/sndLaserPlayer.wav");
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

    // user input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keySpace = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // React to room changes
    this.updateRoom();

    this.movementTimer();

    // Special effects
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

  private createAnimations() {
    // Create the player's walking animations from the texture currentPlayer. These are stored in the global
    // animation manager so any sprite can access them.
    this.anims.create({
      key: "jedi-front",
      frames: this.anims.generateFrameNames(this.playerKey, {
        start: 0,
        end: 3,
        zeroPad: 2,
        prefix: "jedi-front-",
        suffix: ".png",
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "jedi-back",
      frames: this.anims.generateFrameNames(this.playerKey, {
        prefix: "jedi-back-",
        start: 0,
        end: 3,
        zeroPad: 2,
        suffix: ".png",
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "jedi-right",
      frames: this.anims.generateFrameNames(this.playerKey, {
        prefix: "jedi-right-",
        start: 0,
        end: 3,
        zeroPad: 2,
        suffix: ".png",
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "jedi-left",
      frames: this.anims.generateFrameNames(this.playerKey, {
        prefix: "jedi-left-",
        start: 0,
        end: 3,
        zeroPad: 2,
        suffix: ".png",
      }),
      frameRate: 10,
      repeat: -1,
    });
  }

  private createOnlinePlayerAnimations() {
    // onlinePlayer animations
    this.anims.create({
      key: "stormtrooper-front",
      frames: this.anims.generateFrameNames(this.onlinePlayerKey, {
        start: 0,
        end: 3,
        zeroPad: 2,
        prefix: "stormtrooper-front-",
        suffix: ".png",
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "stormtrooper-back",
      frames: this.anims.generateFrameNames(this.onlinePlayerKey, {
        prefix: "stormtrooper-back-",
        start: 0,
        end: 3,
        zeroPad: 2,
        suffix: ".png",
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "stormtrooper-right",
      frames: this.anims.generateFrameNames(this.onlinePlayerKey, {
        prefix: "stormtrooper-right-",
        start: 0,
        end: 3,
        zeroPad: 2,
        suffix: ".png",
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "stormtrooper-left",
      frames: this.anims.generateFrameNames(this.onlinePlayerKey, {
        prefix: "stormtrooper-left-",
        start: 0,
        end: 3,
        zeroPad: 2,
        suffix: ".png",
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
      key: this.playerKey,
      x: 50,
      y: 100,
      nickname: this.playerNickname,
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
    this.cameras.main.setZoom(3);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  update(time: number, delta: number) {
    // Loop the player update method
    this.player.update(time, delta);

    // Horizontal movement
    if (this.cursors.left.isDown) {
      if (this.socketKey) {
        if (this.player.isMoved()) {
          this.room.send("PLAYER_MOVED", {
            position: "left",
            // @ts-ignore
            x: this.player.x,
            // @ts-ignore
            y: this.player.y,
          });
        }
        this.socketKey = false;
      }
    } else if (this.cursors.right.isDown) {
      if (this.socketKey) {
        if (this.player.isMoved()) {
          this.room.send("PLAYER_MOVED", {
            position: "right",
            // @ts-ignore
            x: this.player.x,
            // @ts-ignore
            y: this.player.y,
          });
        }
        this.socketKey = false;
      }
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      if (this.socketKey) {
        if (this.player.isMoved()) {
          this.room.send("PLAYER_MOVED", {
            position: "back",
            // @ts-ignore
            x: this.player.x,
            // @ts-ignore
            y: this.player.y,
          });
        }
        this.socketKey = false;
      }
    } else if (this.cursors.down.isDown) {
      if (this.socketKey) {
        if (this.player.isMoved()) {
          this.room.send("PLAYER_MOVED", {
            position: "front",
            // @ts-ignore
            x: this.player.x,
            // @ts-ignore
            y: this.player.y,
          });
        }
        this.socketKey = false;
      }
    }

    // Horizontal movement ended
    if (Phaser.Input.Keyboard.JustUp(this.cursors.left) === true) {
      this.room.send("PLAYER_MOVEMENT_ENDED", { position: "left" });
    } else if (Phaser.Input.Keyboard.JustUp(this.cursors.right) === true) {
      this.room.send("PLAYER_MOVEMENT_ENDED", { position: "right" });
    }

    // Vertical movement ended
    if (Phaser.Input.Keyboard.JustUp(this.cursors.up) === true) {
      this.room.send("PLAYER_MOVEMENT_ENDED", { position: "back" });
    } else if (Phaser.Input.Keyboard.JustUp(this.cursors.down) === true) {
      this.room.send("PLAYER_MOVEMENT_ENDED", { position: "front" });
    }
  }

  private updateRoom() {
    this.room.onMessage("CURRENT_PLAYERS", (data) => {
      console.debug("CURRENT_PLAYERS");
      Object.keys(data.players).forEach((playerId) => {
        let player = data.players[playerId];

        if (playerId !== this.room.sessionId) {
          onlinePlayers[player.sessionId] = new OnlinePlayer({
            scene: this,
            playerId: player.sessionId,
            key: player.sessionId,
            x: player.x,
            y: player.y,
            nickname: player.nickname,
          });
        }
      });
    });
    this.room.onMessage("PLAYER_JOINED", (data) => {
      console.debug("PLAYER_JOINED", data.nickname);
      if (!onlinePlayers[data.sessionId]) {
        onlinePlayers[data.sessionId] = new OnlinePlayer({
          scene: this,
          playerId: data.sessionId,
          key: data.sessionId,
          x: data.x,
          y: data.y,
          nickname: data.nickname,
        });
      }
    });
    this.room.onMessage("PLAYER_LEFT", (data) => {
      console.debug("PLAYER_LEFT");
      if (onlinePlayers[data.sessionId]) {
        onlinePlayers[data.sessionId].destroy();
        delete onlinePlayers[data.sessionId];
      }
    });
    this.room.onMessage("PLAYER_MOVED", (data) => {
      if (!onlinePlayers[data.sessionId].scene) {
        onlinePlayers[data.sessionId] = new OnlinePlayer({
          scene: this,
          playerId: data.sessionId,
          key: data.sessionId,
          x: data.x,
          y: data.y,
          nickname: data.nickname,
        });
      }
      // Start animation and set sprite position
      onlinePlayers[data.sessionId].isWalking(data.position, data.x, data.y);
    });
    this.room.onMessage("PLAYER_MOVEMENT_ENDED", (data) => {
      // If player isn't registered in this scene (map changing bug..)
      if (!onlinePlayers[data.sessionId].scene) {
        onlinePlayers[data.sessionId] = new OnlinePlayer({
          scene: this,
          playerId: data.sessionId,
          key: data.sessionId,
          x: data.x,
          y: data.y,
          nickname: data.nickname,
        });
      }
      // Stop animation & set sprite texture
      onlinePlayers[data.sessionId].stopWalking(data.position);
    });
  }

  movementTimer() {
    setInterval(() => {
      this.socketKey = true;
    }, 50);
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
    this.time.addEvent({
      delay: 0,
      callback: function () {
        if (this.keySpace.isDown && this.player.active) {
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
    });
  }
}
