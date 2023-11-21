import Character from "../Character";

export default class Swordsman extends Character {
  constructor(name, type = "Swordsman", attack = 1000, defence = 10) {
    super(name, type);
    this.attack = attack;
    this.defence = defence;
  }
}
