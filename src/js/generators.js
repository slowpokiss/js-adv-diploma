import Team from "./Team";

export function* characterGenerator(allowedTypes, maxLevel) {
  let randomIndex = Math.floor(Math.random() * allowedTypes.length);
  const character = new allowedTypes[randomIndex](maxLevel);

  for (let j = 0; j < maxLevel - 1; j++) {
    character.attack = (
      (character.attack * (80 + character.health)) /
      100
    ).toFixed(2);
    character.defence = (
      (character.defence * (80 + character.health)) /
      100
    ).toFixed(2);
    character.health = 80;
  }

  yield character;
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  let teamArray = [];

  for (let i = 0; i < characterCount; i++) {
    const generatedCharacter = characterGenerator(allowedTypes, maxLevel);
    teamArray.push(generatedCharacter.next().value);
  }

  return new Team(teamArray);
}

export function* generatePositions(type) {
  let col1, col2;

  if (type === "team") {
    col1 = 0;
    col2 = 1;
  }
  if (type === "enemy") {
    col1 = 6;
    col2 = 7;
  }

  const randSet = new Set();
  while (true) {
    const randomColumn = Math.floor(Math.random() * 2);
    let randN;

    if (randomColumn % 2 === 0) {
      randN = Math.floor(Math.random() * 7) * 8 + col1;
    } else {
      randN = Math.floor(Math.random() * 7) * 8 + col2;
    }

    while (randSet.has(randN)) {
      if (randomColumn % 2 === 0) {
        randN = Math.floor(Math.random() * 7) * 8 + col1;
      } else {
        randN = Math.floor(Math.random() * 7) * 8 + col2;
      }
    }
    randSet.add(randN);
    yield randN;
  }
}
