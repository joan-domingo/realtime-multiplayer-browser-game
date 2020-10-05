"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyRoom = void 0;
const colyseus_1 = require("colyseus");
class MyRoom extends colyseus_1.Room {
    constructor() {
        super(...arguments);
        this.players = {};
    }
    onCreate(options) {
        console.debug("ON CREATE");
        this.onMessage("PLAYER_MOVED", (player, data) => {
            this.players[player.sessionId].x = data.x;
            this.players[player.sessionId].y = data.y;
            this.broadcast("PLAYER_MOVED", Object.assign(Object.assign({}, this.players[player.sessionId]), { position: data.position }), { except: player });
        });
        this.onMessage("PLAYER_MOVEMENT_ENDED", (player, data) => {
            this.broadcast("PLAYER_MOVEMENT_ENDED", {
                sessionId: player.sessionId,
                map: this.players[player.sessionId].map,
                position: data.position,
            }, { except: player });
        });
        this.onMessage("*", (client, type) => {
            console.debug("messageType not handled by the Room: " + type);
        });
    }
    onJoin(player, options) {
        console.debug("ON JOIN");
        this.players[player.sessionId] = {
            sessionId: player.sessionId,
            map: "town",
            x: 352,
            y: 1216,
        };
        setTimeout(() => player.send("CURRENT_PLAYERS", {
            players: this.players,
        }), 500);
        this.broadcast("PLAYER_JOINED", Object.assign({}, this.players[player.sessionId]), { except: player });
    }
    onLeave(player, consented) {
        console.debug("ON LEAVE");
        this.broadcast("PLAYER_LEFT", {
            sessionId: player.sessionId,
            map: this.players[player.sessionId].map,
        });
        delete this.players[player.sessionId];
    }
    onDispose() {
        console.debug("ON DISPOSE");
    }
}
exports.MyRoom = MyRoom;
