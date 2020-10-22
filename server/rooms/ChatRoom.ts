import { Client, Room } from "colyseus";

export class Chat extends Room {
  // this room supports only 4 clients connected
  // maxClients = 4;

  constructor(options: any) {
    super();
    this.setState({
      messages: [`Welcome to ChatRoom instance.`],
    });
  }

  onCreate(options: any) {
    console.log("ChatRoom created!", options);

    this.onMessage("message", (client, message) => {
      console.log(
        "ChatRoom received message from",
        client.sessionId,
        ":",
        message
      );
      this.broadcast("messages", `(${client.sessionId}) ${message}`);
      this.state.messages.push(`${client.sessionId}: ${message}`);
    });
  }

  onJoin(client: Client) {
    this.broadcast("messages", `${client.sessionId} joined.`);
    this.state.messages.push(`${client.sessionId} joined. Say hello!`);
  }

  onLeave(client: Client) {
    this.broadcast("messages", `${client.sessionId} left.`);
    this.state.messages.push(`${client.sessionId} left.`);
  }

  onDispose() {
    console.log("Dispose ChatRoom");
  }
}
