import React, { Component } from "react";
import "./pathfindingVisualizer.css";
import Node from "./Node/node";
import NavBar from "./navbar";

//Pathfinding Algorithms
import {
  dijkstra,
  getNodesInShortestPathOrderDijkstra,
} from "../pathfindingAlgorithms/dijkstra";
import {
  astar,
  getNodesInShortestPathOrderAstar,
} from "../pathfindingAlgorithms/astar";
import {
  breadthFirstSearch,
  getNodesInShortestPathOrderBFS,
} from "../pathfindingAlgorithms/breadthFirstSearch";
import {
  depthFirstSearch,
  getNodesInShortestPathOrderDFS,
} from "../pathfindingAlgorithms/depthFirstSearch";
import { randomWalk } from "../pathfindingAlgorithms/randomWalk";
import {
  greedyBFS,
  getNodesInShortestPathOrderGreedyBFS,
} from "../pathfindingAlgorithms/greedyBestFirstSearch";
import {
  bidirectionalGreedySearch,
  getNodesInShortestPathOrderBidirectionalGreedySearch,
} from "../pathfindingAlgorithms/bidirectionalGreedySearch";

//Maze Algorithms
import { randomMaze } from "../mazeAlgorithms/randomMaze";
import { recursiveDivisionMaze } from "../mazeAlgorithms/recursiveDivision";
import { verticalMaze } from "../mazeAlgorithms/verticalMaze";
import { horizontalMaze } from "../mazeAlgorithms/horizontalMaze";
// Based on window's width to set the initial grid precisely
const initialNum = getInitialNum(window.innerWidth, window.innerHeight);
const initialNumRows = initialNum[0];
const initialNumColumns = initialNum[1];

const startFinishNode = getStartFinishNode(initialNumRows, initialNumColumns);
let startNodeRow = startFinishNode[0];
let startNodeCol = startFinishNode[1];
let finishNodeRow = startFinishNode[2];
let finishNodeCol = startFinishNode[3];

class PathfindingVisualizer extends Component {
  state = {
    grid: [],
    mouseIsPressed: false,
    movingStartorFinish: [false, ""],
    visualizingAlgorithm: false,
    generatingMaze: false,
    width: window.innerWidth,
    height: window.innerHeight,
    numRows: initialNumRows,
    numColumns: initialNumColumns,
    speed: 10,
    mazeSpeed: 5,
  };

  updateDimensions = () => {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  updateSpeed = (path, maze) => {
    this.setState({ speed: path, mazeSpeed: maze });
  };

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
    const grid = getInitialGrid(this.state.numRows, this.state.numColumns);
    this.setState({ grid });
  }

  handleMouseDown(row, col) {
    let isStartorFinish = (row === startNodeRow && col === startNodeCol) || (row === finishNodeRow && col === finishNodeCol);
    if ((row === startNodeRow && col === startNodeCol)) {
      this.setState({ mouseIsPressed: true, movingStartorFinish: [true, "Start"] });
    } else if ((row === finishNodeRow && col === finishNodeCol)) {
      this.setState({ mouseIsPressed: true, movingStartorFinish: [true, "Finish"] });
    } else if (!isStartorFinish) {
      const newGrid = getNewGridWithWalls(this.state.grid, row, col);
      this.setState({ grid: newGrid, mouseIsPressed: true });
    }
    
  }

  handleMouseEnter(row, col) {
    if (this.state.movingStartorFinish[0]) {
      const newGrid = getNewGridWithNewStartorFinish(this.state.grid, row, col, this.state.movingStartorFinish);
      this.setState({ grid: newGrid, mouseIsPressed: true });
    }
    if (this.state.mouseIsPressed && !this.state.movingStartorFinish[0]) {
      const newGrid = getNewGridWithWalls(this.state.grid, row, col);
      this.setState({ grid: newGrid, mouseIsPressed: true });
    }
  }

  handleMouseUp() {
    this.setState({ mouseIsPressed: false, movingStartorFinish: [false, ""] });
  }

