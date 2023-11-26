import { getPossibleAttacks } from "../js/utils";

test.each([
  [
    "Magician",
    33,
    [
      5, 13, 21, 29, 37, 45, 53, 61, 0, 8, 16, 24, 32, 40, 48, 56, 1, 9, 17, 25,
      41, 49, 57, 2, 10, 18, 26, 34, 42, 50, 58, 3, 11, 19, 27, 35, 43, 51, 59,
      4, 12, 20, 28, 36, 44, 52, 60, 5, 13, 21, 29, 37, 45, 53, 61,
    ],
  ],
  ["Swordsman", 27, [18, 26, 34, 19, 35, 20, 28, 36]],
  [
    "Bowman",
    36,
    [
      18, 26, 34, 42, 50, 19, 27, 35, 43, 51, 20, 28, 44, 52, 21, 29, 37, 45,
      53, 22, 30, 38, 46, 54,
    ],
  ],
])("calculating position (%i, %i)", (character, index, expected) => {
  expect(getPossibleAttacks(character, index)).toEqual(expected);
});
