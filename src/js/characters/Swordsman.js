import Character from "../Character";

export default class Swordsman extends Character {
  constructor(name, type = "Swordsman", attack = 4000, defence = 1000) {
    super(name, type);
    this.attack = attack;
    this.defence = defence;
  }
}