  clearGrid() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    for (let row = 0; row < this.state.grid.length; row++) {
      for (let col = 0; col < this.state.grid[0].length; col++) {
        if (
          !(
            (row === startNodeRow && col === startNodeCol) ||
            (row === finishNodeRow && col === finishNodeCol)
          )
        ) {
          document.getElementById(`node-${row}-${col}`).className = "node";
        }
      }
    }
    const newGrid = getInitialGrid(this.state.numRows, this.state.numColumns);
    this.setState({
      grid: newGrid,
      visualizingAlgorithm: false,
      generatingMaze: false,
    });
  }

  clearPath() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    for (let row = 0; row < this.state.grid.length; row++) {
      for (let col = 0; col < this.state.grid[0].length; col++) {
        if (
          document.getElementById(`node-${row}-${col}`).className ===
          "node node-shortest-path" || document.getElementById(`node-${row}-${col}`).className ===
          "node node-shortest-path-hover"
        ) {
          document.getElementById(`node-${row}-${col}`).className = "node";
        }
      }
    }
    const newGrid = getGridWithoutPath(this.state.grid);
    this.setState({
      grid: newGrid,
      visualizingAlgorithm: false,
      generatingMaze: false,
    });
  }

  animateShortestPath = (nodesInShortestPathOrder, visitedNodesInOrder) => {
    if (nodesInShortestPathOrder.length === 1)
      this.setState({ visualizingAlgorithm: false });
    for (let i = 1; i < nodesInShortestPathOrder.length; i++) {
      if (i === nodesInShortestPathOrder.length - 1) {
        setTimeout(() => {
          let newGrid = updateNodesForRender(
            this.state.grid,
            nodesInShortestPathOrder,
            visitedNodesInOrder
          );
          this.setState({ grid: newGrid, visualizingAlgorithm: false });
        }, i * (3 * this.state.speed));
        for (let j = 1; j < nodesInShortestPathOrder.length - 1; j++) {
          setTimeout(() => {
            let node = nodesInShortestPathOrder[j];
            document.getElementById(`node-${node.row}-${node.col}`).className =
              "node node-shortest-path-hover";
            for (let k = 1; k < 5; k++) {
              if (j < 2 || j - k < 1) continue;
              let previousNode = nodesInShortestPathOrder[j - k];
              document.getElementById(`node-${previousNode.row}-${previousNode.col}`).className =
                "node node-shortest-path";
            }
            if (j === nodesInShortestPathOrder.length - 2)
              document.getElementById(`node-${node.row}-${node.col}`).className =
                "node node-shortest-path";
          }, (nodesInShortestPathOrder.length + j*3) * (3 * this.state.speed));
        }
        return;
      }
      let node = nodesInShortestPathOrder[i];
      setTimeout(() => {
        //shortest path node
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-shortest-path";
      }, i * (3 * this.state.speed));
    }
  }

  animateAlgorithm = (visitedNodesInOrder, nodesInShortestPathOrder) => {
    let newGrid = this.state.grid.slice();
    for (let row of newGrid) {
      for (let node of row) {
        let newNode = {
          ...node,
          isVisited: false,
        };
        newGrid[node.row][node.col] = newNode;
      }
    }
    this.setState({ grid: newGrid });
    for (let i = 1; i <= visitedNodesInOrder.length; i++) {
      let node = visitedNodesInOrder[i];
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(
            nodesInShortestPathOrder,
            visitedNodesInOrder
          );
        }, i * this.state.speed);
        return;
      }
      setTimeout(() => {
        //visited node
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-visited";
      }, i * this.state.speed);
    }
  }

  animateRandomWalk = (visitedNodesInOrder) => {
    let nodeCounts = new Map();
    for (let i = 1; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.setState({ visualizingAlgorithm: false });
        }, i * this.state.speed);
        return;
      }
      let node = visitedNodesInOrder[i];
      if (!nodeCounts.has(node)) nodeCounts.set(node, {val: 1});
      else nodeCounts.get(node).val++;
      if (i === visitedNodesInOrder.length - 1) {
        setTimeout(() => {
          //finish node
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-finish-reached";
        }, i * this.state.speed);
        continue;
      }

      setTimeout(() => {
        //visited node
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-visited";
        
        if (nodeCounts.get(node).val > 1) {
          // let visitedKeyframes = this.getkeyframes("visitedAnimation");
          document.getElementById(`node-${node.row}-${node.col}`).className = "node node-visited-2";
          // document.getElementById(`node-${node.row}-${node.col}`).style.backgroundColor = `rgb(${(200 + nodeCounts.get(node).val) % 255}, 0, 255, 0.75)`;
        }
      }, i * this.state.speed);
    }
  };

  getkeyframes(name) {
    let animation = {};
    let styleSheetList = document.styleSheets;
    for (let listIndex = 0; listIndex < styleSheetList.length; listIndex++) {
      const styleSheet = styleSheetList[listIndex];
      if (Object.keys(styleSheet.cssRules).length > 100) continue;
      for (let i = 0; i < Object.keys(styleSheet.cssRules).length; i++) {
        const item = styleSheet;
        if (item && item.cssRules[i].name && item.cssRules[i].name === name) {
          animation.cssRule = item.cssRules[i];
          animation.styleSheet = styleSheetList[listIndex];
          animation.index = i;
        }
      }
    }
    return animation;
  }

  animateBidirectionalAlgorithm(
    visitedNodesInOrderStart,
    visitedNodesInOrderFinish,
    nodesInShortestPathOrder,
    isShortedPath
  ) {
    let len = Math.max(
      visitedNodesInOrderStart.length,
      visitedNodesInOrderFinish.length
    );
    for (let i = 1; i <= len; i++) {
      let nodeA = visitedNodesInOrderStart[i];
      let nodeB = visitedNodesInOrderFinish[i];
      if (i === visitedNodesInOrderStart.length) {
        setTimeout(() => {
          let visitedNodesInOrder = getVisitedNodesInOrder(
            visitedNodesInOrderStart,
            visitedNodesInOrderFinish
          );
          if (isShortedPath) {
            this.animateShortestPath(
              nodesInShortestPathOrder,
              visitedNodesInOrder
            );
          } else {
            this.setState({ visualizingAlgorithm: false });
          }
        }, i * this.state.speed);
        return;
      }
      setTimeout(() => {
        //visited nodes
        if (nodeA !== undefined)
          document.getElementById(`node-${nodeA.row}-${nodeA.col}`).className =
            "node node-visited";
        if (nodeB !== undefined)
          document.getElementById(`node-${nodeB.row}-${nodeB.col}`).className =
            "node node-visited";
      }, i * this.state.speed);
    }
  }

  visualizeDijkstra() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ visualizingAlgorithm: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
      const nodesInShortestPathOrder = getNodesInShortestPathOrderDijkstra(
        finishNode
      );
      this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
    }, this.state.speed);
  }

  visualizeAStar() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ visualizingAlgorithm: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const visitedNodesInOrder = astar(grid, startNode, finishNode);
      const nodesInShortestPathOrder = getNodesInShortestPathOrderAstar(
        finishNode
      );
      this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
    }, this.state.speed);
  }

  visualizeBFS() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ visualizingAlgorithm: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const visitedNodesInOrder = breadthFirstSearch(
        grid,
        startNode,
        finishNode
      );
      const nodesInShortestPathOrder = getNodesInShortestPathOrderBFS(
        finishNode
      );
      this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
    }, this.state.speed);
  }

  visualizeDFS() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ visualizingAlgorithm: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const visitedNodesInOrder = depthFirstSearch(grid, startNode, finishNode);
      const nodesInShortestPathOrder = getNodesInShortestPathOrderDFS(
        finishNode
      );
      this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
    }, this.state.speed);
  }

  visualizeRandomWalk() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ visualizingAlgorithm: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const visitedNodesInOrder = randomWalk(grid, startNode, finishNode);
      this.animateRandomWalk(visitedNodesInOrder);
    }, this.state.speed);
  }

  visualizeGreedyBFS() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ visualizingAlgorithm: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const visitedNodesInOrder = greedyBFS(grid, startNode, finishNode);
      const nodesInShortestPathOrder = getNodesInShortestPathOrderGreedyBFS(
        finishNode
      );
      this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
    }, this.state.speed);
  }

  visualizeBidirectionalGreedySearch() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ visualizingAlgorithm: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const visitedNodesInOrder = bidirectionalGreedySearch(
        grid,
        startNode,
        finishNode
      );
      const visitedNodesInOrderStart = visitedNodesInOrder[0];
      const visitedNodesInOrderFinish = visitedNodesInOrder[1];
      const isShortedPath = visitedNodesInOrder[2];
      const nodesInShortestPathOrder = getNodesInShortestPathOrderBidirectionalGreedySearch(
        visitedNodesInOrderStart[visitedNodesInOrderStart.length - 1],
        visitedNodesInOrderFinish[visitedNodesInOrderFinish.length - 1]
      );
      this.animateBidirectionalAlgorithm(
        visitedNodesInOrderStart,
        visitedNodesInOrderFinish,
        nodesInShortestPathOrder,
        isShortedPath
      );
    }, this.state.speed);
  }

  animateMaze = (walls) => {
    for (let i = 0; i <= walls.length; i++) {
      if (i === walls.length) {
        setTimeout(() => {
          this.clearGrid();
          let newGrid = getNewGridWithMaze(this.state.grid, walls);
          this.setState({ grid: newGrid, generatingMaze: false });
        }, i * this.state.mazeSpeed);
        return;
      }
      let wall = walls[i];
      let node = this.state.grid[wall[0]][wall[1]];
      setTimeout(() => {
        //Walls
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-wall-animated";
      }, i * this.state.mazeSpeed);
    }
  }

  generateRandomMaze() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ generatingMaze: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const walls = randomMaze(grid, startNode, finishNode);
      this.animateMaze(walls);
    }, this.state.mazeSpeed);
  }

  generateRecursiveDivisionMaze() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ generatingMaze: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const walls = recursiveDivisionMaze(grid, startNode, finishNode);
      this.animateMaze(walls);
    }, this.state.mazeSpeed);
  }

  generateVerticalMaze() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ generatingMaze: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const walls = verticalMaze(grid, startNode, finishNode);
      this.animateMaze(walls);
    }, this.state.mazeSpeed);
  }

  generateHorizontalMaze() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ generatingMaze: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const walls = horizontalMaze(grid, startNode, finishNode);
      this.animateMaze(walls);
    }, this.state.mazeSpeed);
  }

  render() {
    let { grid } = this.state;
    return (
      <React.Fragment>
        <NavBar
          visualizingAlgorithm={this.state.visualizingAlgorithm}
          generatingMaze={this.state.generatingMaze}
          visualizeDijkstra={this.visualizeDijkstra.bind(this)}
          visualizeAStar={this.visualizeAStar.bind(this)}
          visualizeGreedyBFS={this.visualizeGreedyBFS.bind(this)}
          visualizeBidirectionalGreedySearch={this.visualizeBidirectionalGreedySearch.bind(
            this
          )}
          visualizeBFS={this.visualizeBFS.bind(this)}
          visualizeDFS={this.visualizeDFS.bind(this)}
          visualizeRandomWalk={this.visualizeRandomWalk.bind(this)}
          generateRandomMaze={this.generateRandomMaze.bind(this)}
          generateRecursiveDivisionMaze={this.generateRecursiveDivisionMaze.bind(
            this
          )}
          generateVerticalMaze={this.generateVerticalMaze.bind(this)}
          generateHorizontalMaze={this.generateHorizontalMaze.bind(this)}
          clearGrid={this.clearGrid.bind(this)}
          clearPath={this.clearPath.bind(this)}
          updateSpeed={this.updateSpeed.bind(this)}
        />
        <div
          className={
            this.state.visualizingAlgorithm || this.state.generatingMaze
              ? "grid-visualizing"
              : "grid"
          }
        >
          {grid.map((row, rowId) => {
            return (
              <div key={rowId}>
                {row.map((node, nodeId) => {
                  const {
                    row,
                    col,
                    isStart,
                    isFinish,
                    isVisited,
                    isShortest,
                    isWall,
                  } = node;
                  return (
                    <Node
                      key={nodeId}
                      row={row}
                      col={col}
                      isStart={isStart}
                      isFinish={isFinish}
                      isVisited={isVisited}
                      isShortest={isShortest}
                      isWall={isWall}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseEnter={(row, col) =>
                        this.handleMouseEnter(row, col)
                      }
                      onMouseUp={() => this.handleMouseUp()}
                      width={this.state.width}
                      height={this.state.height}
                      numRows={this.state.numRows}
                      numColumns={this.state.numColumns}
                    ></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
      </React.Fragment>
    );
  }
}

function getInitialNum(width, height) {
  let numColumns;
  if (width > 1500) {
    numColumns = Math.floor(width / 25);
  } else if (width > 1250) {
    numColumns = Math.floor(width / 22.5);
  } else if (width > 1000) {
    numColumns = Math.floor(width / 20);
  } else if (width > 750) {
    numColumns = Math.floor(width / 17.5);
  } else if (width > 500) {
    numColumns = Math.floor(width / 15);
  } else if (width > 250) {
    numColumns = Math.floor(width / 12.5);
  } else if (width > 0) {
    numColumns = Math.floor(width / 10);
  }
  let cellWidth = Math.floor(width / numColumns);
  let numRows = Math.floor(height / cellWidth);
  return [numRows, numColumns];
};
// return two array that contains [2,4,6,8,...] and [-2,-4,-6,-8...], and length is num/4 approx.
function getRandomNums(num) {
  let randomNums1 = [];
  let temp = 2;
  for (let i = 5; i < num / 2; i += 2) {
    randomNums1.push(temp);
    temp += 2;
  }
  let randomNums2 = [];
  temp = -2;
  for (let i = num / 2; i < num - 5; i += 2) {
    randomNums2.push(temp);
    temp -= 2;
  }
  return [randomNums1, randomNums2];
};
/*numRows < numColumns          numRows > numColumns
----------------------          ------------
|  s                 |          |          |
|                    |          |  s       |
|                f   |          |          |
----------------------          |       f  |
                                |          |
                                ------------
Making start point close to topLeft, finish point to the bottomRight
*/
function getStartFinishNode(numRows, numColumns) {
  let randomNums;
  let x, y;
  let startNodeRow, startNodeCol;
  let finishNodeRow, finishNodeCol;
  if (numRows < numColumns) {
    randomNums = getRandomNums(numRows);// randomNums[0]-->positive, randomNums[1]-->negative
    x = Math.floor(numRows / 2);
    y = Math.floor(numColumns / 4);
    if (x % 2 !== 0) x -= 1;
    if (y % 2 !== 0) y += 1;
    startNodeRow = x + getNumberfromArray(randomNums[1]);
    startNodeCol = y + [-8, -6, -4, -2, 0][Math.floor(Math.random() * 5)];
    finishNodeRow = x + getNumberfromArray(randomNums[0]);
    finishNodeCol = numColumns - y + [0, 2, 4, 6, 8][Math.floor(Math.random() * 5)];
  } else {
    randomNums = getRandomNums(numColumns);
    x = Math.floor(numRows / 4);
    y = Math.floor(numColumns / 2);
    if (x % 2 !== 0) x -= 1;
    if (y % 2 !== 0) y += 1;
    startNodeRow = x + [-8, -6, -4, -2, 0][Math.floor(Math.random() * 5)];
    startNodeCol = y + getNumberfromArray(randomNums[1]);
    finishNodeRow = numRows - x + [0, 2, 4, 6, 8][Math.floor(Math.random() * 5)];
    finishNodeCol = y + getNumberfromArray(randomNums[0]);
  }
  return [startNodeRow, startNodeCol, finishNodeRow, finishNodeCol];
};

function getNumberfromArray(array) {
  let length = array.length;
  let randomIndex = Math.floor(Math.random() * length);
  return array[randomIndex];
};

const getInitialGrid = (numRows, numColumns) => {
  let grid = [];
  for (let row = 0; row < numRows; row++) {
    let currentRow = [];
    for (let col = 0; col < numColumns; col++) {
      currentRow.push(createNode(row, col));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (row, col) => {
  return {
    row,
    col,
    isStart: row === startNodeRow && col === startNodeCol,
    isFinish: row === finishNodeRow && col === finishNodeCol,
    distance: Infinity,
    totalDistance: Infinity,
    isVisited: false,
    isShortest: false,
    isWall: false,
    previousNode: null,
  };
};

const getNewGridWithWalls = (grid, row, col) => {
  let newGrid = grid.slice();
  let node = grid[row][col];
  let newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

const getNewGridWithNewStartorFinish = (grid, row, col, movingGrid) => {
  let newGrid = grid.slice();
  let node = grid[row][col];
  if (movingGrid[1] === "Start") {
    if (row === finishNodeRow && col === finishNodeCol) return newGrid;
    grid[startNodeRow][startNodeCol].isStart = false;
    startNodeRow = row;
    startNodeCol = col;
    let newStart = {
      ...node,
      isStart: !node.isStart,
      isWall: false,
    };
    newGrid[row][col] = newStart;
  } else if (movingGrid[1] === "Finish") {
    if (row === startNodeRow && col === startNodeCol) return newGrid;
    grid[finishNodeRow][finishNodeCol].isFinish = false;
    finishNodeRow = row;
    finishNodeCol = col;
    let newFinish = {
      ...node,
      isFinish: !node.isFinish,
      isWall: false,
    };
    newGrid[row][col] = newFinish;
  }
  return newGrid;
};

const getNewGridWithMaze = (grid, walls) => {
  let newGrid = grid.slice();
  for (let wall of walls) {
    let node = grid[wall[0]][wall[1]];
    let newNode = {
      ...node,
      isWall: true,
    };
    newGrid[wall[0]][wall[1]] = newNode;
  }
  return newGrid;
};

const getGridWithoutPath = (grid) => {
  let newGrid = grid.slice();
  for (let row of grid) {
    for (let node of row) {
      let newNode = {
        ...node,
        distance: Infinity,
        totalDistance: Infinity,
        isVisited: false,
        isShortest: false,
        previousNode: null,
      };
      newGrid[node.row][node.col] = newNode;
    }
  }
  return newGrid;
};

const updateNodesForRender = (
  grid,
  nodesInShortestPathOrder,
  visitedNodesInOrder
) => {
  let newGrid = grid.slice();
  for (let node of visitedNodesInOrder) {
    if (
      (node.row === startNodeRow && node.col === startNodeCol) ||
      (node.row === finishNodeRow && node.col === finishNodeCol)
    )
      continue;
    let newNode = {
      ...node,
      isVisited: true,
    };
    newGrid[node.row][node.col] = newNode;
  }
  for (let node of nodesInShortestPathOrder) {
    if (node.row === finishNodeRow && node.col === finishNodeCol) {
      return newGrid;
    }
    let newNode = {
      ...node,
      isVisited: false,
      isShortest: true,
    };
    newGrid[node.row][node.col] = newNode;
  }
};

const getVisitedNodesInOrder = (
  visitedNodesInOrderStart,
  visitedNodesInOrderFinish
) => {
  let visitedNodesInOrder = [];
  let n = Math.max(
    visitedNodesInOrderStart.length,
    visitedNodesInOrderFinish.length
  );
  for (let i = 0; i < n; i++) {
    if (visitedNodesInOrderStart[i] !== undefined) {
      visitedNodesInOrder.push(visitedNodesInOrderStart[i]);
    }
    if (visitedNodesInOrderFinish[i] !== undefined) {
      visitedNodesInOrder.push(visitedNodesInOrderFinish[i]);
    }
  }
  return visitedNodesInOrder;
};

export default PathfindingVisualizer;

