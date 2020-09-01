import { Schema, type } from "@colyseus/schema";
import { Client, LobbyRoom, Room } from "colyseus";
import { LobbyOptions } from "colyseus/lib/rooms/LobbyRoom";

export class MyRoom extends Room {
  private players: any = {};

  onCreate(options: any) {
    console.log("ON CREATE");

    this.onMessage("PLAYER_MOVED", (player, data) => {
      console.log("PLAYER_MOVED");
      this.players[player.sessionId].x = data.x;
      this.players[player.sessionId].y = data.y;

      this.broadcast(
        "PLAYER_MOVED",
        {
          ...this.players[player.sessionId],
          position: data.position,
        },
        { except: player }
      );
    });

    this.onMessage("PLAYER_MOVEMENT_ENDED", (player, data) => {
      console.log("PLAYER_MOVEMENT_ENDED");
      this.broadcast(
        "PLAYER_MOVEMENT_ENDED",
        {
          sessionId: player.sessionId,
          map: this.players[player.sessionId].map,
          position: data.position,
        },
        { except: player }
      );
    });

    this.onMessage("PLAYER_CHANGED_MAP", (player, data) => {
      console.log("PLAYER_CHANGED_MAP");
      this.players[player.sessionId].map = data.map;

      // this.send(player, {event: "CURRENT_PLAYERS", players: players})

      this.broadcast("PLAYER_CHANGED_MAP", {
        sessionId: player.sessionId,
        map: this.players[player.sessionId].map,
        x: 300,
        y: 75,
        players: this.players,
      });
    });

    this.onMessage("*", (client, type, message) => {
      console.log(JSON.stringify(client), "sent", type, message);
    });
  }

  onJoin(player: Client, options: any) {
    console.log("ON JOIN", JSON.stringify(player), this.players);

    this.players[player.sessionId] = {
      sessionId: player.sessionId,
      map: "town",
      x: 352,
      y: 1216,
    };

    setTimeout(
      () =>
        player.send("CURRENT_PLAYERS", {
          players: this.players,
        }),
      500
    );
    this.broadcast(
      "PLAYER_JOINED",
      { ...this.players[player.sessionId] },
      { except: player }
    );
  }

  onLeave(player: Client, consented: boolean) {
    console.log("ON LEAVE");

    this.broadcast("PLAYER_LEFT", {
      sessionId: player.sessionId,
      map: this.players[player.sessionId].map,
    });
    delete this.players[player.sessionId];
  }

  onDispose() {
    console.log("ON DISPOSE");
  }
}
