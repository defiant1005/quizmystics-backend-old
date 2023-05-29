const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

const PORT = 3000;

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", 'http://127.0.0.1:5173', 'http://192.168.0.101:5173'],
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });

    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    io.on("connection", (socket) => {
        socket.emit("hello", "world");
    });

    socket.on('userJoined', ((data, cb) => {
        if (!data.name || !data.room) {
            return cb('Данные некорректны')
        }

        cb({userId: socket.id})
    }))


});



server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});