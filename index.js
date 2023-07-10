require('dotenv').config()

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require('cors')
const { addUser, findUser, getRoomUsers } = require("./users");
const PORT = process.env.PORT || 3000;
const sequelize = require('./db')
const models = require('./models/models')
const router = require('./routes/index')
const errorHandling = require('./middleware/ErrorHandlingMiddleware')

app.use(cors({origin: '*'}))
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



const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", 'http://127.0.0.1:5173', 'http://192.168.0.101:5173'],
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    socket.on('createRoom', (({name, room}, cb) => {
        if (!name || !room) {
            return cb('Данные некорректны')
        }

        cb({userId: socket.id})

        socket.join(room)

        const { user, isExist } = addUser({name, room, userId: socket.id}, true)

        io.to(user.room).emit('updateUserList', {
            data: {
                users: getRoomUsers(user.room)
            }
        })
    }))

    socket.on('connectingExistingRoom', (({name, room}, cb) => {
        if (!name || !room) {
            return cb('Данные некорректны')
        }

        cb({userId: socket.id})

        socket.join(room)

        const { user, isExist } = addUser({name, room, userId: socket.id})

        const userMessage = isExist ? `Первый вход ${user.name}` : `Это уже не первый вход ${user.name}`

        socket.emit('message', {
            data: {
                user: {
                    name: 'admin',
                },
                message: userMessage
            }
        })

        socket.broadcast.to(user.room).emit('message', {
            data: {
                user: {
                    name: 'admin',
                },
                message: `${user.name} подключился`
            }
        })

        io.to(user.room).emit('updateUserList', {
            data: {
                users: getRoomUsers(user.room)
            }
        })
    }))

    socket.on('message', ({message, params}) => {
        const user = findUser(params);

        if (user) {
            io.to(user.room).emit('message', {
                data: {
                    user,
                    message
                }
            })
        }
    })

    socket.on('startGame', ({room}, cb) => {
        io.to(room).emit('startGame', {
            data: { room }
        });

    })

    socket.on('disconnect', (() => {}))
});


start()