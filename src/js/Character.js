export default class Character {
  constructor(level, type = "generic") {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;

    if (this.constructor === Character) {
      throw new Error("нельзя создать экземпляр базового класса Character");
    }
  }
}
