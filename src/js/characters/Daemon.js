import Character from "../Character";

export default class Daemon extends Character {
  constructor(name, type = "Daemon", attack = 10, defence = 10) {
    super(name, type);
    this.attack = attack;
    this.defence = defence;
  }
}
