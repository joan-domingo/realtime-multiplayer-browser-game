import { Scene } from "phaser";
import { Room } from "colyseus.js";
import { messagesElement, roomClient } from "../app";

export class ChatScene extends Scene {
  private room: Room;

  constructor() {
    super({
      key: "ChatScene",
    });
  }

  init(data: { nickname: string }) {
    this.room = roomClient.getRoomInstance();
  }

  create() {
    this.updateRoom();
  }

  private updateRoom() {
    this.room.onStateChange((state: { messages: string[] }) => {
      console.log("state changed", state);
      if (document.getElementById("messagesSpan")) {
        messagesElement.removeChild(document.getElementById("messagesSpan"));
      }

      const messagesSpan = document.createElement("span");
      messagesSpan.id = "messagesSpan";
      state.messages.forEach((msg) => messagesSpan.append(msg));

      messagesElement.appendChild(messagesSpan);
    });

    this.room.onMessage("*", (data: { messages: any }) => {
      console.log("new message", data.messages);
    });
  }

  private addMessageElement(el: string) {
    messagesElement.append(el);
    //messages.lastChild.scrollIntoView();
  }
}
