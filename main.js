
const TILE_SIZE = 128; // tile size in px
const COL_COUNT = 12;
const ROW_COUNT = 6;

const map = [];
let container;

let currentLevel = 0;
const levelLayouts = [
  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ]
];

const tileCode2Type = {
  0: 'grass',
  1: 'water'
};

function init() {
  for (let i=0; i<ROW_COUNT; i++) {
    const row = [];
    for (let j=0; j<COL_COUNT; j++) {
      const tileCode = levelLayouts[currentLevel][i][j];
      row.push({
        type: tileCode2Type[tileCode]
      });
    }
    map.push(row);
  }

  for (let ri = 0; ri < map.length; ri++) {
    const row = map[ri];
    const rowDiv = $('<div />').addClass('row');
    for (let ci = 0; ci < row.length; ci++) {
      const cell = row[ci];
      console.assert(['grass', 'water'].includes(cell.type));
      const cellDiv = $('<div />').addClass('tile').addClass(cell.type);
      cellDiv.css({
        width: TILE_SIZE,
        height: TILE_SIZE
      });
      cellDiv.on('click', () => {
        console.log('click:', ri, ci, cell);
      });
      cellDiv.appendTo(rowDiv);
    }
    rowDiv.appendTo(container);
  }
}

$(document).ready(function() {
  console.log('init');
  container = $('#map-container');
  init();
});
