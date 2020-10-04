"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapScene = void 0;
const phaser_1 = require("phaser");
const app_1 = require("../app");
const OnlinePlayer_1 = __importDefault(require("../players/OnlinePlayer"));
const Player_1 = __importDefault(require("../players/Player"));
const PlayerLaser_1 = __importDefault(require("../players/PlayerLaser"));
class MapScene extends phaser_1.Scene {
    constructor() {
        super("MapScene");
    }
    preload() {
        // map tiles
        this.load.image("tiles", "assets/map/spritesheet-extruded.png");
        // map in json format
        this.load.tilemapTiledJSON("map", "assets/map/map.json");
        // Load player atlas
        this.load.atlas("currentPlayer", "assets/atlas/atlas.png", "assets/atlas/atlas.json");
        // Load online player atlas
        this.load.atlas("players", "assets/images/players/players.png", "assets/atlas/players.json");
        // Load player laser
        this.load.image("sprLaserPlayer", "assets/sprLaserPlayer.png");
        this.load.audio("sndLaserPlayer", "assets/sndLaserPlayer.wav");
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
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
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
    }
    createMap() {
        // create the map
        this.map = this.make.tilemap({
            key: "map",
        });
        // first parameter is the name of the tilemap in tiled
        const tiles = this.map.addTilesetImage("spritesheet", "tiles", 16, 16, 1, 2);
        // creating the layers
        this.map.createStaticLayer("Grass", tiles, 0, 0);
        this.obstaclesLayer = this.map.createStaticLayer("Obstacles", tiles, 0, 0);
        // don't go out of the map
        this.physics.world.bounds.width = this.map.widthInPixels;
        this.physics.world.bounds.height = this.map.heightInPixels;
    }
    createAnimations() {
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
    createPlayer() {
        // our player sprite
        this.player = new Player_1.default({
            scene: this,
            worldLayer: this.obstaclesLayer,
            key: "currentplayer",
            x: 50,
            y: 100,
        });
    }
    updateCamera() {
        // limit camera to map
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.roundPixels = true; // avoid tile bleed
    }
    update(time, delta) {
        // Loop the player update method
        this.player.update(time, delta);
        // Horizontal movement
        if (this.cursors.left.isDown) {
            if (this.socketKey) {
                if (this.player.isMoved()) {
                    app_1.room.then((room) => room.send("PLAYER_MOVED", {
                        position: "left",
                        // @ts-ignore
                        x: this.player.x,
                        // @ts-ignore
                        y: this.player.y,
                    }));
                }
                this.socketKey = false;
            }
        }
        else if (this.cursors.right.isDown) {
            if (this.socketKey) {
                if (this.player.isMoved()) {
                    app_1.room.then((room) => room.send("PLAYER_MOVED", {
                        position: "right",
                        // @ts-ignore
                        x: this.player.x,
                        // @ts-ignore
                        y: this.player.y,
                    }));
                }
                this.socketKey = false;
            }
        }
        // Vertical movement
        if (this.cursors.up.isDown) {
            if (this.socketKey) {
                if (this.player.isMoved()) {
                    app_1.room.then((room) => room.send("PLAYER_MOVED", {
                        position: "back",
                        // @ts-ignore
                        x: this.player.x,
                        // @ts-ignore
                        y: this.player.y,
                    }));
                }
                this.socketKey = false;
            }
        }
        else if (this.cursors.down.isDown) {
            if (this.socketKey) {
                if (this.player.isMoved()) {
                    app_1.room.then((room) => room.send("PLAYER_MOVED", {
                        position: "front",
                        // @ts-ignore
                        x: this.player.x,
                        // @ts-ignore
                        y: this.player.y,
                    }));
                }
                this.socketKey = false;
            }
        }
        // Horizontal movement ended
        if (Phaser.Input.Keyboard.JustUp(this.cursors.left) === true) {
            app_1.room.then((room) => room.send("PLAYER_MOVEMENT_ENDED", { position: "left" }));
        }
        else if (Phaser.Input.Keyboard.JustUp(this.cursors.right) === true) {
            app_1.room.then((room) => room.send("PLAYER_MOVEMENT_ENDED", { position: "right" }));
        }
        // Vertical movement ended
        if (Phaser.Input.Keyboard.JustUp(this.cursors.up) === true) {
            app_1.room.then((room) => room.send("PLAYER_MOVEMENT_ENDED", { position: "back" }));
        }
        else if (Phaser.Input.Keyboard.JustUp(this.cursors.down) === true) {
            app_1.room.then((room) => room.send("PLAYER_MOVEMENT_ENDED", { position: "front" }));
        }
    }
    createOnlinePlayerAnimations() {
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
    updateRoom() {
        app_1.room.then((room) => {
            room.onMessage("CURRENT_PLAYERS", (data) => {
                console.log("CURRENT_PLAYERS");
                Object.keys(data.players).forEach((playerId) => {
                    let player = data.players[playerId];
                    if (playerId !== room.sessionId) {
                        app_1.onlinePlayers[player.sessionId] = new OnlinePlayer_1.default({
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
                if (!app_1.onlinePlayers[data.sessionId]) {
                    app_1.onlinePlayers[data.sessionId] = new OnlinePlayer_1.default({
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
                if (app_1.onlinePlayers[data.sessionId]) {
                    app_1.onlinePlayers[data.sessionId].destroy();
                    delete app_1.onlinePlayers[data.sessionId];
                }
            });
            room.onMessage("PLAYER_MOVED", (data) => {
                if (!app_1.onlinePlayers[data.sessionId].scene) {
                    app_1.onlinePlayers[data.sessionId] = new OnlinePlayer_1.default({
                        scene: this,
                        playerId: data.sessionId,
                        key: data.sessionId,
                        x: data.x,
                        y: data.y,
                    });
                }
                // Start animation and set sprite position
                app_1.onlinePlayers[data.sessionId].isWalking(data.position, data.x, data.y);
            });
            room.onMessage("PLAYER_MOVEMENT_ENDED", (data) => {
                // If player isn't registered in this scene (map changing bug..)
                if (!app_1.onlinePlayers[data.sessionId].scene) {
                    app_1.onlinePlayers[data.sessionId] = new OnlinePlayer_1.default({
                        scene: this,
                        playerId: data.sessionId,
                        key: data.sessionId,
                        x: data.x,
                        y: data.y,
                    });
                }
                // Stop animation & set sprite texture
                app_1.onlinePlayers[data.sessionId].stopWalking(data.position);
            });
        });
    }
    movementTimer() {
        setInterval(() => {
            this.socketKey = true;
        }, 50);
    }
    updateLasers() {
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
    updatePlayerShooting() {
        this.time.addEvent({
            delay: 0,
            callback: function () {
                if (this.keySpace.isDown && this.player.active) {
                    if (this.playerShootTick < this.playerShootDelay) {
                        this.playerShootTick++;
                    }
                    else {
                        const laser = new PlayerLaser_1.default(this, this.player.x, this.player.y);
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
exports.MapScene = MapScene;
//# sourceMappingURL=MapScene.js.map