const { Question } = require("../models/models");
const { randomIntInclusive } = require("../helpers/get-random-int-inclusive");
const { choiceTest } = require("../helpers/choice-test");

module.exports = (io) => {
  const rooms = {};

  const getRoomUsers = (room) => {
    return rooms[room]?.allPlayers ?? [];
  };

  const updateOldCount = ({ room, usersId }) => {
    rooms[room]?.allPlayers?.forEach((user) => {
      if (usersId.includes(user.userId)) {
        user.oldCount = user.count;
      }
    });

    setUpdateUserList(room);
  };

  const createRoom = function ({ name, room, avatar, isReady }, cb) {
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

    const { user } = addUser(
      { name, room, avatar, isReady, userId: socket.id, count: 0, oldCount: 0 },
      true,
    );

    io.to(user.room).emit("updateUserList", {
      data: {
        users: getRoomUsers(user.room),
      },
    });
  };

  const connectingExistingRoom = function ({ name, room, avatar }, cb) {
    const socket = this;

    if (!name || !room) {
      return cb("Данные некорректны");
    }

    if (rooms[room]?.isGameStarted || !rooms[room]) {
      return cb("Комната больше не ищет игроков");
    }

    if (rooms[room].allPlayers.length >= 8) {
      return cb("В комнате может быть максимум 8 игроков");
    }

    cb({ userId: socket.id });

    socket.join(room);

    const { user } = addUser({
      name,
      room,
      avatar,
      userId: socket.id,
      count: 0,
      oldCount: 0,
    });

    io.to(user.room).emit("updateUserList", {
      data: {
        users: getRoomUsers(user.room),
      },
    });
  };

  const nextQuestion = async function (room) {
    //todo: Функция иногда возвращает undefined (уходит в catch)
    rooms[room].questionNumber += 1;
    rooms[room].allPlayers.forEach((user) => {
      user.curse = [];
    });

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

  const disconnecting = function (orderId, callback) {
    const socket = this;
    let room = null;
    const userId = socket.id;

    socket.rooms.forEach((value, valueAgain, set) => {
      room = value;
    });

    if (room.length === 4) {
      if (rooms[room].allPlayers.length === 0) {
        delete rooms[room];
      } else {
        rooms[room].allPlayers = rooms[room].allPlayers.filter(
          (user) => user.userId !== userId,
        );

        setUpdateUserList(room);
      }
    }
  };

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

  const getCorrectAnswer = async function ({ questionId, room }, cb) {
    const currentQuestion = rooms[room].allQuestions.find(
      (question) => question.id === questionId,
    );

    cb(currentQuestion.correct_answer);
  };

  const changeUserData = async function (
    { userId, name, room, avatar, winningQuote, isReady, stats },
    cb,
  ) {
    if (
      !userId ||
      !name ||
      !room ||
      !avatar ||
      !winningQuote ||
      !stats ||
      typeof isReady !== "boolean"
    ) {
      cb({
        error: false,
        message: "Не все поля валидны",
      });
      return;
    }

    const statSum =
      stats.health +
      stats.power +
      stats.magic +
      stats.intelligence +
      stats.dexterity;

    if (
      !stats.health ||
      !stats.power ||
      !stats.magic ||
      !stats.intelligence ||
      !stats.dexterity ||
      statSum !== 15 ||
      isNaN(statSum)
    ) {
      stats = {
        health: 3,
        power: 3,
        magic: 3,
        intelligence: 3,
        dexterity: 3,
      };
    }

    const currentUser = rooms[room].allPlayers.find((player) => {
      return player.userId === userId;
    });

    const index = rooms[room].allPlayers.findIndex(
      (user) => user.userId === currentUser.userId,
    );

    let spellList = [];

    switch (stats.magic) {
      case 1:
        spellList.push({
          name: "coldCharm",
          label: "Криострасть",
          quantity: 2,
        });
        break;

      case 2:
        spellList.push({
          name: "coldCharm",
          label: "Криострасть",
          quantity: 2,
        });

        spellList.push({
          name: "secretException",
          label: "Секретел",
          quantity: 2,
        });
        break;

      case 3:
        spellList.push({
          name: "coldCharm",
          label: "Криострасть",
          quantity: 2,
        });

        spellList.push({
          name: "secretException",
          label: "Секретел",
          quantity: 2,
        });

        spellList.push({
          name: "silenceWisdom",
          label: "Интерруптус",
          quantity: 2,
        });
        break;

      case 4:
        spellList.push({
          name: "coldCharm",
          label: "Криострасть",
          quantity: 2,
        });

        spellList.push({
          name: "secretException",
          label: "Секретел",
          quantity: 2,
        });

        spellList.push({
          name: "silenceWisdom",
          label: "Интерруптус",
          quantity: 2,
        });

        spellList.push({
          name: "secretRiddle",
          label: "Секретная загадка",
          quantity: 2,
        });
        break;

      case 5:
        spellList.push({
          name: "coldCharm",
          label: "Криострасть",
          quantity: 2,
        });

        spellList.push({
          name: "secretException",
          label: "Секретел",
          quantity: 2,
        });

        spellList.push({
          name: "silenceWisdom",
          label: "Интерруптус",
          quantity: 2,
        });

        spellList.push({
          name: "secretRiddle",
          label: "Секретная загадка",
          quantity: 2,
        });

        spellList.push({
          name: "antagonisticRiddle",
          label: "Антаговеяние",
          quantity: 2,
        });
        break;

      default:
        break;
    }

    currentUser.name = name;
    currentUser.room = room;
    currentUser.avatar = avatar;
    currentUser.isReady = isReady;
    currentUser.winningQuote = winningQuote;
    currentUser.stats = stats;
    currentUser.spellList = spellList;

    rooms[room].allPlayers[index] = currentUser;

    io.to(currentUser.room).emit("updateUserList", {
      data: {
        users: getRoomUsers(currentUser.room),
      },
    });

    cb({
      error: false,
    });
  };

  const magicUsage = function ({ userId, victim, spell, room }, cb) {
    const spellQuantity = rooms[room].allPlayers
      .find((user) => user.userId === userId)
      ?.spellList.find((userSpell) => {
        return userSpell.name === spell;
      })?.quantity;

    if (typeof spellQuantity !== "undefined" && spellQuantity > 0) {
      rooms[room].allPlayers
        .find((user) => user.userId === userId)
        .spellList.find((userSpell) => {
          return userSpell.name === spell;
        }).quantity--;

      const dexterity = rooms[room].allPlayers.find(
        (user) => user.userId === victim,
      ).stats.dexterity;

      rooms[room].allPlayers
        .find((user) => user.userId === victim)
        .curse.push({
          who: userId,
          evaded: spellEvaded(dexterity),
          spell: spell,
        });

      setUpdateUserList(room);
    } else {
      cb("Что-то пошло не так");
    }
  };

  const getTestRoom = function ({ count, allUsersCount, room }, cb) {
    io.to(room).emit("setTestRoom", {
      data: {
        test: choiceTest(count, allUsersCount),
      },
    });
  };

  //users

  const findUser = (player) => {
    return rooms[player.room].allPlayers.find(
      (user) => user.userId === player.userId,
    );
  };

  const addUser = (user, isRoomAdmin = false) => {
    const isExist = findUser(user);

    if (isRoomAdmin) {
      user.isRoomAdmin = true;
    }

    //todo: проверить этот функционал
    user.curse = [];

    if (!isExist) {
      rooms[user.room].allPlayers.push(user);
    }

    const currentUser = isExist || user;

    return {
      user: currentUser,
    };
  };

  const spellEvaded = (dexterity) => {
    const percent = dexterity * 0.07;
    return Math.random() < percent;
  };

  const setUpdateUserList = (room) => {
    io.to(room).emit("updateUserList", {
      data: {
        users: getRoomUsers(room),
      },
    });
  };

  //test

  const dragonTest = function ({ treasureCount, room, userId }, cb) {
    const win = Math.floor(Math.random() * 2) + 1;
    const currentPlayer = rooms[room].allPlayers.find(
      (user) => user.userId === userId,
    );

    if (win === treasureCount) {
      currentPlayer.oldCount = currentPlayer.count;
      currentPlayer.count += 1500;
    } else {
      currentPlayer.stats.health = 0;
      currentPlayer.count += 10;
    }

    const currentPlayerIndex = rooms[room].allPlayers.findIndex(
      (user) => user.userId === userId,
    );

    rooms[room].allPlayers[currentPlayerIndex] = currentPlayer;

    io.to(room).emit("checkDragonTest", {
      win: win === treasureCount,
      treasureCount,
    });

    setTimeout(() => {
      io.to(room).emit("finishDragonTest");
    }, 2000);
  };

  return {
    createRoom,
    connectingExistingRoom,
    startGame,
    disconnecting,
    changeUserCount,
    changeUserData,
    magicUsage,
    updateOldCount,
    getCorrectAnswer,
    setUpdateUserList,
    getTestRoom,
    dragonTest,
  };
};
