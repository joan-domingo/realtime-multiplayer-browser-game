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

    const element = this.add.dom(400, 300).createFromCache(this.nameFormKey);
    const submitNickname = this.onSubmitNickname;
    const inputText = document.getElementById("nameField") as HTMLInputElement;

    element.addListener("click");
    element.on("click", function (event: any) {
      if (event.target.name === "playButton") {
        element.removeListener("click");
        submitNickname(inputText.value);
      }
    });

    const savedNickname = window.localStorage.getItem("nickname");
    if (savedNickname) {
      inputText.value = savedNickname;
    }
    inputText.focus();

    this.input.keyboard.on("keyup", function (event: KeyboardEvent) {
      if (event.keyCode === 13) {
        submitNickname(inputText.value);
      }
    });

    if (process.env.NODE_ENV === "development") {
      submitNickname(inputText.value);
    }
  }

  onSubmitNickname = (nickname: string) => {
    if (nickname && nickname.length > 0) {
      window.localStorage.setItem("nickname", nickname);

      document.getElementById("inputForm").style.display = "none";
      document.getElementById("loadingView").style.display = "block";

      const mapInput = document.querySelector(
        'input[name="map"]:checked'
      ) as HTMLInputElement;

      new Client(endpoint)
        .joinOrCreate(mapInput.value, { nickname })
        .then((room: Room) => {
          roomClient.setRoomInstance(room);
          chat.readUpdates();
          this.scene.start("MapScene", { nickname, map: mapInput.value });
        })
        .catch((e: Error) => {
          console.debug("JOIN ERROR", e);
          this.scene.start("ErrorLoadingScene");
        });
    }
  };
}
