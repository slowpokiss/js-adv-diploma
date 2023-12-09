import { getPossibleArea } from "../js/utils";

test.each([
  ["Magician", 33, [24, 32, 40, 25, 41, 26, 34, 42]],
  ["Bowman", 33, [24, 32, 40, 17, 25, 41, 49, 26, 34, 42, 19, 35, 51]],
  [
    "Swordsman",
    27,
    [
      31, 0, 24, 48, 9, 25, 41, 18, 26, 34, 3, 11, 19, 35, 43, 51, 59, 20, 28,
      36, 13, 29, 45, 6, 30, 54, 63,
    ],
  ],
])("calculating area for %s index - %i", (characterType, index, expected) => {
  expect(getPossibleArea(characterType, index)).toEqual(expected);
});
