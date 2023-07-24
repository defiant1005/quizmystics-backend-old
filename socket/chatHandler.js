const {addUser, getRoomUsers, findUser} = require("../users");

module.exports = (io, socket) => {
    const createRoom = ({name, room}, cb) => {
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
    }

    const connectingExistingRoom = (({name, room}, cb) => {
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
    })

    const messageHandler = ({message, params}) => {
        const user = findUser(params);

        if (user) {
            io.to(user.room).emit('message', {
                data: {
                    user,
                    message
                }
            })
        }
    }

    const startGame = ({room}, cb) => {
        io.to(room).emit('startGame', {
            data: { room }
        });
    }

    const disconnect = (orderId, callback) => {
        // ...
    }


    socket.on("createRoom", createRoom);
    socket.on("connectingExistingRoom", connectingExistingRoom);
    socket.on("message", messageHandler);
    socket.on("startGame", startGame);
    socket.on("disconnect", disconnect);
}