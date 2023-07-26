const {addUser, getRoomUsers, findUser} = require("../users");
const {Question} = require("../models/models");
const {randomIntInclusive} = require("../helpers/get-random-int-inclusive");


module.exports = (io) => {
    const createRoom = function ({name, room}, cb) {
        const socket = this;

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
    };

    const connectingExistingRoom = function ({name, room}, cb) {
        const socket = this;

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
    };

    const messageHandler = function ({message, params}) {
        const user = findUser(params);

        if (user) {
            io.to(user.room).emit('message', {
                data: {
                    user,
                    message
                }
            })
        }
    };

    const startGame = async function ({room}, cb) {
        const questions = await Question.findAll()
        const question_id = await randomIntInclusive(0, questions.length)

        io.to(room).emit('startGame', {
            data: {
                room,
                question_id
            }
        });
    };

    const disconnect = function (orderId, callback) {};



    return {
        createRoom,
        connectingExistingRoom,
        messageHandler,
        startGame,
        disconnect,
    }
}