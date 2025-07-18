/** @type {import("../typings/phaser")} */

// Bring in all the scenes
import "phaser";
import config from "./config/config";
//import WaitingRoom from "./scenes/WaitingRoom";
import MainScene from "./scenes/MainScene";
//import TaskScene from "./scenes/TaskScene";

class Game extends Phaser.Game {
  constructor() {
    // Add the config file to the game
    super(config);
    // Add all the scenes
    // << ADD ALL SCENES HERE >>
    this.scene.add("MainScene", MainScene);
    this.scene.add("WaitingRoom", WaitingRoom);
    //this.scene.add("TaskScene", TaskScene);
    // Start the game with the mainscene
    // << START GAME WITH MAIN SCENE HERE >>
    this.scene.start("MainScene");
  }
}
// Create new instance of game
window.onload = function () {
  window.game = new Game();
};