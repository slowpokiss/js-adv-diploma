import Character from "../Character";

export default class Bowman extends Character {
  constructor(name, type = "Bowman", attack = 25, defence = 25) {
    super(name, type);
    this.attack = attack;
    this.defence = defence;
  }
}
