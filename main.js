
const TILE_SIZE = 128; // tile size in px
const COL_COUNT = 12;
const ROW_COUNT = 6;
const DAM_STRENGTH = 4;

const map = [];
let container;

let currentLevel = 0;
const levelLayouts = [
  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [0, 4, 4, 0, 2, 2, 2, 2, 0, 0, 0, 2],
    [0, 4, 4, 4, 3, 0, 0, 2, 2, 2, 0, 0],
    [1, 1, 1, 1, 1, 3, 0, 2, 0, 0, 0, 0],
    [0, 1, 1, 3, 3, 0, 0, 0, 0, 0, 0, 0],
    [1, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ]
];

// This var lists all the known tile types.
// It is used both as a type checking aid,
// as well as an index->type mapping for the level layouts,
// so its order is also important.
const tileTypes = ['grass', 'water', 'swamp', 'dam', 'highground'];

// TODO: forEachTileInMap util?
function updateTileCounters() {
  for (let ri = 0; ri < map.length; ri++) {
    const row = map[ri];
    for (let ci = 0; ci < row.length; ci++) {
      const cell = row[ci];
      console.assert(tileTypes.includes(cell.type));
      if (cell.type === 'dam') {
        console.log('annotating dam:', cell);
        if (!cell.counterNode) {
          const counter = $('<div />').addClass('round-counter');
          counter.appendTo(container);
          cell.counterNode = counter;
          cell.counterNode.css({
            top: cell.domNode.position().top,
            left: cell.domNode.position().left,
            width: TILE_SIZE,
            height: TILE_SIZE,
            'font-size': TILE_SIZE * 0.4 + 'px',
            'line-height': TILE_SIZE + 12 + 'px'
          });
        }
        cell.counterNode.text(cell.strength);
      }
    }
  }
}

function getNeighbours(i, j) {
  // we also support passing a tile object
  if (typeof i === 'object') {
    console.assert(i.hasOwnProperty('i') && i.hasOwnProperty('j'));
    j = i.j;
    i = i.i;
  }
  console.assert(i >= 0 && j >= 0);

  const neighbours = [];
  if (i-1 >= 0) {
    // tile above
    neighbours.push(map[i-1][j]);
  }
  if (j+1 < COL_COUNT) {
    // tile to the right
    neighbours.push(map[i][j+1]);
  }
  if (i+1 < ROW_COUNT) {
    // tile below
    neighbours.push(map[i+1][j]);
  }
  if (j-1 >= 0) {
    // tile to the left
    neighbours.push(map[i][j-1]);
  }

  return neighbours;
}

function floodTile(tile) {
  tile.type = 'water';
  tile.updated = true;
  tile.domNode.removeClass(tileTypes);
  tile.domNode.addClass('water');
}

function removeDam(tile) {
  delete tile.strength;
  tile.counterNode.remove();
  delete tile.counterNode;
  // TODO: add support for replacing covered tile
  tile.type = 'grass';
  tile.domNode.removeClass(tileTypes);
  tile.domNode.addClass('grass');
}

function countWaterNeighbours(tile) {
  const neighbours = getNeighbours(tile);
  let count = 0;
  neighbours.forEach(n => {
    if (n.type === 'water') {
      count++;
    }
  });
  return count;
}

function floodNeighbours(i, j) {
  // floods the neighbouring tiles, considers dams and applies decay
  for (const tile of getNeighbours(i, j)) {
    if (tile.type === 'grass') {
      floodTile(tile);
    }
    if (tile.type === 'swamp') {
      floodSwamp(i, j);
    }
    if (tile.type === 'dam') {
      tile.strength -= 1;
      if (tile.strength <= countWaterNeighbours(tile)) {
        tile.counterNode.addClass('failing');
      }
      if (tile.strength === 0) {
        removeDam(tile);
      }
    }
  }
}

function floodSwamp(i, j) {
  // floods every cell in a contigous swamp region neighbouring i, j
  console.assert(!map[i][j].explored);
  const swamp = [map[i][j]];
  function hasUnexplored(swamp) {
    return swamp.some(function(tile) {
      return !tile.explored;
    });
  }
  // TODO: add failsafe iter count to while condition
  //       - this algorithm should not take more than max(row, col) iterations
  while(hasUnexplored(swamp)) {
    swamp.forEach(tile => {
      getNeighbours(tile).forEach(neighbour => {
        if (neighbour.type === 'swamp') {
          swamp.push(neighbour);
        }
        tile.explored = true;
      });
    });
  }

  // flood and clear explored markers
  swamp.forEach(tile => {
    floodTile(tile);
    delete tile.explored;
  });
}

function updateMap() {
  // updates the map types in-place by applying flooding rules

  for (let ri = 0; ri < map.length; ri++) {
    const row = map[ri];
    for (let ci = 0; ci < row.length; ci++) {
      const cell = row[ci];
      console.assert(tileTypes.includes(cell.type));

      if (cell.type === 'water' && !cell.updated) {
        floodNeighbours(ri, ci);
      }
    }
  }

  // clear updated flags
  for (let ri = 0; ri < map.length; ri++) {
    const row = map[ri];
    for (let ci = 0; ci < row.length; ci++) {
      const cell = row[ci];
      console.assert(tileTypes.includes(cell.type));
      delete cell.updated;
    }
  }
}

function endTurn() {
  console.log('ending turn...');

  updateMap();
  // TODO: apply worker effects and remove workers

  updateTileCounters();
}

function init() {
  for (let i=0; i<ROW_COUNT; i++) {
    const row = [];
    for (let j=0; j<COL_COUNT; j++) {
      const tileCode = levelLayouts[currentLevel][i][j];
      const tile = {
        i: i,
        j: j,
        type: tileTypes[tileCode]
      };
      if (tile.type === 'dam') {
        tile.strength = DAM_STRENGTH;
      }
      row.push(tile);
    }
    map.push(row);
  }

  for (let ri = 0; ri < map.length; ri++) {
    const row = map[ri];
    const rowDiv = $('<div />').addClass('row');
    for (let ci = 0; ci < row.length; ci++) {
      const cell = row[ci];
      console.assert(tileTypes.includes(cell.type));
      const cellDiv = $('<div />').addClass('tile').addClass(cell.type);
      cellDiv.css({
        width: TILE_SIZE,
        height: TILE_SIZE
      });
      cellDiv.on('click', () => {
        console.log('click:', ri, ci, cell);
      });
      // we add a reference to the dom node
      cell.domNode = cellDiv;
      cellDiv.appendTo(rowDiv);
    }
    rowDiv.appendTo(container);
  }

  updateTileCounters();
}

$(document).ready(function() {
  console.log('init');
  container = $('#map-container');
  init();

  $('#end-turn-button').on('click', () => {
    endTurn();
  });
});
