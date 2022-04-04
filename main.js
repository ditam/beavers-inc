
const TILE_SIZE = 32; // tile size in px
const COL_COUNT = 32;
const ROW_COUNT = 16;
const DAM_STRENGTH = 4;
const FLOOD_ANIM_DURATION = 1300; // should match CSS animation durations
const BUILD_DAM_ANIM_DURATION = 1100;
const CUT_WOOD_ANIM_DURATION = 500;

let isFullscreen = false;
let isGameOver = false;

const sounds = {};

// NB: loaded from level data
const resources = {
  workers: 0,
  wood: 0,
  time: 0
};

const placedWorkers = {}; // key is i|j

const map = [];
let container;
let endTurnButton;
let workerCounter, woodCounter, timerCounter;

let currentLevel = 2;
const levelData = [
  {
    map: [
      [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
      [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
      [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
      [4,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
      [1,4,7,7,7,7,7,7,7,7,7,7,7,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
      [1,1,4,4,7,7,7,7,7,7,7,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
      [1,1,1,4,4,7,7,7,7,7,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,4],
      [1,1,1,1,1,4,7,7,4,4,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,4,4,7,4,4,1],
      [1,1,4,1,1,1,4,4,1,1,4,4,4,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,1,1,1],
      [4,4,4,4,4,1,1,1,1,1,1,1,1,1,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1,4,4],
      [5,5,5,0,0,4,1,1,4,4,4,1,1,1,1,1,1,1,4,1,0,0,0,0,4,4,4,4,4,4,4,0],
      [5,5,5,5,0,7,4,4,7,7,7,4,4,4,4,4,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
      [5,5,0,5,0,7,7,7,7,7,7,7,7,7,7,7,4,4,1,1,1,1,1,4,0,0,0,0,4,4,0,0],
      [7,7,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,4,4,4,4,1,1,4,0,4,0,0,4,4,0],
      [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,4,1,1,1,4,0,0,0,0,0],
      [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,4,4,1,4,0,0,0,0,0]
    ],
    objectives: [
      {x: 27, y: 13}
    ],
    resources: {
      workers: 1,
      wood: 0,
      time: 7
    }
  },
  {
    map: [
      [2,2,2,0,2,2,2,2,4,1,1,1,1,1,1,1,1,1,4,5,5,5,4,4,4,0,2,0,2,2,7,7],
      [5,2,2,2,0,2,2,2,4,1,1,1,1,1,1,1,1,4,5,5,4,4,4,4,4,0,2,2,2,2,2,7],
      [2,2,2,5,5,5,2,4,1,1,1,1,1,1,1,1,4,4,4,4,4,5,5,5,2,5,2,0,2,5,2,7],
      [5,2,2,0,5,5,4,1,1,1,4,1,1,1,1,0,2,2,4,5,2,2,2,2,2,2,0,7,7,2,7,7],
      [5,2,5,0,0,4,1,1,1,4,4,4,1,1,4,0,0,2,2,2,2,2,0,0,0,2,2,7,7,7,7,7],
      [2,0,0,0,0,0,1,1,4,4,1,1,1,4,0,0,0,2,2,2,5,2,2,0,0,2,7,7,7,7,7,7],
      [5,2,5,0,4,1,1,1,1,1,1,1,4,5,0,0,2,2,2,5,2,2,0,0,2,2,2,2,7,7,7,7],
      [2,2,5,4,1,1,1,1,1,1,1,1,4,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,7,7,7,7],
      [2,5,4,1,1,1,1,1,1,1,1,4,5,5,5,0,7,7,7,7,0,0,0,2,5,2,2,7,7,7,7,7],
      [5,4,1,1,1,1,1,1,1,1,4,5,5,5,0,0,7,7,7,7,7,0,2,2,2,2,2,7,7,7,7,7],
      [4,4,1,1,1,1,1,1,4,4,0,5,5,5,5,5,5,5,7,7,7,2,2,2,7,7,7,7,7,7,7,7],
      [1,1,1,1,1,4,4,4,4,4,0,0,5,5,0,5,5,5,5,7,7,2,2,2,7,7,7,7,7,7,7,7],
      [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,7,7,5,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
      [1,1,1,1,4,0,0,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
      [1,1,1,4,4,5,5,0,0,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
      [1,1,4,4,4,5,5,5,0,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7]
    ],
    objectives: [
      {x: 4, y: 1},
      {x: 9, y: 14},
    ],
    resources: {
      workers: 3,
      wood: 3,
      time: 9
    }
  },
  {
    map: [
      [0, 0, 0, 0, 0],
      [1, 1, 1, 0, 0],
      [0, 2, 4, 5, 0],
      [0, 0, 0, 0, 0]
    ],
    objectives: [
      {x: 4, y: 1}
    ],
    resources: {
      workers: 5,
      wood: 10,
      time: 10
    }
  }
];

const DEBUG = {
  paintMode: false,
  paintIndex: 1,
  attachPainter: function() {
    $('.tile').on('mouseenter', function() {
      const el = $(this);
      let tile;
      for (let i=0; i<ROW_COUNT; i++) {
        for (let j=0; j<COL_COUNT; j++) {
          if (map[i][j].domNode.is(el)) {
            tile = map[i][j];
          }
        }
      }
      const paintType = tileTypes[DEBUG.paintIndex];
      const _deferred = deferTransitions;
      deferTransitions = false;
      setTileType(tile, paintType);
      deferTransitions = _deferred;
    });
  },
  detachPainter: function() {
    $('.tile').off('mouseenter');
  },
  dumpMap: function() {
    const _map = map.map(function(row){ // ha-ha
      return row.map(function(tile) {
        return tileTypes.indexOf(tile.type);
      });
    });
    console.log(JSON.stringify(_map))
  }
};

// This var lists all the known tile types.
// It is used both as a type checking aid,
// as well as an index->type mapping for the level layouts,
// so its order is also important.
const tileTypes = ['grass', 'water', 'swamp', 'dam', 'highground', 'woods', 'stillwater', 'blank'];

// when true, tile transitions only update the internal state immediately,
// dom node transitions are deferred - to be updated manually in an animation
let deferTransitions = false;
// pendingTransitions has a collection for each diagonal to create a wave effect
const pendingTransitions = [];

function emptyPendingTransitionGroups() {
  // truncate to empty const array - hopefully this works everywhere...
  pendingTransitions.length = 0;
  for (let i=0; i<ROW_COUNT+COL_COUNT; i++) {
    pendingTransitions.push([]);
  }
}
emptyPendingTransitionGroups();

// TODO: forEachTileInMap util?
function updateTileCounters() {
  for (let ri = 0; ri < map.length; ri++) {
    const row = map[ri];
    for (let ci = 0; ci < row.length; ci++) {
      const cell = row[ci];
      console.assert(tileTypes.includes(cell.type));
      if (cell.type === 'dam' || cell.objectiveNode) {
        console.assert(!(cell.type === 'dam' && cell.objectiveNode));
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
        if (cell.type === 'dam') {
          cell.counterNode.text(cell.strength);
        } else {
          // it is redundant to display the timer here while we have the time resource
          // cell.counterNode.text(resources.time);
        }
      }
    }
  }
}

function updateResources() {
  workerCounter.text(resources.workers);
  woodCounter.text(resources.wood);
  timerCounter.text(resources.time);
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

function setTileType(tile, type) {
  // Changes the tile's internal type and its DOM node class to the given type.
  // Note that you have to manage other side-effects (such as setting flags) manually.
  console.assert(tileTypes.includes(type));
  if (tile.type === type) {
    console.assert(false, 'invalid transform: ' + type, tile);
    return;
  }
  tile.originalType = tile.type;
  tile.type = type;
  if (deferTransitions) {
    const diagonalIndex = tile.i + tile.j;
    pendingTransitions[diagonalIndex].push(tile);
  } else {
    tile.domNode.removeClass(tileTypes);
    tile.domNode.addClass(type);
  }
}

function showMessage(text, css, options) {
  const dialog = $('<div />').addClass('dialog').appendTo(container);
  if (css) {
    dialog.css(css);
  }
  dialog.text(text);
  if (options) {
    const extra = $('<div />').addClass('extra').text(options.continueMsg);
    extra.appendTo(dialog);
    dialog.on('click', options.onContinue);
  }
}

function floodTile(tile) {
  console.assert(tile.type !== 'water');

  if (tile.objectiveNode) {
    tile.objectiveNode.addClass('failed');
    sounds.gameOver.play();
    showMessage(
      'Game over!',
      {
        left: '40%'
      },
      {
        continueMsg: 'Click to retry level.',
        onContinue: function() {
          $('.dialog').remove();
          isGameOver = false;
          loadLevel(currentLevel);
        }
      }
    );
    isGameOver = true;
  }

  setTileType(tile, 'water');
  tile.updated = true;
}

function removeDam(tile) {
  delete tile.strength;
  tile.counterNode.remove();
  delete tile.counterNode;
  console.assert(tile.typeBeforeDam);
  setTileType(tile, tile.typeBeforeDam);
}

function countNeighboursOfType(tile, type) {
  console.assert(tileTypes.includes(type));
  const neighbours = getNeighbours(tile);
  let count = 0;
  neighbours.forEach(n => {
    if (n.type === type) {
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
      floodSwamp(tile);
    }
    // dams on highground never break (not too useful though)
    if (tile.type === 'dam' && tile.typeBeforeDam !== 'highground') {
      tile.strength -= 1;
      if (tile.strength <= countNeighboursOfType(tile, 'water')) {
        tile.counterNode.addClass('failing');
      }
      if (tile.strength === 0) {
        removeDam(tile);
      }
    }
    if (tile.type === 'stillwater') {
      let protected = false;
      // protected by any dam to the left
      if (tile.j > 0) {
        protected = (map[tile.i][tile.j-1].type === 'dam');
      }
      // OR any adjacent highground
      protected = protected || countNeighboursOfType(tile, 'highground') > 0;
      if (!protected) {
        floodTile(tile);
      }
    }
  }
}

function floodSwamp(tile) {
  // floods every cell in a contigous swamp region starting at tile
  console.assert(tile.type === 'swamp');
  console.assert(!tile.explored);
  const swamp = [tile];
  function hasUnexplored(swamp) {
    return swamp.some(function(tile) {
      return !tile.explored;
    });
  }
  // TODO: add failsafe iter count to while condition
  while(hasUnexplored(swamp)) {
    swamp.forEach(tile => {
      getNeighbours(tile).forEach(neighbour => {
        if (neighbour.type === 'swamp' && !swamp.includes(neighbour)) {
          swamp.push(neighbour);
        }
      });
      tile.explored = true;
    });
  }

  // flood and clear explored markers
  swamp.forEach(tile => {
    console.assert(tile.type === 'swamp', tile);
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

function removeWorker(tile) {
  delete tile.hasWorker;
  tile.workerNode.remove();
  delete tile.workerNode;
  resources.workers++;
  if (tile.type !== 'woods') {
    resources.wood++;
  }

  const workerKey = tile.i + '|' + tile.j;
  console.assert(workerKey in placedWorkers);
  delete placedWorkers[workerKey];
}

function placeWorker(tile) {
  const workerKey = tile.i + '|' + tile.j;
  console.assert(!(workerKey in placedWorkers));
  placedWorkers[workerKey] = true;

  resources.workers--;
  if (tile.type !== 'woods') {
    resources.wood--;
  }
  tile.hasWorker = true;
  tile.workerNode = $('<div />').addClass('placed-worker');
  tile.workerNode.css({
    width: TILE_SIZE,
    height: TILE_SIZE,
    top: tile.domNode.position().top,
    left: tile.domNode.position().left
  });
  tile.workerNode.appendTo(container);
}

function applyWorkerEffects() {
  return new Promise((resolve, reject) => {
    function processWorker(tile, queue) {
      if (tile.type === 'woods') {
        sounds.cutWood.play();
        resources.wood++;
      } else {
        sounds.buildDam.play();
        resources.wood--;
        tile.typeBeforeDam = tile.type;
        if (tile.type !== 'dam') {
          // NB: we allow repairing dams, and in this case the type is already set
          setTileType(tile, 'dam');
          // dams create stillwater to their right
          if (tile.j < ROW_COUNT) {
            const nextTile = map[tile.i][tile.j + 1]
            if (nextTile.type === 'water') {
              setTileType(nextTile, 'stillwater');
            }
          }
        }
        tile.strength = DAM_STRENGTH;
      }

      updateTileCounters();
      removeWorker(tile);
      updateResources();

      const duration = (tile.type === 'dam')? BUILD_DAM_ANIM_DURATION : CUT_WOOD_ANIM_DURATION;
      setTimeout(function() {
        if (queue.length > 0) {
          processWorker(queue.shift(), queue);
        } else {
          resolve();
        }
      }, duration);
    }

    const queue = [];
    for (const key in placedWorkers) {
      const coords = key.split('|');
      const tile = map[coords[0]][coords[1]];
      queue.push(tile);
    }

    if (queue.length === 0) {
      resolve();
      return;
    }

    processWorker(queue.shift(), queue);
  });
}

function endTurn() {
  console.log('ending turn...');

  endTurnButton.addClass('busy');
  applyWorkerEffects().then(function() {
    deferTransitions = true;
    updateMap();
    const pendingTransitionsDuration = animatePendingTransitions();
    resources.time--;
    updateTileCounters();
    updateResources();
    deferTransitions = false;

    // check win conditions
    setTimeout(function() {
      if (resources.time === 0) {
        sounds.success.play();
        if (levelData.length === currentLevel + 1) {
          showMessage(
            'Congratulations, you won! Check back later for more levels.',
            {
              width: '60%',
              left: '150px'
            }
          );
          isGameOver = true;
        } else {
          loadLevel(currentLevel + 1);
        }
      }
    }, pendingTransitionsDuration);
  });
}

function animatePendingTransitions() {
  let skippedGroups = 0;
  const stepDelay = FLOOD_ANIM_DURATION / 3;
  let timeUntilEnd = 0;
  for(const i in pendingTransitions) {
    const group = pendingTransitions[i];
    const waveDelay = (i-skippedGroups) * stepDelay;
    let groupHadDamCollapse = false;

    // keep track of empty groups so that they don't increase the delay
    if (group.length === 0) {
      skippedGroups++;
      continue;
    }

    for(const tile of group) {
      console.assert(tile.originalType, 'unmarked transformed tile', tile);
      // NB: tile object is already flooded, we need to extract the previous type
      let animType = 'flood-' + tile.originalType;
      if (tile.originalType === 'dam') {
        animType = 'flood-dam-' + tile.typeBeforeDam;
        groupHadDamCollapse = true;
      }
      setTimeout(function(){
        tile.domNode.addClass(animType);
      }, waveDelay);
      timeUntilEnd = waveDelay + FLOOD_ANIM_DURATION
      setTimeout(function(){
        delete tile.originalType;
        tile.domNode.removeClass(tileTypes);
        tile.domNode.addClass(tile.type);
        tile.domNode.removeClass(animType);
      }, timeUntilEnd);
    }
    // this is the same delay as inside the loop, but we only want to play sounds once per group
    setTimeout(function(){
      const sfx = groupHadDamCollapse? sounds.destroyDam : sounds.floodTile;
      sfx.currentTime = 0;
      sfx.play();
    }, waveDelay);
  }
  setTimeout(function() {
    emptyPendingTransitionGroups();
    endTurnButton.removeClass('busy');
  }, timeUntilEnd);
  return timeUntilEnd;
}

function processTileClick(tile) {
  // ======= DEBUG =======
  if (DEBUG.paintMode) {
    const paintType = tileTypes[DEBUG.paintIndex];
    const _deferred = deferTransitions;
    deferTransitions = false;
    setTileType(tile, paintType);
    deferTransitions = _deferred;
    return;
  }
  // ===== end DEBUG =====

  if (tile.hasWorker) {
    removeWorker(tile);
    sounds.removeWorker.play();
  } else {
    // refuse if out of bounds or game is over
    if (tile.type === 'blank' || isGameOver) {
      sounds.error.play();
      return;
    }
    // refuse if not enough workers
    if (resources.workers === 0) {
      workerCounter.addClass('error');
      sounds.error.play();
      // TODO: global timeout var to debounce
      setTimeout(function() {
        workerCounter.removeClass('error');
      }, 600);
      return;
    }
    // refuse if not enough wood
    if (tile.type !== 'woods' && resources.wood === 0) {
      woodCounter.addClass('error');
      sounds.error.play();
      // TODO: global timeout var to debounce
      setTimeout(function() {
        woodCounter.removeClass('error');
      }, 600);
      return;
    }
    // refuse building on objective tiles
    if (tile.objectiveNode) {
      sounds.error.play();
      return;
    }
    // otherwise we're good
    placeWorker(tile);
    sounds.placeWorker.play();
  }

  updateResources();
}

function loadLevel(index) {
  // clean up any previous state and DOM
  map.length = 0;
  $('.tile').remove();
  $('.objective-marker').remove();
  $('.round-counter').remove();

  currentLevel = index;

  // generate map of tiles from level layout
  let _warnedAboutMapSize = false;
  let dX = 0;
  let dY = 0;
  if (levelData[currentLevel].offsets) {
    dX = levelData[currentLevel].offsets.x;
    dY = levelData[currentLevel].offsets.y;
  }

  // initiate an empty map
  for (let i=0; i<ROW_COUNT; i++) {
    const row = [];
    for (let j=0; j<COL_COUNT; j++) {
      row.push({
        i: i,
        j: j,
        type: 'blank'
      });
    }
    map.push(row);
  }

  // overide cells according to level data
  for (let i=0; i<ROW_COUNT; i++) {
    for (let j=0; j<COL_COUNT; j++) {
      let tileCode;
      if (levelData[currentLevel].map[i] && j < levelData[currentLevel].map[i].length) {
        tileCode = levelData[currentLevel].map[i][j];
      } else {
        if (!_warnedAboutMapSize && !levelData[currentLevel].offsets) {
          console.warn('Level map size does not match ROW and COL_COUNT', ROW_COUNT, COL_COUNT);
          _warnedAboutMapSize = true;
        }
        tileCode = 7; // 'blank'
      }
      const tile = {
        i: i,
        j: j,
        type: tileTypes[tileCode]
      };
      if (tile.type === 'dam') {
        tile.typeBeforeDam = 'grass';
        tile.strength = DAM_STRENGTH;
      }
      if (i < levelData[currentLevel].map.length && j < levelData[currentLevel].map[i].length) {
        // if we're within the specified partial map, apply offsets
        map[i+dY][j+dX] = tile;
      } else {
        // otherwise don't bother updating the default map
      }
    }
  }

  // generate DOM according to map
  for (let ri = 0; ri < map.length; ri++) {
    const row = map[ri];
    const rowDiv = $('<div />').addClass('row');
    for (let ci = 0; ci < row.length; ci++) {
      const cell = row[ci];
      console.assert(tileTypes.includes(cell.type));
      const cellDiv = $('<div />').addClass('tile').addClass(cell.type);
      cellDiv.css({
        width: TILE_SIZE,
        height: TILE_SIZE,
        // we can't just use cover or contain because of the hover border effect
        'background-size': TILE_SIZE + 'px'
      });
      cellDiv.on('click', () => {
        processTileClick(cell);
      });
      // we add a reference to the dom node
      cell.domNode = cellDiv;
      cellDiv.appendTo(rowDiv);
    }
    rowDiv.appendTo(container);
  }

  // generate objective markers
  for (const objective of levelData[currentLevel].objectives) {
    const objectiveTile = map[objective.y + dY][objective.x + dX];
    console.assert(objectiveTile.type !== 'water', 'Invalid objective');
    const objectiveNode = $('<div />').addClass('objective-marker');
    objectiveNode.css({
      width: TILE_SIZE,
      height: TILE_SIZE,
      top: objectiveTile.domNode.position().top,
      left: objectiveTile.domNode.position().left
    });
    objectiveNode.appendTo(container);
    objectiveTile.objectiveNode = objectiveNode;
  }

  // adjust layout according to the rendered map
  const blWidth = parseInt(endTurnButton.css('borderLeftWidth'), 10);
  const brWidth = parseInt(endTurnButton.css('borderRightWidth'), 10);
  const dB = blWidth + brWidth + 32; // 32 left-padding
  endTurnButton.css({
    left: container.outerWidth(true) - endTurnButton.outerWidth(true) - dB
  });

  $('#icons-container').css({
    width: container.outerWidth(true) - 432 - 64 // end turn and fullscr buttons
  });

  // apply level-specific resources
  resources.workers = levelData[currentLevel].resources.workers;
  resources.wood = levelData[currentLevel].resources.wood;
  resources.time = levelData[currentLevel].resources.time;

  updateTileCounters();
  updateResources();
}

$(document).ready(function() {
  // init audio assets
  sounds.floodTile = new Audio('assets/flood_tile.mp3');
  sounds.buildDam = new Audio('assets/build_dam.mp3');
  sounds.destroyDam = new Audio('assets/destroy_dam.mp3');
  sounds.cutWood = new Audio('assets/cut_wood.mp3');
  sounds.placeWorker = new Audio('assets/place_worker.mp3');
  sounds.removeWorker = new Audio('assets/remove_worker.mp3');
  sounds.success = new Audio('assets/new_level.mp3');
  sounds.gameOver = new Audio('assets/game_over.mp3');
  sounds.error = new Audio('assets/error.mp3');

  container = $('#map-container');
  endTurnButton = $('#end-turn-button');

  workerCounter = $('#icons-container .section.workers .counter');
  woodCounter = $('#icons-container .section.wood .counter');
  timerCounter = $('#icons-container .section.timer .counter');

  loadLevel(currentLevel);

  const fullScrToggle = $('#fullscreen-toggle');
  fullScrToggle.on('click', function() {
    isFullscreen = !isFullscreen;
    console.log('Toggling fullscreen ', isFullscreen);
    fullScrToggle.toggleClass('on', isFullscreen);
    fullScrToggle.toggleClass('off', !isFullscreen);

    if (isFullscreen) {
      const vw = $(window).width();
      const vh = $(window).height();
      const containerMargin = 32;
      const toolbarHeight = 106;
      const mapWidth = TILE_SIZE * COL_COUNT + 2 * containerMargin;
      const mapHeight = TILE_SIZE * ROW_COUNT + 2 * containerMargin + toolbarHeight;

      const widthRatio = vw / mapWidth;
      const heightRatio = vh / mapHeight;
      const scale = Math.min(widthRatio, heightRatio);
      $('body').css({
        transform: 'scale(' + scale + ')',
        overflow: 'hidden' // scrollbars mess with the calculation, and we mean to be fullscr anyway
      });
    } else {
      $('body').css({
        transform: 'none',
        overflow: 'auto'
      });
    }
  });

  endTurnButton.on('click', () => {
    if (endTurnButton.hasClass('busy') || isGameOver) {
      return;
    }
    endTurn();
  });
});
