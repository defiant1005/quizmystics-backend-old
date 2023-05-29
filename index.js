const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

const m = (name, text, id) => ({name, text, id})

const PORT = 3000;

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", 'http://127.0.0.1:5173', 'http://192.168.0.101:5173'],
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    socket.on('userJoined', ((data, cb) => {
        if (!data.name || !data.room) {
            return cb('Данные некорректны')
        }
        cb({userId: socket.id})

        socket.emit('newMessage', m('admin', `Добро пожаловать ${data.name}`))
    }))
});



server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});