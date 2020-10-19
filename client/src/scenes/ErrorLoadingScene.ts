import { Scene } from "phaser";
import Text = Phaser.GameObjects.Text;

export class ErrorLoadingScene extends Scene {
  title: Text;
  description: Text;

  constructor() {
    super({
      key: "ErrorLoadingScene",
    });
  }

  create() {
    const titleText: string = "ERROR!!";
    this.title = this.add.text(150, 160, titleText, {
      font: "128px Arial Bold",
      fill: "#FBFBAC",
    });

    const descriptionText: string = "Probably connection to the server failed.";
    this.description = this.add.text(150, 280, descriptionText, {
      font: "32px Arial Bold",
    });
  }
}
