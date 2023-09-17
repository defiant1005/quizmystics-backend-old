const { addUser, getRoomUsers, findUser } = require("../users");
const { Question } = require("../models/models");
const { randomIntInclusive } = require("../helpers/get-random-int-inclusive");

module.exports = (io) => {
  const rooms = {};

  const createRoom = function ({ name, room }, cb) {
    rooms[room] = {
      currentQuestions: [],
      allQuestions: [],
      allPlayers: [],
      usersCount: 0,
      isGameStarted: false,
      gameRoom: null,
      questionNumber: 0,
    };

    rooms[room].isGameStarted = false;

    const socket = this;

    if (!name || !room) {
      return cb("Данные некорректны");
    }

    cb({ userId: socket.id });

    socket.join(room);

    const { user, isExist } = addUser(
      { name, room, userId: socket.id, count: 0, oldCount: 0 },
      true,
    );

    io.to(user.room).emit("updateUserList", {
      data: {
        users: getRoomUsers(user.room),
      },
    });
  };

  const connectingExistingRoom = function ({ name, room }, cb) {
    const socket = this;

    if (!name || !room) {
      return cb("Данные некорректны");
    }

    if (rooms[room]?.isGameStarted || !rooms[room]) {
      return cb("Комната больше не ищет игроков");
    }

    cb({ userId: socket.id });

    socket.join(room);

    const { user, isExist } = addUser({
      name,
      room,
      userId: socket.id,
      count: 0,
      oldCount: 0,
    });

    const userMessage = isExist
      ? `Первый вход ${user.name}`
      : `Это уже не первый вход ${user.name}`;

    socket.emit("message", {
      data: {
        user: {
          name: "admin",
        },
        message: userMessage,
      },
    });

    socket.broadcast.to(user.room).emit("message", {
      data: {
        user: {
          name: "admin",
        },
        message: `${user.name} подключился`,
      },
    });

    io.to(user.room).emit("updateUserList", {
      data: {
        users: getRoomUsers(user.room),
      },
    });
  };

  const messageHandler = function ({ message, params }) {
    const user = findUser(params);

    if (user) {
      io.to(user.room).emit("message", {
        data: {
          user,
          message,
        },
      });
    }
  };

  const nextQuestion = async function (room) {
    //todo: Функция иногда возвращает undefined (уходит в catch)
    rooms[room].questionNumber += 1;
    const question_index = await randomIntInclusive(
      0,
      rooms[room].currentQuestions.length - 1,
    );
    try {
      const questionId = rooms[room].currentQuestions[question_index].id;
      rooms[room].currentQuestions = rooms[room].currentQuestions.filter(
        (item) => item.id !== questionId,
      );

      return questionId;
    } catch (e) {
      console.error("ошибка в nextQuestion", {
        question_index,
        currentQuestionsLength: rooms[room].currentQuestions.length,
        question: rooms[room].currentQuestions[question_index],
      });
    }
  };

  const startGame = async function ({ room, players }, cb) {
    const questions = await Question.findAll();

    rooms[room].usersCount = 0;
    rooms[room].questionNumber = 0;
    rooms[room].isGameStarted = true;
    rooms[room].allPlayers = players;
    rooms[room].currentQuestions = questions;
    rooms[room].allQuestions = questions;
    rooms[room].gameRoom = room;

    const questionId = await nextQuestion(room);

    io.to(room).emit("startGame", {
      room,
      questionId: questionId,
    });
  };

  const disconnect = function (orderId, callback) {};

  const changeUserCount = async function ({ id, answer, userId, room }, cb) {
    if (!room || !rooms[room]) {
      cb(`Комнаты ${room} не существует`);
      return;
    }

    rooms[room].usersCount += 1;

    const currentQuestion = rooms[room].allQuestions.find(
      (question) => question.id === id,
    );

    rooms[room].allPlayers.forEach((player) => {
      if (player.userId === userId) {
        player.oldCount = player.count;

        if (answer === "" || answer === undefined || answer === null) {
          player.count += -100;
        } else {
          try {
            if (currentQuestion.correct_answer === answer) {
              player.count += 100;
            } else {
              player.count += -100;
            }
          } catch {
            player.count += -100;
          }
        }
      }
    });

    if (
      rooms[room].usersCount === rooms[room].allPlayers.length &&
      rooms[room].questionNumber < 10
    ) {
      rooms[room].usersCount = 0;
      const questionId = await nextQuestion(room);

      io.to(rooms[room].gameRoom).emit("finishQuestion", {
        data: {
          users: rooms[room].allPlayers,
          nextQuestion: questionId,
        },
      });
    } else if (rooms[room].questionNumber === 10) {
      io.to(rooms[room].gameRoom).emit("finishGame", {
        data: {
          users: rooms[room].allPlayers,
        },
      });

      delete rooms[room];
    }
  };

  return {
    createRoom,
    connectingExistingRoom,
    messageHandler,
    startGame,
    disconnect,
    changeUserCount,
  };
};
