const gameRooms = {
  // [roomKey]: {
  //   users: [],
  //   scores: [],
  //   players: {},
  //   }
};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(
      `A socket connection to the server has been made: ${socket.id}`
    );

    socket.on("joinRoom", (roomKey) => {
      //console.log("Joining room with key: ", roomKey);
      socket.join(roomKey);
      const roomInfo = gameRooms[roomKey];
      //console.log("roomInfo: ", roomInfo);
      roomInfo.players[socket.id] = {
        rotation: 0,
        x: 400,
        y: 300,
        playerId: socket.id,
      };

      roomInfo.numPlayers = Object.keys(roomInfo.players).length;
      socket.emit("setState", roomInfo);
      //console.log("Room state emitted with socket.id:", socket.id);
    
      socket.emit("currentPlayers", {
        players: roomInfo.players,
        numPlayers: roomInfo.numPlayers,
      });
      //console.log("Current players emitted with socket.id:", socket.id);

      socket.to(roomKey).emit("newPlayer", {
        playerInfo: roomInfo.players[socket.id],
        numPlayers: roomInfo.numPlayers,
      });
      //console.log("New player event emitted to other players with socket.id:", socket.id);

    });

    socket.on("isKeyValid", function (input) {
      console.log("Checking if key is valid: ", input);
      Object.keys(gameRooms).includes(input)
        ? socket.emit("keyIsValid", input)
        : socket.emit("keyNotValid");
    });

    // get a random code for the room
    socket.on("getRoomCode", async function () {
      let key = codeGenerator();
      while (Object.keys(gameRooms).includes(key)) {
        key = codeGenerator();
      }
      gameRooms[key] = {
        roomKey: key,
        players: {},
        numPlayers: 0,
      };
      socket.emit("roomCreated", key);
    });
  });
}

function codeGenerator() {
  let code = "";
  let chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
