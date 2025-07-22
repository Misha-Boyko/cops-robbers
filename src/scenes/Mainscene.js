import Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
        this.state = {};
    }

    preload() {
        this.load.image("robber", "assets/robber.png");

        this.load.image("mainroom", "assets/cops_vs_robber_map.jpg");
    }
    

    create() {
        const scene = this;

        this.cursors = this.input.keyboard.createCursorKeys();

        this.add.image(0,0, "mainroom").setOrigin(0);

        this.socket = io();

        this.socket.on("connect", () => {
            console.log("Socket connected with id:", this.socket.id);
        });

        console.log("launching waiting room scene with socket:", this.socket);
        scene.scene.launch("WaitingRoom", { socket: scene.socket });

        // CREATE OTHER PLAYERS GROUP
        this.otherPlayers = this.physics.add.group();

        console.log("SETTING UP state socket listener...");
        this.socket.on("setState", function (state) {
            const { roomKey, players, numPlayers } = state;
            scene.physics.resume();

            scene.state.roomKey = roomKey;
            scene.state.players = players;
            scene.state.numPlayers = numPlayers;
        });

        console.log("SETTING UP currplayers socket listener...");
        this.socket.on("currentPlayers", function (arg) {
            const {players, numPlayers} = arg;
            scene.state.numPlayers = numPlayers;

            console.log("Current players:", players);
            Object.keys(players).forEach(function (id) {
                if (players[id].playerId === scene.socket.id) {
                    console.log("add the player");
                    scene.addPlayer(scene, players[id]);
                } else {
                    console.log("add other player");
                    scene.addOtherPlayers(scene, players[id]);
                }
            });
        });

        console.log("SETTING UP newPlayer socket listener...");
        this.socket.on("newPlayer", function (arg) {
            console.log("New player added");``
            const { playerInfo, numPlayers } = arg;
            scene.addOtherPlayers(scene, playerInfo);
            scene.state.numPlayers = numPlayers;
        });


    }
    update() {
        const scene = this;
        //MOVEMENT
        //console.log("Updating player movement");
        //console.log("In update:");
        //console.log("this:", this);
        //console.log("this instanceof Phaser.Scene:", this instanceof Phaser.Scene);
        //console.log("this.robber:", this.robber);
        if (this.robber) {
            console.log("Robber exists, updating movement");
            const speed = 225;
            const prevVelocity = this.robber.body.velocity.clone();
            // Stop any previous movement from the last frame
            this.robber.body.setVelocity(0);
            // Horizontal movement
            if (this.cursors.left.isDown) {
                this.robber.body.setVelocityX(-speed);
            } else if (this.cursors.right.isDown) {
                this.robber.body.setVelocityX(speed);
            }
            // Vertical movement
            if (this.cursors.up.isDown) {
                this.robber.body.setVelocityY(-speed);
            } else if (this.cursors.down.isDown) {
                this.robber.body.setVelocityY(speed);
            }
            // Normalize and scale the velocity so that robber can't move faster along a diagonal
            this.robber.body.velocity.normalize().scale(speed);
            // emit player movement
            var x = this.robber.x;
            var y = this.robber.y;
            if (
                this.robber.oldPosition &&
                (x !== this.robber.oldPosition.x ||
                y !== this.robber.oldPosition.y)
            ) {
                this.moving = true;
                this.socket.emit("playerMovement", {
                x: this.robber.x,
                y: this.robber.y,
                roomKey: scene.state.roomKey,
                });
            }
            // save old position data
            this.robber.oldPosition = {
                x: this.robber.x,
                y: this.robber.y,
                rotation: this.robber.rotation,
            };
        }
            
    }
    addPlayer(scene, playerInfo) {
        console.log("Adding player:", playerInfo);
        scene.joined = true;
        this.robber = scene.physics.add
            .sprite(playerInfo.x, playerInfo.y, "robber")
            .setOrigin(0.5, 0.5);
        console.log("Player added:", scene.robber);
    }
    addOtherPlayers(scene, playerInfo) {
        console.log("Adding other player:", playerInfo);
        const otherPlayer = scene.add.sprite(
            playerInfo.x + 40,
            playerInfo.y + 40,
            "robber"
        );
        otherPlayer.playerId = playerInfo.playerId;
        scene.otherPlayers.add(otherPlayer);
    }
}