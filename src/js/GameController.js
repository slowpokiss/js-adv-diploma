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
import { generatePositions } from "./generators";
import { closestCellTo } from "./utils";

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
    this.goodPers = ["Bowman", "Swordsman", "Magician"];
    this.badTeam = ["Daemon", "Vampire", "Undead"];
    this.characterPositions = [];
    this.addEvents();
  }

  init() {
    this.characterAreaArray = [];
    this.characterAttacks = [];
    this.clearSelections();
    let mapList = Object.values(themes);
    this.gamePlay.drawUi(
      mapList[this.themesCount % Object.keys(themes).length],
    );
    this.drawCharacters(this.themesCount + 1, this.themesCount + 2);
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
    const playerTypes = [Bowman, Swordsman, Magician];
    const playerTeam = generateTeam(
      playerTypes,
      1,
      count - this.characterPositions.length,
    );
    const plrGen = generatePositions("team");

    const chrPositionsArray = [];
    this.characterPositions.forEach((el) =>
      chrPositionsArray.push(el.position),
    );
    this.characterPositions.push(
      ...playerTeam.teamFolder.map((el) => {
        let chrPosition = plrGen.next().value;
        while (chrPositionsArray.includes(chrPosition)) {
          chrPosition = plrGen.next().value;
        }
        return new PositionedCharacter(el, chrPosition);
      }),
    );

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
    if (this.currentCell) {
      this.gamePlay.deselectCell(this.currentCell);
    }
    this.gamePlay.cells.forEach((el, ind) => this.gamePlay.deselectCell(ind));
    this.gamePlay.deAreaCell();
    if (this.characterAttacks) {
      this.characterAttacks.forEach((el) =>
        this.gamePlay.deselectCell(el.position),
      );
    }
    this.currentCell = undefined;
    this.characterAreaArray = [];
    this.characterAttacks = [];
  }

  async turn(attacker, badAttacked) {
    const arrPersPos = [];
    this.characterPositions.forEach((el) => arrPersPos.push(el.position));
    const badPers = this.characterPositions.filter((el) =>
      this.badTeam.includes(el.character.type),
    );
    const goodPers = this.characterPositions.filter(
      (el) => !this.badTeam.includes(el.character.type),
    );
    const targetPers = goodPers.reduce(function (acc, curr) {
      return acc.character.attack > curr.character.attack ? acc : curr;
    });

    // выбор силача
    const powerfullPers = badPers[0];
    const powerPersAttacks = getPossibleAttacks(
      powerfullPers.character.type,
      powerfullPers.position,
    );
    let movementsPowerPers = getPossibleArea(
      powerfullPers.character.type,
      powerfullPers.position,
    );
    movementsPowerPers = movementsPowerPers.filter(
      (el) => !arrPersPos.includes(el),
    );

    if (badAttacked) {
      const attackedPersAttacks = getPossibleAttacks(
        badAttacked.character.type,
        badAttacked.position,
      );
      let movementsAttackedPers = getPossibleArea(
        badAttacked.character.type,
        badAttacked.position,
      );
      movementsAttackedPers = movementsAttackedPers.filter(
        (el) => !arrPersPos.includes(el),
      );

      if (attackedPersAttacks.includes(attacker.position)) {
        await this.attackLogic(badAttacked, attacker);
      } else {
        badAttacked.position = closestCellTo(
          movementsAttackedPers,
          attacker.position,
        );
      }
    } else {
      if (!powerPersAttacks.includes(targetPers.position)) {
        powerfullPers.position = closestCellTo(
          movementsPowerPers,
          targetPers.position,
        );
      } else {
        await this.attackLogic(powerfullPers, targetPers);
      }
    }
  }

  onCellClick(index) {
    let pers = this.getCharacter(index);

    // постороняя клетка
    if (
      !pers &&
      !this.characterAttacks.includes(index) &&
      !this.characterAreaArray.includes(index)
    ) {
      this.clearSelections();
      return;
    }
    const char = this.getCharacter(this.currentCell);
    // проверка атаки
    if (
      this.characterAttacks &&
      this.characterAttacks.some((el) => el.position === index)
    ) {
      this.attackLogic(this.getCharacter(this.currentCell), pers).then(
        (data) => {
          if (data === "end") {
            this.themesCount += 1;
            this.levelUp();
            this.init();
            return;
          }
          this.turn(char, this.getCharacter(index)).then(() => {
            this.gamePlay.redrawPositions(this.characterPositions);
            this.clearSelections();
            return;
          });
        },
      );
    }

    // проверка перехода персонажа
    if (this.characterAreaArray && this.characterAreaArray.includes(index)) {
      if (pers && this.currentCell) {
        this.clearSelections();
        return;
      }
      if (char) {
        char.position = index;
      }

      this.gamePlay.redrawPositions(this.characterPositions);
      this.clearSelections();
      this.turn().then(() => {
        this.gamePlay.redrawPositions(this.characterPositions);
      });
    }

    // проверка выбора персонажа
    this.clearSelections();
    if (pers && this.goodPers.includes(pers.character.type)) {
      this.gamePlay.selectCell(index);
      this.currentCell = index;
      this.checkPossibleArea(pers.character.type, index);
    }
  }

  checkPossibleArea(pers, index) {
    this.characterAreaArray = getPossibleArea(pers, index);
    const chrCells = [];
    const chrRadius = getPossibleAttacks(pers, index);
    this.characterAttacks = [];

    this.characterPositions.forEach((el) => {
      if (
        !this.goodPers.includes(el.character.type) &&
        chrRadius.includes(el.position)
      ) {
        this.gamePlay.selectCell(el.position, "red");
        this.characterAttacks.push(el);
      }
      chrCells.push(el.position);
    });

    this.characterAreaArray = this.characterAreaArray.filter(
      (el) => !chrCells.includes(el),
    );

    this.drawPossibleArea(this.characterAreaArray);
    return this.characterAreaArray;
  }

  drawPossibleArea(arr) {
    arr.forEach((el) => {
      this.gamePlay.areaCell(el);
    });
  }

  async attackLogic(pers, enemy) {
    return new Promise((resolve) => {
      const damage = getAttackPower(pers.character, enemy.character);
      enemy.character.health = enemy.character.health - damage;
      if (enemy.character.health <= 0) {
        this.characterPositions = this.characterPositions.filter(
          (el) => el !== enemy,
        );
      }
      if (
        !this.characterPositions.some(
          (el) => !this.goodPers.includes(el.character.type),
        )
      ) {
        this.gamePlay.showDamage(enemy.position, damage).then((data) => {
          resolve("end");
        });
      }

      this.gamePlay.showDamage(enemy.position, damage).then((data) => {
        this.gamePlay.redrawPositions(this.characterPositions);
        resolve();
      });
    });
  }

  levelUp() {
    const plrGen = generatePositions("team");

    this.characterPositions.forEach((el) => {
      el.position = plrGen.next().value;
      el.character.attack = Math.max(
        el.character.attack,
        (el.character.attack * (80 + el.character.health)) / 100,
      ).toFixed(2);
      el.character.defence = Math.max(
        el.character.defence,
        (el.character.defence * (80 + el.character.health)) / 100,
      ).toFixed(2);
      if ((el.character.health + 80) / 100 > 1) {
        el.character.health = 100;
      } else {
        el.character.health += 80;
      }
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

    const cell = [...this.gamePlay.cells[index].children][0];
    if (cell) {
      if (cell.classList[0] === "selected-cell") {
        this.gamePlay.setCursor("pointer");
      }
    }

    if (this.characterAttacks) {
      this.characterAttacks.forEach((el) => {
        if (el.position === index) {
          this.gamePlay.setCursor("pointer");
        }
      });
    }
  }

  onCellLeave(index) {
    this.gamePlay.setCursor("auto");
    const pers = this.getCharacter(index);
    if (pers) {
      this.gamePlay.hideCellTooltip(index);
    }
  }

  onNewGameClick() {
    this.themesCount = 0;
    this.characterPositions = [];
    this.init();
  }

  onSaveGameClick() {
    GameState.from({
      positions: this.characterPositions,
      theme: this.themesCount,
    });

    this.stateService.save(GameState.stateObject);
  }

  onLoadGameClick() {
    const response = this.stateService.load();
    if (response !== undefined) {
      this.themesCount = response.theme;
      this.gamePlay.drawUi(Object.values(themes)[this.themesCount]);
      this.characterPositions = response.positions;
      this.gamePlay.redrawPositions(response.positions);
    }
  }
}
