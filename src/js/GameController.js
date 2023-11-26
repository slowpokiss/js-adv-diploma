import GamePlay from "./GamePlay";
import GameState from "./GameState";
import Bowman from "./characters/Bowman";
import Swordsman from "./characters/Swordsman";
import Magician from "./characters/Magician";
import Vampire from "./characters/Vampire";
import Undead from "./characters/Undead";
import Daemon from "./characters/Daemon";
import PositionedCharacter from "./PositionedCharacter";
import themes from "./themes";
import { generateTeam } from "./generators";
import { getPossibleArea } from "./utils";
import { getPossibleAttacks } from "./utils";
import { getAttackPower } from "./utils";
import { generatePositions } from "./utils";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;

    this.onCellEnter = this.onCellEnter.bind(this);
    this.onCellLeave = this.onCellLeave.bind(this);
    this.onCellClick = this.onCellClick.bind(this);
    this.onNewGameClick = this.onNewGameClick.bind(this);
    this.onSaveGameClick = this.onSaveGameClick.bind(this);
    this.onLoadGameClick = this.onLoadGameClick.bind(this);
    this.themesCount = 0;
    this.characterPositions = [];
    this.addEvents();
  }

  init() {
    this.CharacterAreaArr = [];
    this.chrAtacks = [];
    this.clearSelections();
    this.gamePlay.drawUi(
      Object.values(themes)[this.themesCount % Object.keys(themes).length],
    );
    this.drawCharacters(
      this.themesCount + 3,
      this.themesCount + 3 > this.gamePlay.boardSize * 2
        ? this.gamePlay.boardSize * 2
        : this.themesCount + 3,
    );
  }

  addEvents() {
    this.gamePlay.addCellEnterListener(this.onCellEnter);
    this.gamePlay.addCellLeaveListener(this.onCellLeave);
    this.gamePlay.addCellClickListener(this.onCellClick);
    this.gamePlay.addNewGameListener(this.onNewGameClick);
    this.gamePlay.addSaveGameListener(this.onSaveGameClick);
    this.gamePlay.addLoadGameListener(this.onLoadGameClick);
  }

  drawCharacters(lvl, count) {
    if (this.themesCount === 0) {
      const playerTypes = [Bowman, Swordsman, Magician];
      //const playerTypes = [Swordsman];

      const playerTeam = generateTeam(playerTypes, 5, 5);
      const plrGen = generatePositions("team");
      playerTeam.teamFolder.forEach((el) => {
        this.characterPositions.push(
          new PositionedCharacter(el, plrGen.next().value),
        );
      });
    }
    const enemyTypes = [Vampire, Undead, Daemon];
    const enemyTeam = generateTeam(enemyTypes, lvl, count);
    const enemGen = generatePositions("enemy");
    enemyTeam.teamFolder.forEach((el) => {
      this.characterPositions.push(
        new PositionedCharacter(el, enemGen.next().value),
      );
    });
    this.gamePlay.redrawPositions(this.characterPositions);
  }

  getCharacter(index) {
    return this.characterPositions.find((el) => el.position === index);
  }

  clearSelections() {
    if (this.currCell) {
      this.gamePlay.deselectCell(this.currCell);
    }
    this.gamePlay.cells.forEach((el, ind) => this.gamePlay.deselectCell(ind));
    this.gamePlay.deAreaCell();
    if (this.chrAtacks) {
      this.chrAtacks.forEach((el) => this.gamePlay.deselectCell(el.position));
    }
    this.currCell = undefined;
    this.CharacterAreaArr = [];
    this.chrAtacks = [];
  }

  turn() {
    return new Promise((resolve) => {
      // атакуют первого самого сильно персонажа

      const arrPersPos = [];
      this.characterPositions.forEach((el) => arrPersPos.push(el.position));
      const badTeam = ["Daemon", "Vampire", "Undead"];
      const badPers = this.characterPositions.filter((el) =>
        badTeam.includes(el.character.type),
      );
      const goodPers = this.characterPositions.filter(
        (el) => !badTeam.includes(el.character.type),
      );

      this.targetPers = goodPers.reduce(function (acc, curr) {
        return acc.character.attack > curr.character.attack ? acc : curr;
      });

      // выбор рандома
      const randPers = badPers[Math.floor(Math.random() * badPers.length)];
      const randPersAttacks = getPossibleAttacks(
        randPers.character.type,
        randPers.position,
      );
      let mvtsRandPers = getPossibleArea(
        randPers.character.type,
        randPers.position,
      );
      mvtsRandPers = mvtsRandPers.filter((el) => !arrPersPos.includes(el));
      if (randPersAttacks.includes(this.targetPers.position)) {
        this.attackLogic(randPers, this.targetPers);
      } else {
        const closestСell = mvtsRandPers.reduce((acc, curr) =>
          Math.abs(acc - this.targetPers.position) <
          Math.abs(curr - this.targetPers.position)
            ? acc
            : curr,
        );
        randPers.position = closestСell;
      }

      // рандомные движение рандома
      // let mvtsRandPers = getPossibleArea(randPers.character.type, randPers.position);
      // mvtsRandPers = mvtsRandPers.filter(el => !arrPersPos.includes(el));
      // randPers.position = mvtsRandPers[Math.floor(Math.random() * (mvtsRandPers.length))];

      this.gamePlay.redrawPositions(this.characterPositions);
    });
  }

  onCellClick(index) {
    let pers = this.getCharacter(index);
    const goodPers = ["Bowman", "Swordsman", "Magician"];

    // постороняя клетка
    if (
      !pers &&
      !this.chrAtacks.includes(index) &&
      !this.CharacterAreaArr.includes(index)
    ) {
      this.clearSelections();
      return;
    }

    // проверка атаки
    if (this.chrAtacks && this.chrAtacks.some((el) => el.position === index)) {
      this.attackLogic(this.getCharacter(this.currCell), pers);
      // Запись
      GameState.from({
        positions: this.characterPositions,
        theme: this.themesCount,
      });

      this.clearSelections();
    }

    // проверка перехода персонажа
    if (this.CharacterAreaArr && this.CharacterAreaArr.includes(index)) {
      const char = this.getCharacter(this.currCell);
      if (pers && this.currCell) {
        this.clearSelections();
        return;
      }
      char ? (char.position = index) : 0;
      this.gamePlay.redrawPositions(this.characterPositions);
      // Запись
      GameState.from({
        positions: this.characterPositions,
        theme: this.themesCount,
      });

      this.clearSelections();
      this.turn().then((data) => {
        console.log(data, "done");
      });
    }

    // проверка выбора персонажа
    this.clearSelections();
    if (pers && goodPers.includes(pers.character.type)) {
      this.gamePlay.selectCell(index);
      this.currCell = index;
      this.checkPossibleArea(pers.character.type, index);
    }

    // if (pers && !goodPers.includes(pers.character.type)) {
    //   GamePlay.showError("Это противник!");
    // }
  }

  checkPossibleArea(pers, index) {
    this.CharacterAreaArr = getPossibleArea(pers, index);
    const chrCells = [];
    const goodPers = ["Bowman", "Swordsman", "Magician"];
    const chrRadius = getPossibleAttacks(pers, index);
    this.chrAtacks = [];

    this.characterPositions.forEach((el) => {
      if (
        !goodPers.includes(el.character.type) &&
        chrRadius.includes(el.position)
      ) {
        this.gamePlay.selectCell(el.position, "red");
        this.chrAtacks.push(el);
      }
      chrCells.push(el.position);
    });

    this.CharacterAreaArr = this.CharacterAreaArr.filter((el) => {
      return !chrCells.includes(el);
    });

    this.drawPossibleArea(this.CharacterAreaArr);
    return this.CharacterAreaArr;
  }

  drawPossibleArea(arr) {
    arr.forEach((el) => {
      this.gamePlay.areaCell(el);
    });
  }

  attackLogic(pers, enemy) {
    const goodPers = ["Bowman", "Swordsman", "Magician"];
    const damage = getAttackPower(pers.character, enemy.character);
    enemy.character.health = enemy.character.health - damage;
    if (enemy.character.health <= 0) {
      this.characterPositions = this.characterPositions.filter(
        (el) => el !== enemy,
      );
      if (
        !this.characterPositions.some(
          (el) => !goodPers.includes(el.character.type),
        )
      ) {
        this.themesCount += 1;
        this.levelUp();
        this.init();
      }
    }
    this.gamePlay.showDamage(enemy.position, damage).then((data) => {
      this.gamePlay.redrawPositions(this.characterPositions);
    });
  }

  levelUp() {
    const plrGen = generatePositions("team");
    this.characterPositions.forEach((el) => {
      el.position = plrGen.next().value;
      (el.character.health + 80) / 100 > 1
        ? (el.character.health = 100)
        : (el.character.health += 80);
      el.character.level += 1;
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
      cell.classList[0] === "selected-cell"
        ? this.gamePlay.setCursor("pointer")
        : 0;
    }

    if (this.chrAtacks) {
      this.chrAtacks.forEach((el) => {
        if (el.position === index) {
          this.gamePlay.setCursor("pointer");
        }
      });
    }
  }

  onCellLeave(index) {
    this.gamePlay.setCursor("auto");
    const pers = this.characterPositions.find((el) => el.position === index);
    pers ? this.gamePlay.hideCellTooltip(index) : 0;
  }

  onNewGameClick() {
    this.themesCount = 0;
    this.characterPositions = [];
    this.init();
  }

  onSaveGameClick() {
    this.stateService.save(GameState.stateObject);
  }

  onLoadGameClick() {
    const response = this.stateService.load();
    this.themesCount = response.theme;
    this.gamePlay.drawUi(Object.values(themes)[this.themesCount]);

    this.characterPositions = response.positions;
    this.gamePlay.redrawPositions(response.positions);
  }
}
