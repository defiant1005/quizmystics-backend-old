const {addUser, getRoomUsers, findUser} = require("../users");
const {Question} = require("../models/models");
const {randomIntInclusive} = require("../helpers/get-random-int-inclusive");

let allQuestion = []

let allPlayers = []
let isGameStarted = false
let gameRoom = null

module.exports = (io) => {
    const createRoom = function ({name, room}, cb) {
        isGameStarted = false
        const socket = this;

        if (!name || !room) {
            return cb('Данные некорректны')
        }

        cb({userId: socket.id})

        socket.join(room)

        const { user, isExist } = addUser({name, room, userId: socket.id, count: 0, oldCount: 0}, true)

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

        const { user, isExist } = addUser({name, room, userId: socket.id, count: 0, oldCount: 0})

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
        const questions = await Question.findAll()

        isGameStarted = true
        allPlayers = players
        allQuestion = questions
        gameRoom = room

        const question_index = await randomIntInclusive(0, questions.length)
        const question = allQuestion[question_index]
        allQuestion = allQuestion.filter(item => item.id !== question.id)

        io.to(room).emit('startGame', {
            room,
            questionId: question.id
        });
    };

    const disconnect = function (orderId, callback) {};

    const changeUserCount = async function ({id, answer, userId}, cb) {
        const questions = await Question.findAll()

        const currentQuestion = questions.find(question => question.id === id)

        const player = allPlayers.find(user => user.userId === userId)
        player.oldCount = player.count

        if (currentQuestion.correct_answer === answer) {
            player.count += 100
        } else {
            player.count += -100
        }

        io.to(gameRoom).emit('updateUserList', {
            data: {
                users: allPlayers
            }
        });

        cb()

    };




    return {
        createRoom,
        connectingExistingRoom,
        messageHandler,
        startGame,
        disconnect,
        changeUserCount,
    }
}