const getRandomTest = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const choiceTest = (count, allUsersCount) => {
  const livePlayersCount = allUsersCount - count;

  switch (count) {
    case 1:
      if (livePlayersCount > 0) {
        return getRandomTest(["scam", "bowls", "dragon", "cube"]);
      } else {
        return getRandomTest(["scam", "dragon"]);
      }

    case 2:
      if (livePlayersCount > 0) {
        return getRandomTest([
          "money",
          "arena",
          "fight",
          "bowls",
          "math",
          "cube",
          "victim",
        ]);
      } else {
        return getRandomTest(["money", "arena", "fight", "math"]);
      }

    case 3:
      if (livePlayersCount > 0) {
        return getRandomTest([
          "scam",
          "money",
          "arena",
          "fight",
          "bowls",
          "math",
          "average",
          "cube",
          "scales",
          "victim",
        ]);
      } else {
        return getRandomTest([
          "scam",
          "money",
          "arena",
          "fight",
          "math",
          "average",
          "scales",
        ]);
      }

    case 4:
      if (livePlayersCount > 0) {
        return getRandomTest([
          "scam",
          "money",
          "arena",
          "fight",
          "bowls",
          "math",
          "average",
          "cube",
          "scales",
          "victim",
        ]);
      } else {
        return getRandomTest([
          "scam",
          "money",
          "arena",
          "fight",
          "math",
          "average",
          "scales",
        ]);
      }

    case 5:
      if (livePlayersCount > 0) {
        return getRandomTest([
          "scam",
          "money",
          "arena",
          "fight",
          "bowls",
          "math",
          "average",
          "cube",
          "scales",
          "victim",
        ]);
      } else {
        return getRandomTest([
          "scam",
          "money",
          "arena",
          "fight",
          "math",
          "average",
          "scales",
        ]);
      }

    case 6:
      if (livePlayersCount > 0) {
        return getRandomTest([
          "scam",
          "money",
          "arena",
          "fight",
          "bowls",
          "math",
          "average",
          "cube",
          "scales",
          "victim",
        ]);
      } else {
        return getRandomTest([
          "scam",
          "money",
          "arena",
          "fight",
          "math",
          "average",
          "scales",
        ]);
      }

    case 7:
      if (livePlayersCount > 0) {
        return getRandomTest([
          "scam",
          "money",
          "arena",
          "fight",
          "bowls",
          "math",
          "average",
          "cube",
          "scales",
          "victim",
        ]);
      } else {
        return getRandomTest([
          "scam",
          "money",
          "arena",
          "fight",
          "math",
          "average",
          "scales",
        ]);
      }

    case 8:
      return getRandomTest([
        "scam",
        "money",
        "arena",
        "fight",
        "math",
        "average",
        "scales",
      ]);
  }
};

exports.choiceTest = choiceTest;
