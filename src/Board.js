import React, { Component } from "react";
import Cell from "./Cell";
import './Board.css';


/** Game board of Lights out.
 *
 * Properties:
 *
 * - nrows: number of rows of board
 * - ncols: number of cols of board
 * - lowerBound: lower end of range for chance cell is lit at start of game
 * - upperBound: upper end of range for chance cell is lit at start of game
 * 
 * State:
 *
 * - hasWon: boolean, true when board is all off
 * - board: array-of-arrays of true/false
 *
 *    For this board:
 *       .  .  .
 *       O  O  .     (where . is off, and O is on)
 *       .  .  .
 *
 *    This would be: [[f, f, f], [t, t, f], [f, f, f]]
 *
 *  This should render an HTML table of individual <Cell /> components.
 *
 *  This doesn't handle any clicks --- clicks are on individual cells
 *
 **/

class Board extends Component
{
  static defaultProps =
    {
      // ncols determines extent of x
      ncols: 5,
      // nrows determines extent of y
      nrows: 5,
      // bounds should be between 0 and 100 since they represent percentages
      lowerBound: 30,
      upperBound: 60
    }

  constructor(props)
  {
    super(props);
    this.createBoard = this.createBoard.bind(this);
    this.flipCellsAround = this.flipCellsAround.bind(this);
    this.restart = this.restart.bind(this);
    this.state =
    {
      board: this.createBoard(),
      hasWon: false
    };
  }

  /** create a board nrows high/ncols wide, each cell randomly lit or unlit */

  createBoard()
  // initializes a completely unlit board (win condition) and simulates plays from there to give a starting board for the player
  // since the board started from the win condition, the board is solvable
  {
    let board = [];
    // nested functions don't seem to have access to this.props, but will have access to local variables that copy the values of the props
    let { ncols, nrows } = this.props;
    for (let i = 0; i < this.props.nrows; ++i)
    {
      board[i] = Array(this.props.ncols);
      for (let j = 0; j < this.props.ncols; ++j)
      {
        // Math.round rounds to nearest integer, Math.random generates number between 0 and 1, so result will be either 0 (falsy) or 1 (truthy)
        // board[i][j] = Math.round(Math.random()) ? true : false;

        // fill board with unlit cells so when simulating plays we know we started from a winning board
        board[i][j] = false;
      }
    }

    // gives integer between lowerBound and upperBound that represents % of board to be lit
    let randomBound = Math.round(Math.random() * this.props.lowerBound + 1 + (this.props.upperBound - this.props.lowerBound));
    // convert to %
    let boundPercent = randomBound / 100;
    // get nearest integer for actual number of cells that will be lit
    let numCellsLit = Math.round(boundPercent * (this.props.ncols * this.props.nrows));
    let minSimTurns = 50, i = 0;

    function countLitCells()
    {
      let numLitCells = 0;
      for (let i = 0; i < nrows; ++i)
      {
        for (let j = 0; j < ncols; ++j)
        {
          if (board[i][j])
          {
            ++numLitCells;
          }
        }
      }
      return numLitCells;
    }

    function flipCellsAroundBoard()
    {
      function flipCell(y, x)
      {
        // if this coord is actually on board, flip it
        if (x >= 0 && x < ncols && y >= 0 && y < nrows)
        {
          board[y][x] = !board[y][x];
        }
      }
      let x = Math.floor(Math.random() * ncols);
      let y = Math.floor(Math.random() * nrows);
      // flips up to 5 neighboring cells, if they are within bounds of the coordinates
      flipCell(y, x);       // clicked cell
      flipCell(y - 1, x);   // cell one above
      flipCell(y + 1, x);   // cell one below
      flipCell(y, x - 1);   // cell one left
      flipCell(y, x + 1);   // cell one right
    }

    // simulate turns from a 
    while (i < minSimTurns && numCellsLit !== countLitCells())
    {
      flipCellsAroundBoard();
    }

    return board;
  }

  /** handle changing a cell: update board & determine if winner */

  flipCellsAround(coord)
  {
    let { ncols, nrows } = this.props;
    // this creates shallow copy of board state where board === this.state.board (altering value in board directly mutates state -> state changes without using setState but setState triggers render) -- NOT GOOD but it works
    // let board = this.state.board;

    // this does a deep copy of board state
    let board = [];
    for (let i = 0; i < this.state.board.length; ++i)
    {
      board[i] = Array(this.state.board[i].length);
      for (let j = 0; j < this.state.board[i].length; ++j)
      {
        board[i][j] = this.state.board[i][j];
      }
    }

    let [y, x] = coord.split("-").map(Number);
    let hasWon = true;

    function flipCell(y, x)
    {
      // if this coord is actually on board, flip it

      if (x >= 0 && x < ncols && y >= 0 && y < nrows)
      {
        board[y][x] = !board[y][x];
      }
    }


    // flips up to 5 neighboring cells, if they are within bounds of the coordinates
    flipCell(y, x);       // clicked cell
    flipCell(y - 1, x);   // cell one above
    flipCell(y + 1, x);   // cell one below
    flipCell(y, x - 1);   // cell one left
    flipCell(y, x + 1);   // cell one right

    // win when every cell is turned off
    board.forEach(arr =>
    {
      arr.forEach(light =>
      {
        if (light)
          hasWon = false;
      })
    })

    this.setState(() => { return { board, hasWon } });
  }

  restart()
  {
    this.setState({ board: this.createBoard(), hasWon: false });
  }

  /** Render game board or winning message. */

  render()
  {
    // keys for React, should be no fear of overlap since outerKey is based on number of rows and a game with 1000 rows seems unreasonable
    let outerKey = 1, innerKey = 1000;
    let grid = this.state.board.map((arr, outerIndex) =>
    (
      <tr key={outerKey++}>
        {
          arr.map((val, innerIndex) =>
          // using parentheses here because returning JSX, brackets breaks things
          (
            // outerIndex = x coordinate, innerIndex = y coordinate
            <Cell key={innerKey++} coords={`${outerIndex}-${innerIndex}`} flipCellsAroundMe={this.flipCellsAround} isLit={this.state.board[outerIndex][innerIndex]} />
          ))
        }
      </tr>
    ));

    return (
      <div className="Board-container">
        <div className="Board-title"><span className="neon-orange">Lights</span><span className="neon-blue">Out</span></div>
        {
          this.state.hasWon
            ? <h2 className="Board-winMsg"><span className="neon-orange">YOU</span><span className="neon-blue">WIN!</span></h2>
            : <table className="Board">
              <tbody>
                {
                  grid
                }
              </tbody>
            </table>
        }
        <button className="Board-restart-btn" onClick={this.restart}>Restart</button>
      </div>
    )
    // how to do the same within the return
    // <table className="Board">
    //   {
    //     this.state.board.map(arr =>
    //       (
    //         <tr>
    //           {
    //             arr.map(val =>
    //               (
    //                 <td>{val}</td>
    //               ))
    //           }
    //         </tr>
    //       ))
    //   }
    // </table>

  }
}


export default Board;
