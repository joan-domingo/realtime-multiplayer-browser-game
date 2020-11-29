import { RoomClient } from "./RoomClient";

export class Chat {
  private readonly inputMessage: HTMLInputElement;
  private messagesUL: HTMLUListElement;
  private roomClient: RoomClient;

  constructor(roomClient: RoomClient) {
    this.inputMessage = document.getElementById(
      "inputMessage"
    ) as HTMLInputElement;
    this.messagesUL = document.getElementById("messages") as HTMLUListElement;

    this.roomClient = roomClient;

    this.readKeyboardEvents();
  }

  readKeyboardEvents() {
    window.addEventListener("keydown", (event) => {
      if (event.which === 13) {
        if (this.inputMessage === document.activeElement) {
          this.sendMessage();
        } else {
          this.inputMessage.focus();
        }
      }
      if (event.which === 32) {
        if (this.isFocused()) {
          this.inputMessage.value = this.inputMessage.value + " ";
        }
      }
    });
  }

  sendMessage() {
    let message = this.inputMessage.value;
    if (message) {
      this.roomClient.getRoomInstance().send("message", message);
      this.inputMessage.value = "";
    }
    // focus back on the game
    this.inputMessage.blur();
  }

  readUpdates() {
    // make chat visible
    (document.getElementById("chatContainer") as HTMLDivElement).style.display =
      "block";

    this.roomClient
      .getRoomInstance()
      .onStateChange((state: { messages: string[] }) => {
        while (this.messagesUL.firstChild) {
          this.messagesUL.removeChild(this.messagesUL.firstChild);
        }

        state.messages.forEach((msg) => {
          const messageLI = document.createElement("li") as HTMLLIElement;
          messageLI.textContent = msg;
          this.messagesUL.append(messageLI);
        });

        (this.messagesUL.lastChild as HTMLLIElement).scrollIntoView();
      });
  }

  isFocused() {
    return document.activeElement === this.inputMessage;
  }
}
