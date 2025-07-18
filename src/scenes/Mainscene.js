import Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
    }

    preload() {
        this.load.spritesheet("robber", "assets/robber.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
    }

    create() {
        const scene = this;
        this.add.image(0,0, "mainroom").setOrigin(0);

        this.socket = io();
    }
    update() {}
}