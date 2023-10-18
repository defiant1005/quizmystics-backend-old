const { Question, Category } = require("../models/models");
const { randomIntInclusive } = require("../helpers/get-random-int-inclusive");
const { choiceTest } = require("../helpers/choice-test");
const { Sequelize } = require("sequelize");
const sequelize = require("sequelize");
const {
  scamTestWinnersNumber,
} = require("../helpers/scam-test-winners-number");

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
      // allQuestions: [],
      chosenQuestionIds: [],
      allPlayers: [],
      usersCount: 0,
      isGameStarted: false,
      gameRoom: null,
      questionNumber: 1,
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

  const nextQuestion = async function (room, categoryId) {
    rooms[room].questionNumber += 1;
    rooms[room].allPlayers.forEach((user) => {
      user.curse = [];
    });

    try {
      const question = await Question.findOne({
        attributes: [
          "id",
          "answer1",
          "answer2",
          "answer3",
          "answer4",
          "categoryId",
          "title",
        ],
        where: {
          categoryId: categoryId,
          id: {
            [sequelize.Op.notIn]: rooms[room].chosenQuestionIds,
          },
        },
        order: sequelize.literal("RANDOM()"),
      });

      rooms[room].chosenQuestionIds.push(question.id);

      return question;
    } catch (e) {
      console.error("ошибка в nextQuestion", e);
      return null;
    }
  };

  const startGame = async function ({ room, players }, cb) {
    // const questions = await Question.findAll();

    rooms[room].usersCount = 0;
    rooms[room].questionNumber = 1;
    rooms[room].isGameStarted = true;
    rooms[room].allPlayers = players;
    // rooms[room].currentQuestions = questions;
    // rooms[room].allQuestions = questions;
    rooms[room].gameRoom = room;

    // const questionId = await nextQuestion(room);

    io.to(room).emit("startGame", {
      room,
      // questionId: questionId,
    });
  };

  const whoChoosesCategory = async ({ room }, cb) => {
    const categories = await Category.findAll({
      attributes: ["id", "title"],
      order: Sequelize.literal("RANDOM()"),
      limit: 4,
    });

    io.to(room).emit("whoChoosesCategory", {
      userId: selectUser(rooms[room].allPlayers, rooms[room].questionNumber)
        .userId,
      categories: categories,
    });
  };

  const setCategory = async ({ room, categoryId }) => {
    const question = await nextQuestion(room, categoryId);

    io.to(room).emit("setCategory", categoryId);

    setTimeout(() => {
      io.to(room).emit("currentQuestion", question);
    }, 1200);
  };

  const selectUser = (users, step) => {
    if (users.length === 0) {
      return null;
    }
    const index = (step - 1) % users.length;
    return users[index];
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

    const currentQuestion = await Question.findOne({
      attributes: ["correct_answer"],
      where: {
        id: id,
      },
    });

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
      // const questionId = await nextQuestion(room);

      io.to(rooms[room].gameRoom).emit("finishQuestion", {
        data: {
          users: rooms[room].allPlayers,
          // nextQuestion: questionId,
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
    const currentQuestion = await Question.findOne({
      attributes: ["correct_answer"],
      where: {
        id: questionId,
      },
    });

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
      stats.luck;

    if (
      !stats.health ||
      !stats.power ||
      !stats.magic ||
      !stats.intelligence ||
      !stats.luck ||
      statSum !== 15 ||
      isNaN(statSum)
    ) {
      stats = {
        health: 3,
        power: 3,
        magic: 3,
        intelligence: 3,
        luck: 3,
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

      const luck = rooms[room].allPlayers.find((user) => user.userId === victim)
        .stats.luck;

      rooms[room].allPlayers
        .find((user) => user.userId === victim)
        .curse.push({
          who: userId,
          evaded: spellEvaded(luck),
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

  const spellEvaded = (luck) => {
    const percent = luck * 0.07;
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

  const checkedDeath = (players) => {
    return players.stats.health > 0;
  };

  const dragonTest = function ({ treasureCount, room, userId }, cb) {
    const win = Math.floor(Math.random() * 2) + 1;
    const currentPlayer = rooms[room].allPlayers.find(
      (user) => user.userId === userId,
    );

    if (checkedDeath(currentPlayer)) {
      currentPlayer.oldCount = currentPlayer.count;

      if (win === treasureCount) {
        currentPlayer.count += 500;
      } else {
        currentPlayer.stats = {
          health: 0,
          power: 0,
          magic: 0,
          intelligence: 0,
          luck: 0,
        };
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

        setUpdateUserList(room);
      }, 2000);
    }
  };

  const scamTest = function ({ userId, room, number }) {
    const currentPlayer = rooms[room].allPlayers.find(
      (user) => user.userId === userId,
    );

    if (checkedDeath(currentPlayer)) {
      const winnersNumber = scamTestWinnersNumber(currentPlayer.stats.luck);

      currentPlayer.oldCount = currentPlayer.count;

      if (winnersNumber.includes(number)) {
        currentPlayer.count += 10;
      } else {
        currentPlayer.count += 5;
        currentPlayer.stats.health = currentPlayer.stats.health - 1;

        if (currentPlayer.stats.health < 1) {
          currentPlayer.stats = {
            health: 0,
            power: 0,
            magic: 0,
            intelligence: 0,
            luck: 0,
          };
        }
      }

      const currentPlayerIndex = rooms[room].allPlayers.findIndex(
        (user) => user.userId === userId,
      );

      rooms[room].allPlayers[currentPlayerIndex] = currentPlayer;

      io.to(room).emit("checkScamTest", {
        win: winnersNumber.includes(number),
        selectedNumber: number,
        winningNumbers: winnersNumber,
      });

      setTimeout(() => {
        io.to(room).emit("finishScamTest");

        setUpdateUserList(room);
      }, 3000);
    }
  };

  return {
    createRoom,
    connectingExistingRoom,
    startGame,
    whoChoosesCategory,
    setCategory,
    disconnecting,
    changeUserCount,
    changeUserData,
    magicUsage,
    updateOldCount,
    getCorrectAnswer,
    setUpdateUserList,
    getTestRoom,
    dragonTest,
    scamTest,
  };
};
