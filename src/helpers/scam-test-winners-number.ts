const scamTestWinnersNumber = (luck: number): number[] => {
  const luckPercentage: number = luck * 0.07 * 100;

  const totalNumbers: number = 100;

  const winningNumbers: number = Math.ceil((luckPercentage / 100) * totalNumbers);

  const winners: number[] = [];

  while (winners.length < winningNumbers) {
    const randomNumber: number = Math.floor(Math.random() * totalNumbers) + 1;
    if (!winners.includes(randomNumber)) {
      winners.push(randomNumber);
    }
  }

  return winners;
};

export { scamTestWinnersNumber };
