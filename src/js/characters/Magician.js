import Character from "../Character";

export default class Magician extends Character {
  constructor(name, type = "Magician", attack = 10, defence = 40) {
    super(name, type);
    this.attack = attack;
    this.defence = defence;
  }
}
