import { Scene } from "phaser";
import Text = Phaser.GameObjects.Text;

export class ErrorLoadingScene extends Scene {
  title: Text;

  constructor() {
    super({
      key: "ErrorLoadingScene",
    });
  }

  create() {
    const titleText: string = "ERROR!!!!!";
    this.title = this.add.text(150, 200, titleText, {
      font: "128px Arial Bold",
      fill: "#FBFBAC",
    });
  }
}
