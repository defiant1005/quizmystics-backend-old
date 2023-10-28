require("dotenv").config();

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const sequelize = require("./db");
const models = require("./models/models");
const router = require("./routes/index");
const errorHandling = require("./middleware/ErrorHandlingMiddleware");

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:8080",
      "http://127.0.0.1:8080",
      "http://192.168.0.101:8080",
      "http://192.168.0.100:8080",
      "http://192.168.72.91:8080",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const {
  createRoom,
  connectingExistingRoom,
  startGame,
  whoChoosesCategory,
  setCategory,
  disconnecting,
  changeUserCount,
  changeUserData,
  magicUsage,
  updateOldCount,
  getCorrectAnswer,
  setUpdateUserList,
  getTestRoom,
  dragonTest,
  scamTest,
  averageTest,
} = require("./socket/gameHandler")(io);

const issue2options = {
  origin: true,
  methods: ["POST, DELETE", "PUT"],
  credentials: true,
  maxAge: 3600,
};

app.use(cors(issue2options));
app.use(express.json());
app.use("/api", router);

//Обработка ошибок последний middleware
app.use(errorHandling);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    server.listen(PORT, () => {
      console.log(`listening on *:${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
};

const onConnection = (socket) => {
  socket.on("createRoom", createRoom);
  socket.on("connectingExistingRoom", connectingExistingRoom);
  socket.on("startGame", startGame);
  socket.on("whoChoosesCategory", whoChoosesCategory);
  socket.on("setCategory", setCategory);
  socket.on("disconnecting", disconnecting);
  socket.on("changeUserCount", changeUserCount);
  socket.on("changeUserData", changeUserData);
  socket.on("magicUsage", magicUsage);
  socket.on("updateOldCount", updateOldCount);
  socket.on("getCorrectAnswer", getCorrectAnswer);
  socket.on("setUpdateUserList", setUpdateUserList);
  socket.on("getTestRoom", getTestRoom);
  socket.on("dragonTest", dragonTest);
  socket.on("scamTest", scamTest);
  socket.on("averageTest", averageTest);
};

io.on("connection", onConnection);

start();
