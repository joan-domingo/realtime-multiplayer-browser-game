import { Schema, type } from "@colyseus/schema";
import { Client, LobbyRoom } from "colyseus";
import { LobbyOptions } from "colyseus/lib/rooms/LobbyRoom";

class LobbyState extends Schema {
  @type("string") custom: string;
}

export class CustomLobbyRoom extends LobbyRoom {
  async onCreate(options: LobbyOptions) {
    await super.onCreate(options);

    this.setState(new LobbyState());
  }

  onJoin(client: Client, options: LobbyOptions) {
    super.onJoin(client, options);
    this.state.custom = client.sessionId;

    console.debug("client joins", client.id);
  }

  onLeave(client: Client) {
    super.onLeave(client);

    console.log("client leaves:", client.id);
  }
}
