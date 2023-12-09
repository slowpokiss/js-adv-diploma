export function calcTileType(index, boardSize) {
  if (index === 0) {
    return "top-left";
  } else if (index === boardSize - 1) {
    return "top-right";
  } else if (boardSize * boardSize - index === boardSize) {
    return "bottom-left";
  } else if (index === boardSize * boardSize - 1) {
    return "bottom-right";
  } else if (boardSize * boardSize - index < boardSize) {
    return "bottom";
  } else if (index % boardSize === 0) {
    return "left";
  } else if (index % boardSize === boardSize - 1) {
    return "right";
  } else if (index < boardSize) {
    return "top";
  }
  return "center";
}

export function getPossibleArea(characterType, index) {
  let masAreas = [];
  let characterAreaIndex;
  const boardSize = 8;
  if (characterType === "Magician" || characterType === "Daemon") {
    characterAreaIndex = 1;
  }
  if (characterType === "Bowman" || characterType === "Vampire") {
    characterAreaIndex = 2;
  }
  if (characterType === "Swordsman" || characterType === "Undead") {
    characterAreaIndex = 4;
  }

  const startCell = index - characterAreaIndex * boardSize - characterAreaIndex;
  for (let j = startCell; j < startCell + 2 * characterAreaIndex + 1; j++) {
    for (
      let i = j;
      i < j + (2 * characterAreaIndex + 1) * boardSize;
      i += boardSize
    ) {
      masAreas.push(i);
    }
  }

  masAreas = masAreas.filter((elem) => {
    return (
      getVector(elem, index) !== undefined &&
      elem >= 0 &&
      elem <= 63 &&
      elem !== index &&
      getRadius(elem, index) < characterAreaIndex + 1
    );
  });

  masAreas = masAreas.filter(
    (value, index, self) => self.indexOf(value) === index,
  );
  return masAreas;
}

function getVector(cell, index) {
  let result;
  const boardSize = 8;
  let diff = Math.abs(cell - index);
  const mod = cell % boardSize;
  const diagDiffKoef = Math.abs(
    Math.floor(cell / boardSize) - Math.floor(index / boardSize),
  );

  // vertical
  if (mod - (index % boardSize) === 0) {
    result = diff / boardSize;
  }

  // horisontal
  if (Math.floor(cell / boardSize) === Math.floor(index / boardSize)) {
    result = diff;
  }

  //left diagonal
  if (diff === (boardSize - 1) * diagDiffKoef) {
    result = diff / (boardSize - 1);
  }

  //right diagonal
  if (diff === (boardSize + 1) * diagDiffKoef) {
    result = diff / (boardSize + 1);
  }

  return result;
}

export function getPossibleAttacks(character, index) {
  let characterAttackIndex = 1;
  const boardSize = 8;
  let masAttacks = [];

  if (character === "Bowman" || character === "Vampire") {
    characterAttackIndex = 2;
  }
  if (character === "Magician" || character === "Daemon") {
    characterAttackIndex = 4;
  }

  const startCell =
    index - characterAttackIndex * boardSize - characterAttackIndex;
  for (let j = startCell; j < startCell + 2 * characterAttackIndex + 1; j++) {
    for (
      let i = j;
      i < j + (2 * characterAttackIndex + 1) * boardSize;
      i += boardSize
    ) {
      masAttacks.push(i);
    }
  }

  masAttacks = masAttacks.filter((elem) => {
    return (
      elem >= 0 &&
      elem <= 63 &&
      elem !== index &&
      getRadius(elem, index) < characterAttackIndex + 1
    );
  });

  return masAttacks;
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return "critical";
  }

  if (health < 50) {
    return "normal";
  }

  return "high";
}

function getRadius(cell, index) {
  let result;
  const boardSize = 8;
  let diff = Math.abs(cell - index);

  const diagDiffKoef = Math.abs(
    Math.floor(cell / boardSize) - Math.floor(index / boardSize),
  );
  //between diagonals top
  if (
    diff <= (boardSize + 1) * diagDiffKoef &&
    diff >= (boardSize - 1) * diagDiffKoef
  ) {
    result = Math.floor(diff / (boardSize + 1) + 1);
  }

  //between diagonals side
  if (
    diff >= (boardSize + 1) * diagDiffKoef ||
    diff <= (boardSize - 1) * diagDiffKoef
  ) {
    result = Math.abs((index % boardSize) - (cell % boardSize));
  }

  return result;
}

export function getAttackPower(attacker, target) {
  return Math.max(
    attacker.attack - target.defence,
    attacker.attack * 0.1,
  ).toFixed(2);
}

export function closestCellTo(arr, targetPosition) {
  // самый близкий остаток от деление
  const targetOst = targetPosition % 8;
  const minDif =
    arr.reduce((acc, curr) => {
      const currDif = Math.abs(targetOst - (curr % 8));
      return currDif < Math.abs(targetOst - (acc % 8)) ? curr : acc;
    }) % 8;

  //список близких клеток
  const closestCells = arr.filter((el) => el % 8 === minDif);

  // самая близкая клетка / лучший ход
  const finaleCell = closestCells.reduce((acc, curr) => {
    return Math.abs(targetPosition - curr) < Math.abs(targetPosition - acc)
      ? curr
      : acc;
  });
  return finaleCell;
}
