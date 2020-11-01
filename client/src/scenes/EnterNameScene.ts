import { Scene } from "phaser";
import { chat, endpoint, roomClient } from "../app";
import { Client, Room } from "colyseus.js";

export class EnterNameScene extends Scene {
  private onSubmitNickname = (nickname: string) => {
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
  };

  constructor() {
    super({
      key: "EnterNameScene",
    });
  }

  preload() {
    this.load.image("block", "assets/input/block.png");
    this.load.image("rub", "assets/input/rub.png");
    this.load.image("end", "assets/input/end.png");
    this.load.bitmapFont(
      "arcade",
      "assets/fonts/arcade.png",
      "assets/fonts/arcade.xml"
    );
  }

  create() {
    const chars = [
      ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
      ["K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"],
      ["U", "V", "W", "X", "Y", "Z", ".", "-", "<", ">"],
    ];
    const cursor = { x: 0, y: 0 };
    let name = "";

    const input = this.add
      .bitmapText(130, 50, "arcade", "ABCDEFGHIJ\n\nKLMNOPQRST\n\nUVWXYZ.-")
      .setLetterSpacing(20);

    input.setInteractive();

    const rub = this.add.image(input.x + 430, input.y + 148, "rub");
    const end = this.add.image(input.x + 482, input.y + 148, "end");

    const block = this.add
      .image(input.x - 10, input.y - 2, "block")
      .setOrigin(0);

    const playerText = this.add
      .bitmapText(300, 310, "arcade", name)
      .setTint(0xff0000);

    const playerTextUnderline = this.add.bitmapText(
      300,
      330,
      "arcade",
      "----------"
    );

    const submitNickname = this.onSubmitNickname;
    this.input.keyboard.on("keyup", function (event: KeyboardEvent) {
      if (event.keyCode === 37) {
        //  left
        if (cursor.x > 0) {
          cursor.x--;
          block.x -= 52;
        }
      } else if (event.keyCode === 39) {
        //  right
        if (cursor.x < 9) {
          cursor.x++;
          block.x += 52;
        }
      } else if (event.keyCode === 38) {
        //  up
        if (cursor.y > 0) {
          cursor.y--;
          block.y -= 64;
        }
      } else if (event.keyCode === 40) {
        //  down
        if (cursor.y < 2) {
          cursor.y++;
          block.y += 64;
        }
      } else if (event.keyCode === 13 || event.keyCode === 32) {
        //  Enter or Space
        if (cursor.x === 9 && cursor.y === 2 && name.length > 0) {
          //  Submit
          submitNickname(name);
        } else if (cursor.x === 8 && cursor.y === 2 && name.length > 0) {
          //  Rub
          name = name.substr(0, name.length - 1);

          playerText.text = name;
        } else if (name.length < 11) {
          //  Add
          name = name.concat(chars[cursor.y][cursor.x]);

          playerText.text = name;
        }
      }
    });

    input.on(
      "pointermove",
      function (pointer: any, x: number, y: number) {
        var cx = Phaser.Math.Snap.Floor(x, 52, 0, true);
        var cy = Phaser.Math.Snap.Floor(y, 64, 0, true);
        var char = chars[cy][cx];

        cursor.x = cx;
        cursor.y = cy;

        block.x = input.x - 10 + cx * 52;
        block.y = input.y - 2 + cy * 64;
      },
      this
    );

    input.on(
      "pointerup",
      function (pointer: any, x: number, y: number) {
        const cx = Phaser.Math.Snap.Floor(x, 52, 0, true);
        const cy = Phaser.Math.Snap.Floor(y, 64, 0, true);
        const char = chars[cy][cx];

        cursor.x = cx;
        cursor.y = cy;

        block.x = input.x - 10 + cx * 52;
        block.y = input.y - 2 + cy * 64;

        if (char === "<" && name.length > 0) {
          //  Rub
          name = name.substr(0, name.length - 1);

          playerText.text = name;
        } else if (char === ">" && name.length > 0) {
          //  Submit
          this.onSubmitNickname(name);
        } else if (name.length < 11) {
          //  Add
          name = name.concat(char);

          playerText.text = name;
        }
      },
      this
    );
  }
}
