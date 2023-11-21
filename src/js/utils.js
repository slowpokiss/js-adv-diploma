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
  const goodPers = ["Bowman", "Swordsman", "Magician"];
  let ni;
  const boardSize = 8;
  if (characterType === "Magician") {
    ni = 1;
  }
  if (characterType === "Bowman") {
    ni = 2;
  }
  if (characterType === "Swordsman") {
    ni = 4;
  }

  let oneCellArea = [
    index - boardSize - 1,
    index - 1,
    index + boardSize - 1,
    index - boardSize,
    index + boardSize,
    index - boardSize + 1,
    index + 1,
    index + boardSize + 1,
  ];

  for (let n = 2; n <= ni; n++) {
    let twoCellArea = [
      index - n * boardSize - n,
      index + n * boardSize - n,
      index - n * boardSize + n,
      index + n * boardSize + n,
    ];
    oneCellArea.push(...twoCellArea);
  }

  oneCellArea = oneCellArea.filter((el) => {
    return (
      getVector(el, index) !== undefined &&
      getVector(el, index) < ni + 1 &&
      el >= 0 &&
      el <= 63
    );
  });

  return oneCellArea;
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
  let n = 1;
  const boardSize = 8;
  let masAttacks = [];

  if (character === "Bowman") {
    n = 2;
  }
  if (character === "Magician") {
    n = 4;
  }

  const startCell = index - n * boardSize - n;
  for (let j = startCell; j < startCell + 2 * n + 1; j++) {
    for (let i = j; i < j + (2 * n + 1) * boardSize; i += boardSize) {
      masAttacks.push(i);
    }
  }

  masAttacks = masAttacks.filter((elem) => {
    return (
      elem >= 0 &&
      elem <= 63 &&
      elem !== index &&
      getRadius(elem, index) < n + 1
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
  return Math.max(attacker.attack - target.defence, attacker.attack * 0.1);
}
