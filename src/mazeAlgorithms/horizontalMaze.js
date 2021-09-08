let walls;
export function horizontalMaze(grid, startNode, finishNode) {
  if (!startNode || !finishNode || startNode === finishNode) {
    return false;
  }
  let vertical = range(grid[0].length);
  let horizontal = range(grid.length);
  walls = [];
  getHorizontalWalls(vertical, horizontal, startNode, finishNode);
  return walls;
}

function range(len) {
  let result = [];
  for (let i = 0; i < len; i++) {
    result.push(i);
  }
  return result;
}

function getHorizontalWalls(vertical, horizontal, startNode, finishNode) {
  if (horizontal.length < 2) {
    return;
  }

  let choice = Math.floor(Math.random() * 2);
  for (let num of horizontal) {
    if (choice === 0 && num % 2 !== 0) {
      addWall(num, vertical, startNode, finishNode);
    }
    if (choice === 1 && num % 2 === 0) {
      addWall(num, vertical, startNode, finishNode);
    }
  }
}

function addWall(num, vertical, startNode, finishNode) {
  let isStartFinish = false;
  let tempWalls = [];
  for (let temp of vertical) {
    if (
      (num === startNode.row && temp === startNode.col) ||
      (num === finishNode.row && temp === finishNode.col)
    ) {
      isStartFinish = true;
      continue;
    }
    tempWalls.push([num, temp]);
  }
  if (!isStartFinish) {
    tempWalls.splice(Math.floor(Math.random() * tempWalls.length), 1);
    for (let i = 0; i < Math.abs(num - startNode.row) / 2; i++) {
      if (Math.random() > 0.5)
        tempWalls.splice(Math.floor(Math.random() * tempWalls.length), 1);
    }
  }
  if (num === finishNode.row) {
    tempWalls.push([num - 1, (startNode.col + finishNode.col) / 2]); // add an obstacle near finishNode
    tempWalls.splice(tempWalls.length - finishNode.col, 1); // remove a wall at the finishNode.row
    tempWalls.push([num + 1, (finishNode.col - startNode.col)]); // add an obstacle near finishNode
  }
  for (let wall of tempWalls) {
    walls.push(wall);
  }
}
