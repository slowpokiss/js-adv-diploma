import { calcTileType } from "../js/utils";

test.each([
  [0, 8, "top-left"],
  [35, 8, "center"],
  [63, 8, "bottom-right"],
  [7, 8, "top-right"],
])("calculating position (%i, %i)", (index, boardSize, expected) => {
  expect(calcTileType(index, boardSize)).toBe(expected);
});
