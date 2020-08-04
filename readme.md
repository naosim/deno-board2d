board2d for deno
===
A board library for games.
Please use it for games such as Othello and Shogi that use a grid board.


## import
```javascript
import * as board2d from 'board2d';
```

## usage
### Updating the board
#### Make a 3x3 board and place pieces
```javascript
var board = board2d.Board.empty(3, 3)
  .put(new board2d.Pos(2, 2), 'x') // Put a piece with Pos class instance
  .put({x: 2, y: 1}, 'o') // Put a piece with object
  .putWithXY(2, 0, 'o') // Put a piece with x and y directly
var mark = board.getValue({x: 2, y: 2}); // Get the piece at the specified position
console.log(mark); // => 'x'
```

### Referencing the board
#### Get the piece at the specified position
```javascript
var mark = board.getValue({x: 2, y: 2}); // Get the piece at the specified position
console.log(mark); // => 'x'
console.log(board.getValue({x: 0, y: 0})); // Returns null if the specified position is empty
console.log(board.getValue({x: -1, y: -1})); // Returns undefined if outside the board
```

#### Get each piece
```javascript
board.forEach((pos, value) => {
  console.log(pos.x, pos.y, value);
})
```

#### Get a piece that is one step ahead in the direction from position.
```javascript
var mark;
posAndValue = board.getValueWithDirection({x: 2, y: 2}, board2d.Direction.up)// => {pos: {x: 2, y: 1}, value: 'o'}
posAndValue = board.getValueWithDirection({x: 2, y: 2}, board2d.Direction.left)// => {pos: {x: 1, y: 2}, value: null}
posAndValue = board.getValueWithDirection({x: 2, y: 2}, board2d.Direction.right)// => undefined
```

#### Find a piece under any condition
```javascript
var result = board.find((pos, value) => value == 'o') // find 'o' piece
console.log(result.pos.x, result.pos.y, result.value);
// => 2, 0, o
```

#### Find pieces with any condition
```javascript
var results = board.findAll((pos, value) => value == 'o') // find 'o' piece
results.forEach(v => console.log(v.pos.x, v.pos.y, v.value))
// => 2, 0, o
// => 2, 1, o
```

#### Check the existence of the piece
```javascript
var exist = board.exists({x: 2, y: 2})// => true
var notExist = board.exists({x: 0, y: 0})// => false
```

#### Check the existence of pieces with any condition
```javascript
var result = board.some((pos, value) => value == 'x');
console.log(result);// => true
```

#### Get the size of the board
```javascript
console.log(board.xSize);// => 3
console.log(board.ySize);// => 3
```

#### Get the raw data on the board
```javascript
var values = board.values;
console.log(values[1][2]); // => o
// Return a copy. Updating the returned value does not affect the board.
values[1][2] = null;// update
console.log(values[1][2]); // => null
console.log(board.getValue({x: 2, y: 1})); // => o  no updated
```