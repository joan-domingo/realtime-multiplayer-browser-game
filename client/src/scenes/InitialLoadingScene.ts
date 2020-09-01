import { Scene } from "phaser";
import Text = Phaser.GameObjects.Text;

export class InitialLoadingScene extends Scene {
  title: Text;

  constructor() {
    super({
      key: "InitialLoadingScene",
    });
  }

  create() {
    const titleText: string = "Loading...";
    this.title = this.add.text(150, 200, titleText, {
      font: "128px Arial Bold",
      fill: "#FBFBAC",
    });
  }
}
