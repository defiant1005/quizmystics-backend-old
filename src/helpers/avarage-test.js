const minMaxNumbers = (arr) => {
  if (arr.length === 0) {
    return [];
  }

  let minNumber = arr[0].number;
  let maxNumber = arr[0].number;

  for (let i = 1; i < arr.length; i++) {
    if (arr[i].number < minNumber) {
      minNumber = arr[i].number;
    } else if (arr[i].number > maxNumber) {
      maxNumber = arr[i].number;
    }
  }

  return arr.filter(
    (obj) => obj.number === minNumber || obj.number === maxNumber,
  );
};

exports.minMaxNumbers = minMaxNumbers;
