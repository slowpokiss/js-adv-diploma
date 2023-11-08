import Character from "../Character";

export default class Vampire extends Character {
  constructor(name, type = "Vampire", attack = 25, defence = 25) {
    super(name, type);
    this.attack = attack;
    this.defence = defence;
  }
}
