
const TILE_SIZE = 128; // tile size in px
const COL_COUNT = 12;
const ROW_COUNT = 6;

const map = [];
let container;

function init() {
  for (let i=0; i<ROW_COUNT; i++) {
    const row = [];
    for (let j=0; j<COL_COUNT; j++) {
      row.push({
        type: j%2? 'grass' : 'water'
      });
    }
    map.push(row);
  }

  for (const row of map) {
    const rowDiv = $('<div />').addClass('row');
    for (const cell of row) {
      console.assert(['grass', 'water'].includes(cell.type));
      const cellDiv = $('<div />').addClass('tile').addClass(cell.type);
      cellDiv.css({
        width: TILE_SIZE,
        height: TILE_SIZE
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
