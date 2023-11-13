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
  //const goodPers = ["Bowman", "Swordsman", "Magician"];
  const boardSize = 8;
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

  let twoCellArea = [
    index - 2 * boardSize - 2,
    index + 2 * boardSize - 2,
    index - 2 * boardSize + 2,
    index + 2 * boardSize + 2,
  ];

  const cellPosition = calcTileType(index, 8);
  calcTileType(oneCellArea[1], 8).includes("left") ||
  cellPosition.includes("left")
    ? (twoCellArea = twoCellArea.slice(2))
    : 0;
  calcTileType(oneCellArea.at(-2), 8).includes("right") ||
  cellPosition.includes("right")
    ? (twoCellArea = twoCellArea.slice(0, -2))
    : 0;

  cellPosition.includes("left") ? (oneCellArea = oneCellArea.slice(3)) : 0;
  cellPosition.includes("right") ? (oneCellArea = oneCellArea.slice(0, -3)) : 0;

  if (characterType === "Magician") {
    return oneCellArea;
  }
  if (characterType === "Bowman") {
    return [...oneCellArea, ...twoCellArea];
  }

  return oneCellArea;
}

export function getPossibleAtacks(character, index) {
  const goodPers = ["Bowman", "Swordsman", "Magician"];
  let n = 1;
  const boardSize = 8;
  let masAttacks = [];
  const checkMas = [];
  
  if (character === "Swordsman") {
    n = 1;
  } if (character === "Bowman") {
    n = 2;
  }
  const startCell = index - n * boardSize - n;


  for (let j = startCell; j < startCell + 2*n + 1; j++) {
    const ms = [];
    for (let i = j; i < j + (2*n + 1) * boardSize; i += boardSize) {
      ms.push(i);
    }
    masAttacks.push(ms)
  }

  
  for (let i = 0; i < Math.floor(masAttacks.length / 2) + 1;) {
    if (calcTileType(masAttacks[i][n], boardSize) === 'left') {
      masAttacks = masAttacks.slice(i);
      break;
    } else {
      i++;
    }
  }


  masAttacks = masAttacks.map(el => {
    return el.filter((elem) => {
      return (elem >= 0 && elem <= 63 && elem !== index);
    });
  });

  return masAttacks
  // this.characterPositions.forEach((el) => {
  //   if (this.CharacterAreaArr.includes(el.position) && !goodPers.includes(el.character.type)) {
  //     this.chrAtacks.push(el.position);
  //     console.log(el)
  //   }
  //   chrPositions.push(el.position);
  // });

  // this.chrAtacks.forEach(el => this.gamePlay.selectCell(el, 'red'));
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
