const {addUser, getRoomUsers, findUser} = require("../users");
const {Question} = require("../models/models");
const {randomIntInclusive} = require("../helpers/get-random-int-inclusive");
let allQuestion = []
let allPlayers = []
let isGameStarted = false

module.exports = (io) => {
    const createRoom = function ({name, room}, cb) {
        isGameStarted = false
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

        if (isGameStarted) {
            return cb('Комната больше не ищет игроков')
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

    const startGame = async function ({room, players}, cb) {
        isGameStarted = true
        allPlayers = players
        const questions = await Question.findAll()
        allQuestion = questions

        const question_index = await randomIntInclusive(0, questions.length)
        const question = allQuestion[question_index]
        allQuestion = allQuestion.filter(item => item.id !== question.id)

        io.to(room).emit('startGame', {
            room,
            questionId: question.id
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