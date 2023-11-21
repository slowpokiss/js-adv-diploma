import { getPossibleArea } from "../js/utils";

test.each([
  ["Magician", 33, [24, 32, 40, 25, 41, 26, 34, 42]],
  ["Bowman", 33, [24, 32, 40, 25, 41, 26, 34, 42, 19, 51]],
  [
    "Swordsman",
    27,
    [18, 26, 34, 19, 35, 20, 28, 36, 9, 41, 13, 45, 0, 48, 6, 54, 63],
  ],
])("calculating position (%i, %i)", (characterType, index, expected) => {
  expect(getPossibleArea(characterType, index)).toEqual(expected);
});
