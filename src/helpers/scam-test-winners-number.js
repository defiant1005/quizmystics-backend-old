const scamTestWinnersNumber = (luck) => {
  const luckPercentage = luck * 0.07 * 100;

  const totalNumbers = 100;

  const winningNumbers = Math.ceil((luckPercentage / 100) * totalNumbers);

  const winners = [];

  while (winners.length < winningNumbers) {
    const randomNumber = Math.floor(Math.random() * totalNumbers) + 1;
    if (!winners.includes(randomNumber)) {
      winners.push(randomNumber);
    }
  }

  return winners;
};

exports.scamTestWinnersNumber = scamTestWinnersNumber;
