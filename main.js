
const TILE_SIZE = 32 + 2; // map tile size in px + border
const COL_COUNT = 32;
const ROW_COUNT = 16;
const DAM_STRENGTH = 4;
const FLOOD_ANIM_DURATION = 1300; // should match CSS animation durations
const BUILD_DAM_ANIM_DURATION = 1100;
const CUT_WOOD_ANIM_DURATION = 500;

let isFullscreen = false;
let isGameOver = false;
let currentScale = 1.0;
let currentTutorialDialog;
let tutorialProgress = 0;
let showTutorial = true;

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

let currentLevel = 0;
const levelData = [
  {
    map: [
      [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
      [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
      [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
      [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
      [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
      [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,4,4,4,4,4,1,7,7],
      [7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,0,0,0,4,4,0,4,4,1,1,1,1,1,1,4,7],
      [7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,4,4,4,4,4,4,4,1,3,6,1,1,4,4,4,7,7],
      [7,7,7,7,7,7,7,7,7,7,7,7,0,0,4,1,1,1,1,4,1,1,1,4,1,1,4,4,0,0,7,7],
      [7,7,7,7,7,7,7,7,7,7,7,0,0,4,1,1,4,4,1,1,1,4,4,4,4,4,0,0,7,7,7,7],
      [7,7,7,7,7,7,7,7,7,7,0,0,4,1,1,4,0,0,4,1,4,4,4,4,4,4,7,7,7,7,7,7],
      [7,7,7,7,7,7,7,7,7,7,4,4,1,1,4,0,0,0,4,1,1,1,4,4,4,4,4,4,7,7,7,7],
      [7,7,7,7,7,7,7,7,7,4,1,1,1,4,0,0,0,0,0,4,4,1,1,1,4,0,0,0,4,7,7,7],
      [7,7,7,7,7,7,7,7,4,1,1,4,4,0,0,7,7,7,0,0,0,4,4,1,0,0,4,0,4,4,7,7],
      [7,7,7,7,7,7,7,7,7,1,4,7,7,7,7,7,7,7,7,7,0,0,0,4,4,4,4,0,0,0,7,7],
      [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,4,4,0,0,7]
    ],
    objectives: [
      //{ x: 24, y: 7}
    ],
    resources: {
      workers: 1,
      wood: 10,
      time: 7
    },
    tutorialMessages: [
      {
        header: 'Every turn, the river flows to open areas.',
        body: (
          'If nothing stands in its way, a river will eventually cover everything. ' +
          'This one has damaged our dam to the north, and it keeps flowing into the canyon to the south. ' +
          'Click on the dam to add a worker to repair it.'
        )
      }, {
        header: 'As you know, every river flows left to right.',
        body: (
          'Our dam has created a pond of still water to its right. ' +
          'A family of fish just had their first children spawn there. 800 kids! ' +
          'I\'ll add an objective marker there. Make sure the dam stays up until they can make it out safe.'
        ),
        effect: function() {
          endTurnButton.addClass('busy');
          setTimeout(function() {
            endTurnButton.removeClass('busy');
            const tile = map[7][24];
            addObjectiveToTile(tile);
          }, 8000);
        }
      }
    ]
  },
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
      [5,5,5,5,0,7,4,4,7,7,7,4,4,4,4,4,1,1,1,3,1,0,0,0,0,0,0,0,0,0,0,0],
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
    },
    tutorialMessages: [
      {
        header: 'Sometimes, a river is too wide to tame.',
        body: (
          'Did you just see our dam wash away? It was surrounded by water on all sides. ' +
          'Our best bet is to dam the grass on the right before the water gets there. ' +
          'A family of rabbits is burrowing there.'
        )
      }, {
        header: 'Building dams costs wood.',
        body: (
          'Sometimes our field teams have to improvize and fell trees for lumber. ' +
          'Did you see that delicious looking forest to the left?'
        )
      }
    ]
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
    },
    tutorialMessages: [
      {
        header: 'Watch out for those swamplands to the north!',
        body: (
          'When water flows into a swamp tile, it will fill the entire swamp in the same turn. ' +
          'This is typically in conflict with our corporate interests.'
        )
      }
    ]
  },
  {
    map: [
      [5,0,4,1,1,0,0,0,0,5,0,0,0,0,0,0,5,5,4,5,5,5,5,5,5,5,5,5,5,5,4,5],
      [5,0,4,4,1,1,1,0,0,0,4,0,0,0,0,0,5,5,4,4,5,5,4,4,4,4,4,4,5,5,5,5],
      [5,0,0,0,4,4,1,1,1,0,0,0,0,0,0,4,0,5,5,5,5,4,4,4,4,0,0,4,4,5,2,5],
      [5,5,5,0,0,4,1,1,1,1,0,0,0,0,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0,0,2,5],
      [4,5,5,2,0,2,1,1,2,1,1,1,1,1,0,0,0,0,4,4,4,4,2,1,0,0,4,0,0,0,0,5],
      [5,5,5,2,0,4,1,2,4,4,0,4,4,1,1,1,1,0,4,2,4,4,1,1,0,0,0,0,0,0,0,5],
      [0,2,2,0,0,4,1,4,0,0,0,0,0,4,4,4,1,1,1,1,1,1,1,0,0,0,0,0,4,0,2,5],
      [0,2,0,0,0,4,1,4,0,0,0,0,4,4,4,4,1,0,0,0,4,1,1,0,0,0,0,0,0,4,0,5],
      [2,0,0,4,0,4,1,1,4,2,0,0,4,4,4,1,1,0,0,0,4,4,1,1,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,4,1,1,4,0,0,0,4,4,1,2,4,0,0,4,4,1,1,1,1,0,0,2,0,0,0],
      [5,5,0,0,0,0,0,4,1,2,0,0,0,4,1,1,0,0,0,0,0,4,1,4,4,1,1,1,0,2,0,4],
      [5,5,5,5,0,0,0,0,1,0,0,0,0,0,1,0,0,0,4,0,0,4,1,4,0,4,4,1,1,0,4,4],
      [5,5,5,5,5,0,0,0,0,0,0,0,0,0,1,0,0,0,0,4,4,4,1,4,4,0,4,4,1,2,4,4],
      [5,5,5,5,5,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,4,1,1,4,0,0,4,1,1,1,4],
      [5,5,4,5,5,5,0,0,0,0,0,0,0,1,2,0,0,4,0,0,0,0,0,1,4,0,0,0,4,5,1,1],
      [5,5,5,4,5,5,5,5,5,0,0,0,0,1,2,0,0,0,0,4,4,4,0,1,4,5,5,5,5,5,5,1]
    ],
    objectives: [
      {x: 1, y: 1},
      {x: 12, y: 9},
      {x: 28, y: 4}
    ],
    resources: {
      workers: 2,
      wood: 10,
      time: 10
    },
    tutorialMessages: [
      {
        header: 'Our resources are limited, but we trust our workers to adapt.',
        body: (
          'If you find yourself short on workers, you can always send two of them to the same tile. ' +
          'They will then ... erm, recruit a new member for the operation.'
        ),
        effect: function() {
          showTutorial = false;
          setTimeout(function() {
            removeTutorialMessage();
          }, 20000);
        }
      }
    ]
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

function noop() {
  return;
}

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

function addObjectiveToTile(objectiveTile) {
  console.assert(objectiveTile.type !== 'water', 'Invalid objective');
  const objectiveNode = $('<div />').addClass('objective-marker');
  objectiveNode.css({
    width: TILE_SIZE,
    height: TILE_SIZE,
    top: objectiveTile.domNode.position().top / currentScale,
    left: objectiveTile.domNode.position().left / currentScale
  });
  objectiveNode.appendTo(container);
  objectiveTile.objectiveNode = objectiveNode;
}

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
            top: cell.domNode.position().top / currentScale,
            left: cell.domNode.position().left / currentScale,
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
          noop();
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

function showTutorialMessage(msg, msg2) {
  if (!showTutorial) {
    return;
  }
  const dialog = $('<div />').addClass('tutorial-dialog').appendTo(container);
  $('<div />').addClass('message').text(msg).appendTo(dialog);
  $('<div />').addClass('message').text(msg2).appendTo(dialog);
  $('<div />').addClass('icon').appendTo(dialog);
  currentTutorialDialog = dialog;
  sounds.newMessage.play();

  dialog.on('click', function() {
    dialog.remove();
  });
}

function removeTutorialMessage() {
  if (currentTutorialDialog) {
    currentTutorialDialog.remove();
    currentTutorialDialog = undefined;
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
        left: '30%'
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

  const workerKey = tile.i + '|' + tile.j;
  console.assert(workerKey in placedWorkers);
  //workers are removed during processing, in which case the count is 1
  //console.assert(placedWorkers[workerKey] === 2);

  resources.workers += placedWorkers[workerKey];
  if (placedWorkers[workerKey] === 1 && tile.type !== 'woods') {
    // if there's only 1 worker, we need to refund the wood
    resources.wood++;
  } else {
    // for 2 workers, the resource was already refunded when the 2nd worker was placed
    noop();
  }

  delete placedWorkers[workerKey];
}

function placeWorker(tile) {
  const workerKey = tile.i + '|' + tile.j;
  let workerCount = 1;
  resources.workers--;
  if (workerKey in placedWorkers) {
    console.assert(placedWorkers[workerKey] === 1);
    workerCount = 2;
    // we add a second worker
    if (tile.type !== 'woods') {
      // we return the wood the first worker was supposed to use
      resources.wood++;
    }
    console.assert(tile.workerNode);
    tile.workerNode.addClass('double');
  } else {
    // we add a single worker
    if (tile.type !== 'woods') {
      resources.wood--;
    }
    tile.hasWorker = true;
    tile.workerNode = $('<div />').addClass('placed-worker');
    tile.workerNode.css({
      width: TILE_SIZE,
      height: TILE_SIZE,
      top: tile.domNode.position().top / currentScale,
      left: tile.domNode.position().left / currentScale
    });
    tile.workerNode.appendTo(container);
  };

  placedWorkers[workerKey] = workerCount;
}

function applyWorkerEffects() {
  return new Promise((resolve, reject) => {
    function processWorker(tile, queue) {
      const workerKey = tile.i + '|' + tile.j;
      if (placedWorkers[workerKey] === 2) {
        sounds.newWorker.play();
        resources.workers++;
      } else if (tile.type === 'woods') {
        sounds.cutWood.play();
        resources.wood++;
      } else {
        sounds.buildDam.play();
        resources.wood--;
        if (tile.type === 'dam') {
          // when rebuilding dams, we preserve the original original type
          noop();
        } else {
          tile.typeBeforeDam = tile.type;
        }
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
  // clear tutorial messages
  removeTutorialMessage();

  // show tutorial message if applicable
  if (levelData[currentLevel].tutorialMessages && levelData[currentLevel].tutorialMessages.length > tutorialProgress) {
    const msg = levelData[currentLevel].tutorialMessages[tutorialProgress];
    setTimeout(function() {
      showTutorialMessage(msg.header, msg.body);
      if (msg.effect) {
        msg.effect();
      }
      tutorialProgress++;
    }, 2000);
  }

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
      if (resources.time === 0 && !isGameOver) {
        sounds.success.play();
        if (levelData.length === currentLevel + 1) {
          showMessage(
            'Congratulations, you won! Check back later for more levels.',
            {
              width: '60%',
              left: '150px'
            },
            {
              continueMsg: 'Click to attempt a randomized scenario which might or might not be winnable.',
              onContinue: function() {
                $('.dialog').remove();
                isGameOver = false;
                loadLevel(currentLevel, true);
              }
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
    const workerKey = tile.i + '|' + tile.j;
    const workerCount = placedWorkers[workerKey];

    if (workerCount === 2) {
      removeWorker(tile);
      sounds.removeWorker.play();
    } else {
      if (resources.workers === 0) {
        removeWorker(tile);
        sounds.removeWorker.play();
      } else {
        // TODO: move these checks into placeWorker to remove duplication
        if (isGameOver) {
          workerCounter.addClass('error');
          sounds.error.play();
          // TODO: global timeout var to debounce
          setTimeout(function() {
            workerCounter.removeClass('error');
          }, 600);
          return;
        }

        placeWorker(tile);
        sounds.placeWorker.play();
      }
    }
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

function loadLevel(index, randomized) {
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
  if (randomized) {
    console.log('generating randomized level...');
    for (let i=0; i<ROW_COUNT; i++) {
      for (let j=0; j<COL_COUNT; j++) {
        const roll = Math.random();
        let randomType;
        if (roll < 0.02) {
          randomType = 'water';
        } else if (roll < 0.12) {
          randomType = 'woods';
        } else if (roll < 0.22) {
          randomType = 'swamp';
          if (i>0) {
            map[i-1][j].type = 'swamp';
          }
          if (j>0) {
            map[i][j-1].type = 'swamp';
          }
        } else if (roll < 0.42) {
          randomType = 'highground';
        } else {
          randomType = 'grass';
        }
        const tile = {
          i: i,
          j: j,
          type: randomType
        };
        map[i][j] = tile;
      }
    }
    // add a random diagonal river
    const diagonalSum = Math.floor(Math.random() * (COL_COUNT+ROW_COUNT));
    for (let i=0; i<ROW_COUNT; i++) {
      for (let j=0; j<COL_COUNT; j++) {
        if (i+j === diagonalSum || i+j === diagonalSum+1) {
          map[i][j].type = 'water';
        }
      }
    }
  } else {
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
          tile.typeBeforeDam = 'water';
          tile.strength = DAM_STRENGTH;
        }
        if (i < levelData[currentLevel].map.length && j < levelData[currentLevel].map[i].length) {
          // if we're within the specified partial map, apply offsets
          map[i+dY][j+dX] = tile;
        } else {
          // otherwise don't bother updating the default map
          noop();
        }
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
        'background-size': TILE_SIZE - 2 + 'px' // should not include border
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
  if (randomized) {
    const objectiveCount = Math.floor(Math.random() * 4) + 2;
    for (let i=0;i<objectiveCount;i++) {
      const rx = Math.floor(Math.random() * COL_COUNT);
      const ry = Math.floor(Math.random() * ROW_COUNT);
      const objectiveTile = map[ry][rx];
      if (objectiveTile.type !== 'grass') {
        setTileType(objectiveTile, 'grass');
      }
      const objectiveNode = $('<div />').addClass('objective-marker');
      objectiveNode.css({
        width: TILE_SIZE,
        height: TILE_SIZE,
        top: objectiveTile.domNode.position().top / currentScale,
        left: objectiveTile.domNode.position().left / currentScale
      });
      objectiveNode.appendTo(container);
      objectiveTile.objectiveNode = objectiveNode;
    }
  } else {
    for (const objective of levelData[currentLevel].objectives) {
      const objectiveTile = map[objective.y + dY][objective.x + dX];
      addObjectiveToTile(objectiveTile);
    }
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
  if (randomized) {
    resources.workers = Math.floor(Math.random()*5) + 3;
    resources.wood = Math.floor(Math.random()*8) + 5;
    resources.time = Math.floor(Math.random()*3) + 8;
  } else {
    resources.workers = levelData[currentLevel].resources.workers;
    resources.wood = levelData[currentLevel].resources.wood;
    resources.time = levelData[currentLevel].resources.time;
  }

  updateTileCounters();
  updateResources();
  tutorialProgress = 0;

  // show tutorial message
  if (currentLevel === 0) {
    showTutorialMessage(
      'Welcome to Beavers Incorporated!',
      'We mostly build beaver dams. ' +
      'We also do leveraged buyouts and nuclear waste disposal, but that\'s above your pay grade for now. ' +
      'Go ahead and press that End turn button below.'
    );
  }
}

function showPlayButton() {
  // if we want to play music on the splashscreen, we need the user to interact with the site first
  const playButton = $('<div />').addClass('play-button').text('click to start').appendTo($('body'));
  playButton.on('click', function() {
    playButton.remove();
    sounds.song1.play();
    showSplashScreen();
  });
}

function showSplashScreen() {
  const splash = $('<div />').addClass('splash-screen').appendTo($('body'));

  // title
  $('<div />').addClass('header1').text('Beavers').appendTo(splash);
  $('<div />').addClass('header2').text('Inc.').appendTo(splash);

  // beavers on sides
  $('<div />').addClass('logo-left').appendTo(splash);
  $('<div />').addClass('logo-right').appendTo(splash);

  // flashing msg
  const flasher = $('<div />').addClass('start-message').text('PUSH START BUTTON').appendTo(splash);

  // footer
  $('<div />').addClass('footer1').text('© MMXXII DITAM').appendTo(splash);
  $('<div />').addClass('footer2').text('LUDUM DARE L').appendTo(splash);

  let _i = 0;
  const _interval = setInterval(function() {
    flasher.css('opacity', _i%2? 0 : 1);
    _i++;
  }, 1000);

  splash.on('click', function() {
    loadLevel(currentLevel);
    clearInterval(_interval);
    splash.remove();
  });
}

$(document).ready(function() {
  // init audio assets
  sounds.floodTile = new Audio('assets/flood_tile.mp3');
  sounds.buildDam = new Audio('assets/build_dam.mp3');
  sounds.destroyDam = new Audio('assets/destroy_dam.mp3');
  sounds.cutWood = new Audio('assets/cut_wood.mp3');
  sounds.placeWorker = new Audio('assets/place_worker.mp3');
  sounds.removeWorker = new Audio('assets/remove_worker.mp3');
  sounds.newWorker = new Audio('assets/new_worker.mp3');
  sounds.success = new Audio('assets/new_level.mp3');
  sounds.gameOver = new Audio('assets/game_over.mp3');
  sounds.error = new Audio('assets/error.mp3');
  sounds.newMessage = new Audio('assets/new_message.mp3');

  sounds.song1 = new Audio('assets/song1.mp3');
  sounds.song1.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
  }, false);

  container = $('#map-container');
  endTurnButton = $('#end-turn-button');

  workerCounter = $('#icons-container .section.workers .counter');
  woodCounter = $('#icons-container .section.wood .counter');
  timerCounter = $('#icons-container .section.timer .counter');

  showPlayButton();

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
      currentScale = scale;
      $('body').css({
        transform: 'scale(' + scale + ')',
        overflow: 'hidden' // scrollbars mess with the calculation, and we mean to be fullscr anyway
      });
    } else {
      currentScale = 1.0;
      $('body').css({
        transform: 'none',
        overflow: 'auto'
      });
    }
  });

  $('body').on('keypress', function(e) {
    if (e.key === 'r') {
      // load random level
      loadLevel(3, true);
    }
  });

  endTurnButton.on('click', () => {
    if (endTurnButton.hasClass('busy') || isGameOver) {
      return;
    }
    endTurn();
  });
});
