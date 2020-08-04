/**
 * @ignore
 */
declare const XNominality: unique symbol
/**
 * Number type extension
 */
export type X = number & { [XNominality]: never }

/**
 * @ignore
 */
declare const YNominality: unique symbol
/**
 * Number type extension
 */
export type Y = number & { [YNominality]: never }

/**
 * Position on the board
 */
export interface PosReadable {
  readonly x: X;
  readonly y: Y;
}

/**
 * Position on the board (immutable)
 */
export class Pos implements PosReadable {
  constructor(readonly x: X, readonly y: Y) {
  }

  add(pos: PosReadable): Pos {
    return this.addXY(pos.x, pos.y);
  }

  addXY(x: X, y: Y): Pos {
    return new Pos(this.x + x as X, this.y + y as Y);
  }

  /**
   *  Get the position moved one step in the specified direction
   *
   * If you are currently at (x, y) = (0, 0):
   * up    is  ( 0, -1)
   * down  is  ( 0,  1)
   * right is  ( 1,  0)
   * left  is  (-1,  0)
   * @param direction
   */
  addDirection(direction: Direction): Pos {
    return this.add(Pos.createFromDirection(direction));
  }

  static createFromPos(pos: PosReadable): Pos {
    return new Pos(pos.x, pos.y);
  }

  static createFromDirection(direction: Direction): Pos {
    if(direction == Direction.up) {
      return new Pos(0 as X, -1 as Y);
    } else if(direction == Direction.down) {
      return new Pos(0 as X, 1 as Y);
    } else if(direction == Direction.right) {
      return new Pos(1 as X, 0 as Y);
    } else if(direction == Direction.left) {
      return new Pos(-1 as X, 0 as Y);
    } else if(direction == Direction.upRight) {
      return new Pos(1 as X, -1 as Y);
    } else if(direction == Direction.upLeft) {
      return new Pos(-1 as X, -1 as Y);
    } else if(direction == Direction.downRight) {
      return new Pos(1 as X, 1 as Y);
    } else if(direction == Direction.downLeft) {
      return new Pos(-1 as X, 1 as Y);
    } else {
      throw new Error('unknown direction')
    }
  }
}

/**
 * Position on the board (mutable)
 * 
 * Use of pos class is recommended, but it is used when the processing speed and memory usage efficiency are required.
 */
export class PosMutable implements PosReadable{
  constructor(public x: X, public y: Y) {
  }
  add(pos: PosReadable): PosMutable {
    return this.addXY(pos.x, pos.y);
  }

  addXY(x: X, y: Y): PosMutable {
    this.x = this.x + x as X;
    this.y = this.y + y as Y;
    return this;
  }

  addDirection(direction: Direction): PosMutable {
    return this.add(Pos.createFromDirection(direction));
  }

  static createFromPos(pos: PosReadable): PosMutable {
    return new PosMutable(pos.x, pos.y);
  }
}

export enum Direction {
  up, down, left, right,
  upLeft, upRight, downLeft, downRight
}