import { Client, Room } from "colyseus";
import { Player, PlayerLaser, Players } from "../types";

export class MyRoom extends Room {
  // this room supports only 4 clients connected
  // maxClients = 4;
  private players: Players = {};

  constructor(options: any) {
    super();
    this.setState({
      messages: [`Welcome to the most awesome game ever. Starting room...`],
    });
  }

  onCreate(options: { nickname: string }) {
    // console.debug("ON CREATE", options);

    this.onMessage("PLAYER_MOVED", (player, data) => {
      this.players[player.sessionId].x = data.x;
      this.players[player.sessionId].y = data.y;

      this.broadcast(
        "PLAYER_MOVED",
        {
          ...this.players[player.sessionId],
          position: data.position,
          nickname: options.nickname,
        } as Player,
        { except: player }
      );
    });

    this.onMessage("PLAYER_MOVEMENT_ENDED", (player, data) => {
      this.broadcast(
        "PLAYER_MOVEMENT_ENDED",
        {
          sessionId: player.sessionId,
          map: this.players[player.sessionId].map,
          position: data.position,
          nickname: options.nickname,
        } as Player,
        { except: player }
      );
    });

    this.onMessage("message", (player, message) => {
      /*console.debug(
        "Room received message from",
        client.sessionId,
        ":",
        message
      );*/
      this.state.messages.push(
        `${this.getPlayerNickname(player.sessionId)}: ${message}`
      );
    });

    this.onMessage(
      "LASER_MOVED",
      (player, message: { position: string; x: number; y: number }) => {
        this.broadcast(
          "LASER_MOVED",
          {
            sessionId: player.sessionId,
            position: message.position,
            x: message.x,
            y: message.y,
          } as PlayerLaser,
          { except: player }
        );
      }
    );

    this.onMessage("PLAYER_DIED", (_player, message: { sessionId: string }) => {
      this.state.messages.push(
        `${this.getPlayerNickname(message.sessionId)}: DEAD!!`
      );
    });

    this.onMessage("*", (client, type) => {
      console.warn("messageType not handled by the Room: " + type);
    });
  }

  onJoin(player: Client, options: { nickname: string }) {
    // console.debug("ON JOIN", options);

    this.players[player.sessionId] = {
      sessionId: player.sessionId,
      map: "town",
      x: 50,
      y: 100,
      nickname: options.nickname,
      position: "front",
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

    this.state.messages.push(`${options.nickname} joined. Say hello!`);
  }

  onLeave(player: Client, consented: boolean) {
    // console.debug("ON LEAVE", player);
    this.state.messages.push(
      `${this.getPlayerNickname(player.sessionId)} left.`
    );

    this.broadcast("PLAYER_LEFT", {
      sessionId: player.sessionId,
      map: this.players[player.sessionId].map,
    });
    delete this.players[player.sessionId];
  }

  onDispose() {
    // console.debug("ON DISPOSE");
  }

  getPlayerNickname(sessionId: string): string {
    return this.players[sessionId].nickname;
  }
}
