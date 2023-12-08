import GamePlay from "../js/GamePlay";
import GameStateService from "../js/GameStateService";

jest.mock("../js/GamePlay");
beforeEach(() => jest.resetAllMocks());

test("тест на ошибку в load", () => {
  const stateService = new GameStateService(null);
  expect(() => stateService.load()).toThrow(new Error("Invalid state"));
});

test("отсутствие данных", () => {
  const stateService = new GameStateService(null);
  const mock = jest.fn(() => GamePlay.showError("Ошибка загрузки"));

  try {
    stateService.load();
  } catch (err) {
    mock();
  }

  expect(mock).toHaveBeenCalled();
});

test("проверка save", () => {
  const localStorageFake = {
    getItem: jest.fn(),
    setItem: jest.fn(),
  };

  const gameService = new GameStateService(localStorageFake);
  const obj = { num: 123 };
  gameService.save(obj);
  expect(localStorageFake.setItem).toHaveBeenCalledWith(
    "state",
    JSON.stringify(obj),
  );
});

test("проверка load", () => {
  const obj = { num: 123 };
  const localStorageFake = {
    setItem: jest.fn(),
    getItem: jest.fn(() => {
      return JSON.stringify(obj);
    }),
  };
  const gameService = new GameStateService(localStorageFake);

  gameService.load();
  expect(localStorageFake.getItem).toHaveBeenCalledWith("state");
  expect(gameService.load()).toEqual({ num: 123 });
});
