import GamePlay from "./GamePlay";
import Bowman from "./characters/Bowman";
import Swordsman from "./characters/Swordsman";
import Magician from "./characters/Magician";
import Vampire from "./characters/Vampire";
import Undead from "./characters/Undead";
import Daemon from "./characters/Daemon";
import PositionedCharacter from "./PositionedCharacter";
import { generateTeam } from "./generators";
import { getPossibleArea } from "./utils";
import { getPossibleAtacks } from "./utils";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;

    this.onCellEnter = this.onCellEnter.bind(this);
    this.onCellLeave = this.onCellLeave.bind(this);
    this.onCellClick = this.onCellClick.bind(this);
  }

  init() {
    this.gamePlay.drawUi("prairie");
    this.addEvents();
    this.drawCharacters();
  }

  addEvents() {
    this.gamePlay.addCellEnterListener(this.onCellEnter);
    this.gamePlay.addCellLeaveListener(this.onCellLeave);
    this.gamePlay.addCellClickListener(this.onCellClick);
  }

  drawCharacters() {
    function* generatePositions(type) {
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

    this.characterPositions = [];
    const playerTypes = [Bowman, Swordsman, Magician];
    this.playerTeam = generateTeam(playerTypes, 5, 5);
    const plrGen = generatePositions("team");
    this.playerTeam.teamFolder.forEach((el) => {
      this.characterPositions.push(
        new PositionedCharacter(el, plrGen.next().value),
      );
    });

    const enemyTypes = [Vampire, Undead, Daemon];
    this.enemyTeam = generateTeam(enemyTypes, 5, 5);
    const enemGen = generatePositions("enemy");
    this.enemyTeam.teamFolder.forEach((el) => {
      this.characterPositions.push(
        new PositionedCharacter(el, enemGen.next().value),
      );
    });

    this.gamePlay.redrawPositions(this.characterPositions);
  }

  getCharacter(index) {
    return this.characterPositions.find((el) => el.position === index);
  }

  onCellClick(index) {
    if (this.currCell >= 0) {
      this.gamePlay.deselectCell(this.currCell);
      this.gamePlay.deAreaCell();
     // this.chrAtacks.forEach(el => this.gamePlay.deselectCell(el));
    }

    let pers = this.getCharacter(index);
    const goodPers = ["Bowman", "Swordsman", "Magician"];

    if (pers && goodPers.includes(pers.character.type)) {
      this.gamePlay.selectCell(index);
      this.currCell = index;
      this.checkPossibleArea(pers.character.type, index);
    }

    if (this.CharacterAreaArr && this.CharacterAreaArr.includes(index)) {
      const char = this.characterPositions.find(
        (el) => el.position === this.currCell,
      );
      char ? (char.position = index) : 0;
      this.gamePlay.redrawPositions(this.characterPositions);
    }

    // if (pers && !goodPers.includes(pers.character.type)) {
    //   GamePlay.showError("Это противник!");
    // }
  }

  checkPossibleArea(pers, index) {
    this.CharacterAreaArr = getPossibleArea(pers, index);
    const chrPositions = [];
    //const goodPers = ["Bowman", "Swordsman", "Magician"];

    this.characterPositions.forEach((el) => chrPositions.push(el.position));
    console.log(getPossibleAtacks(pers, index))

    this.CharacterAreaArr = this.CharacterAreaArr.filter((el) => {
      return !chrPositions.includes(el) && el >= 0 && el <= 63;
    });

    this.drawPossibleArea(this.CharacterAreaArr);
    return this.CharacterAreaArr;
  }

  drawPossibleArea(arr) {
    arr.forEach((el) => {
      this.gamePlay.areaCell(el);
    });
  }

  onCellEnter(index) {
    const pers = this.getCharacter(index);
    if (pers) {
      ["Bowman", "Swordsman", "Magician"].includes(pers.character.type)
        ? this.gamePlay.setCursor("pointer")
        : this.gamePlay.setCursor("not-allowed");
      this.gamePlay.showCellTooltip(
        `\u{1F396}${pers.character.level} \u2694${pers.character.attack} \u{1F6E1}${pers.character.defence} \u2764${pers.character.health}`,
        index,
      );
    }

    const cell = [...this.gamePlay.cells.at(index).children][0];
    if (cell) {
      cell.classList[0] === "selected-cell"? this.gamePlay.setCursor("pointer"): 0;
    }
  }

  onCellLeave(index) {
    this.gamePlay.setCursor("auto");
    const pers = this.characterPositions.find((el) => el.position === index);
    pers ? this.gamePlay.hideCellTooltip(index) : 0;
  }
}
