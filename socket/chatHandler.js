const { addUser, getRoomUsers, findUser } = require("../users");
const { Question } = require("../models/models");
const { randomIntInclusive } = require("../helpers/get-random-int-inclusive");

module.exports = (io) => {
  // let allQuestion = [];
  // let allPlayers = [];
  // let usersCount = 0;
  // let isGameStarted = false;
  // let gameRoom = null;
  // let questionNumber = 0;
  const rooms = {};

  const createRoom = function ({ name, room }, cb) {
    rooms[room] = {
      allQuestion: [],
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

    if (rooms[room].isGameStarted) {
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
      rooms[room].allQuestion.length - 1,
    );
    try {
      const questionId = rooms[room].allQuestion[question_index].id;
      rooms[room].allQuestion = rooms[room].allQuestion.filter(
        (item) => item.id !== questionId,
      );

      return questionId;
    } catch (e) {
      console.error("ошибка в nextQuestion", {
        question_index,
        allQuestionLength: rooms[room].allQuestion.length,
        question: rooms[room].allQuestion[question_index],
      });
    }
  };

  const startGame = async function ({ room, players }, cb) {
    rooms[room].usersCount = 0;
    rooms[room].questionNumber = 0;
    const questions = await Question.findAll();

    rooms[room].isGameStarted = true;
    rooms[room].allPlayers = players;
    rooms[room].allQuestion = questions;
    rooms[room].gameRoom = room;

    const questionId = await nextQuestion(room);

    io.to(room).emit("startGame", {
      room,
      questionId: questionId,
    });
  };

  const disconnect = function (orderId, callback) {};

  const changeUserCount = async function ({ id, answer, userId, room }, cb) {
    if (!room) {
      cb("Поле room обязательное");
      return;
    }

    let questions = [];

    if (rooms[room]?.questionNumber === 1) {
      questions = await Question.findAll();
    }
    rooms[room].usersCount += 1;

    const currentQuestion = questions.find((question) => question.id === id);

    rooms[room].allPlayers.forEach((player) => {
      if (player.userId === userId) {
        player.oldCount = player.count;

        if (answer === "" || answer === undefined || answer === null) {
          console.table({
            answer: answer,
          });
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

    console.table({
      usersCount: rooms[room].usersCount,
      allPlayers: rooms[room].allPlayers.length,
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
    } else {
      console.table({
        gameRoom: rooms[room].gameRoom,
      });

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
