import { Client, Room } from "colyseus";
import {
  ServerPlayer,
  ServerLaser,
  ServerPlayers,
  ServerRoomEvents,
} from "../serverModels";

export class MyRoom extends Room {
  // this room supports only 4 clients connected
  // maxClients = 4;
  private players: ServerPlayers = {};

  constructor(options: any) {
    super();
    this.setState({
      messages: [`Welcome to the most awesome game ever. Starting room...`],
    });
  }

  onCreate(options: { nickname: string }) {
    // console.debug("ON CREATE", options);

    this.onMessage(ServerRoomEvents.PLAYER_MOVED, (player, data) => {
      this.players[player.sessionId].x = data.x;
      this.players[player.sessionId].y = data.y;

      this.broadcast(
        ServerRoomEvents.PLAYER_MOVED,
        {
          ...this.players[player.sessionId],
          position: data.position,
          nickname: options.nickname,
        } as ServerPlayer,
        { except: player }
      );
    });

    this.onMessage(ServerRoomEvents.PLAYER_MOVEMENT_ENDED, (player, data) => {
      this.broadcast(
        ServerRoomEvents.PLAYER_MOVEMENT_ENDED,
        {
          sessionId: player.sessionId,
          map: this.players[player.sessionId].map,
          position: data.position,
          nickname: options.nickname,
        } as ServerPlayer,
        { except: player }
      );
    });

    this.onMessage(
      ServerRoomEvents.PLAYER_DIED,
      (player, message: { deadPlayerSessionId: string }) => {
        this.state.messages.push(
          `${this.getPlayerNickname(message.deadPlayerSessionId)}: died 💀`
        );
        this.broadcast(ServerRoomEvents.PLAYER_DIED, {
          ...this.players[message.deadPlayerSessionId],
        } as ServerPlayer);
      }
    );

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
      ServerRoomEvents.LASER_MOVED,
      (
        player,
        message: { laserId: string; position: string; x: number; y: number }
      ) => {
        this.broadcast(
          ServerRoomEvents.LASER_MOVED,
          {
            sessionId: player.sessionId,
            laserId: message.laserId,
            position: message.position,
            x: message.x,
            y: message.y,
          } as ServerLaser,
          { except: player }
        );
      }
    );

    this.onMessage(
      ServerRoomEvents.LASER_ENDED,
      (client, message: { laserId: string }) => {
        this.broadcast(
          ServerRoomEvents.LASER_ENDED,
          { laserId: message.laserId },
          { except: client }
        );
      }
    );

    this.onMessage("*", (client, type) => {
      console.warn("messageType not handled by the Room: " + type);
    });
  }

  onJoin(player: Client, options: { nickname: string }) {
    // console.debug("ON JOIN", options);

    // TODO better: spawn point
    this.players[player.sessionId] = {
      sessionId: player.sessionId,
      map: "town",
      x: 94.2881,
      y: 300.629,
      nickname: options.nickname,
      position: "front",
    };

    setTimeout(
      () =>
        player.send(ServerRoomEvents.CURRENT_PLAYERS, {
          players: this.players,
        }),
      500
    );

    this.broadcast(
      ServerRoomEvents.PLAYER_JOINED,
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

    this.broadcast(ServerRoomEvents.PLAYER_LEFT, {
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
