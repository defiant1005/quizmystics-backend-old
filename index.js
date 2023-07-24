require('dotenv').config()

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require('cors')
const PORT = process.env.PORT || 3000;
const sequelize = require('./db')
const models = require('./models/models')
const router = require('./routes/index')
const errorHandling = require('./middleware/ErrorHandlingMiddleware')

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", 'http://127.0.0.1:5173', 'http://192.168.0.101:5173'],
        methods: ["GET", "POST"],
        credentials: true
    }
});

const createRoom = require("./socket/chatHandler");
const connectingExistingRoom = require("./socket/chatHandler");
const messageHandler = require("./socket/chatHandler");
const startGame = require("./socket/chatHandler");
const disconnect = require("./socket/chatHandler");


const issue2options = {
    origin: true,
    methods: ["POST, DELETE", "PUT"],
    credentials: true,
    maxAge: 3600
};

app.use(cors(issue2options))
app.use(express.json())
app.use('/api', router)

//Обработка ошибок последний middleware
app.use(errorHandling)

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        server.listen(PORT, () => {
            console.log(`listening on *:${PORT}`);
        });
    } catch (e) {
        console.log(e)
    }
}


const onConnection = (socket) => {
    createRoom(io, socket);
    connectingExistingRoom(io, socket);
    messageHandler(io, socket);
    startGame(io, socket);
    disconnect(io, socket);
}

io.on("connection", onConnection);

start()