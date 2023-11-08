import Character from "../Character";

export default class Undead extends Character {
  constructor(name, type = "Undead", attack = 40, defence = 10) {
    super(name, type);
    this.attack = attack;
    this.defence = defence;
  }
}
