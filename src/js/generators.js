import Team from "./Team";

export function* characterGenerator(allowedTypes, maxLevel) {
  let randomIndex = Math.floor(Math.random() * allowedTypes.length);
  let randLevel = Math.floor(Math.random() * maxLevel + 1);
  yield new allowedTypes[randomIndex](randLevel);
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  let teamArray = [];

  for (let i = 0; i < characterCount; i++) {
    const a = characterGenerator(allowedTypes, maxLevel);
    teamArray.push(a.next().value);
  }

  return new Team(teamArray);
}
