import dotenv from "dotenv";
dotenv.config();
import express, { Application } from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import router from "./src/routes";
import errorHandling from "./src/middleware/ErrorHandlingMiddleware.js";
import { sequelize } from "./src/db.js";

const app: Application = express();
const server: http.Server = http.createServer(app);
const io: SocketIOServer = new SocketIOServer(server, {
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

import {
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
} from "./src/socket/gameHandler";

const PORT = process.env.PORT || 3000;

const issue2options: cors.CorsOptions = {
  origin: true,
  methods: ["POST", "DELETE", "PUT"],
  credentials: true,
  maxAge: 3600,
};

app.use(cors(issue2options));
app.use(express.json());
app.use("/api", router);

// Обработка ошибок последний middleware
app.use(errorHandling);

const start = async (): Promise<void> => {
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

const onConnection = (socket: SocketIO.Socket): void => {
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

start().then(() => {
  console.log(`Сервер работает на порту ${PORT}`);
});
