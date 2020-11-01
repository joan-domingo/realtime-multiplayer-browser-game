import { Scene } from "phaser";
import { chat, endpoint, roomClient } from "../app";
import { Client, Room } from "colyseus.js";

export class EnterNickNameScene extends Scene {
  private nameFormKey: string;

  constructor() {
    super({
      key: "EnterNickNameScene",
    });
  }

  init() {
    this.nameFormKey = "nameForm";
  }

  preload() {
    this.load.html(this.nameFormKey, "assets/nameForm.html");
  }

  create() {
    this.add.text(300, 10, "Please enter your name", {
      color: "white",
      fontSize: "20px ",
    });

    const element = this.add.dom(0, 300).createFromCache(this.nameFormKey);
    const submitNickname = this.onSubmitNickname;
    const inputText = document.getElementById("nameField") as HTMLInputElement;

    element.addListener("click");
    element.on("click", function (event: any) {
      if (event.target.name === "playButton") {
        element.removeListener("click");
        submitNickname(inputText.value);
      }
    });

    this.tweens.add({
      targets: element,
      x: 460,
      duration: 2000,
      ease: "Power3",
      onStart: () => {
        const savedNickname = window.localStorage.getItem("nickname");
        if (savedNickname) {
          inputText.value = savedNickname;
        }
        inputText.focus();
      },
    });

    this.input.keyboard.on("keyup", function (event: KeyboardEvent) {
      if (event.keyCode === 13) {
        submitNickname(inputText.value);
      }
    });
  }

  onSubmitNickname = (nickname: string) => {
    if (nickname && nickname.length > 0) {
      window.localStorage.setItem("nickname", nickname);

      new Client(endpoint)
        .joinOrCreate("Room1", { nickname })
        .then((room: Room) => {
          roomClient.setRoomInstance(room);
          chat.readUpdates();
          this.scene.start("MapScene", { nickname });
        })
        .catch((e: Error) => {
          console.debug("JOIN ERROR", e);
          this.scene.start("ErrorLoadingScene");
        });
    }
  };
}
