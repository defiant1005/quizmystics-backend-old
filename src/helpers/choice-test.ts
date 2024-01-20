interface TestOption {
  [key: number]: string[];
}

const getRandomTest = (array: string[]): string => {
  return array[Math.floor(Math.random() * array.length)];
};

const choiceTest = (count: number, allUsersCount: number): string => {
  const livePlayersCount = allUsersCount - count;

  const testOptions: TestOption = {
    1: livePlayersCount > 0 ? ["scam", "bowls", "dragon", "cube"] : ["scam", "dragon"],
    2:
      livePlayersCount > 0
        ? ["money", "arena", "fight", "bowls", "math", "cube", "victim"]
        : ["money", "arena", "fight", "math"],
    3:
      livePlayersCount > 0
        ? ["money", "arena", "fight", "bowls", "math", "average", "cube", "scales", "victim"]
        : ["money", "arena", "fight", "math", "average", "scales"],
    4:
      livePlayersCount > 0
        ? ["money", "arena", "fight", "bowls", "math", "average", "cube", "scales", "victim"]
        : ["money", "arena", "fight", "math", "average", "scales"],
    5:
      livePlayersCount > 0
        ? ["money", "arena", "fight", "bowls", "math", "average", "cube", "scales", "victim"]
        : ["money", "arena", "fight", "math", "average", "scales"],
    6:
      livePlayersCount > 0
        ? ["money", "arena", "fight", "bowls", "math", "average", "cube", "scales", "victim"]
        : ["money", "arena", "fight", "math", "average", "scales"],
    7:
      livePlayersCount > 0
        ? ["money", "arena", "fight", "bowls", "math", "average", "cube", "scales", "victim"]
        : ["money", "arena", "fight", "math", "average", "scales"],
    8: ["money", "arena", "fight", "math", "average", "scales"],
  };

  return getRandomTest(testOptions[count]);
};

export { choiceTest };
