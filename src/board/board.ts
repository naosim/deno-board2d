import {
  X,
  Y,
  Pos, 
  PosReadable,
  Direction
} from '../pos/pos.ts';

/**
 * @ignore
 */
declare const SkipCopyNominality: unique symbol
/**
 * Whether to omit the copy
 * 
 * Boolean type extension
 */
export type SkipCopy = boolean & { [SkipCopyNominality]: never }

export interface BoardReadable<T> {
  readonly xSize: number;
  readonly ySize: number;
  /**
   * executes a provided function once for each positions on the board.
   * @param callback
   */
  forEach(callback: (pos: Pos, value: T | null)=>void): void;

  /**
   * Get the piece at the specified position
   * 
   * @param pos
   * @return Returns null if the specified position is empty. Returns undefined if outside the board.
   */
  getValue(pos: PosReadable): T | null | undefined;

  /**
   * @deprecated
   * @ignore
   */
  getValueFromXY(x: X, y: Y): T | null | undefined;

  getValueWithXY(x: X, y: Y): T | null | undefined;

  /**
   * whether there is a piece at the specified position
   *
   * @return Returns true if there is a piece. Returns false if there is no a piece or the position is outside of the board.
   * @param pos
   */
  exists(pos: PosReadable): boolean;

  /**
   * Tests whether at least one piece in the board passes the test implemented by the provided check function. It returns a Boolean value.
   * @param check 
   */
  some(check: (pos: Pos, value: T | null)=>boolean): boolean;

  find(check: (pos: Pos, value: T | null)=>boolean): ValueAndPos<T | null> | null;
  findAll(check: (pos: Pos, value: T | null)=>boolean): ValueAndPos<T | null>[];

  /**
   * @deprecated
   * @ignore
   */
  getFromDrection(pos: PosReadable, direction: Direction): ValueAndPos<T | null> | undefined;

  /**
   * Get a piece that is one step ahead in the direction from position.
   * @param pos
   * @param direction
   * @return Returns true if there is a piece. Returns false if there is no a piece or the position is outside of the board.
   */
  getValueWithDirection(pos: PosReadable, direction: Direction): ValueAndPos<T | null> | undefined;

  indexToPos(index: number): Pos;
  posToIndex(pos: PosReadable): number;
}

export class BoardCore<T> implements BoardReadable<T> {
  readonly values: (T | null)[][]; // T or null
  readonly #poses: Pos[][];

  /**
   * Create with board size.
   */
  constructor(readonly xSize:number, readonly ySize: number) {
    this.values = new Array(ySize).fill(null).map(_ => new Array(xSize).fill(null));
    this.#poses = new Array(ySize).fill(null).map((_, y) => new Array(xSize).fill(null).map((__, x) => new Pos(x as X, y as Y)));
  }

  forEach(callback: (pos: Pos, value: T | null)=>void) {
    for(var y = 0 as Y; y < this.ySize; y++) {
      for(var x = 0 as X; x < this.xSize; x++) {
        callback(this.#poses[y][x], this.values[y][x])
      }
    }
  }

  getValue(pos: PosReadable): T | null | undefined {
    return this.getValueFromXY(pos.x, pos.y);
  }

  /**
   * @deprecated
   * @ignore
   */
  getValueFromXY(x: X, y: Y): T | null | undefined {
    return this.getValueWithXY(x, y);
  }

  getValueWithXY(x: X, y: Y): T | null | undefined {
    if(x < 0 || y < 0) {
      return undefined;
    }
    if(this.values.length <= y || this.values[0].length <= x) {
      return undefined;
    }
    return this.values[y][x];
  }

  exists(pos: PosReadable): boolean {
    return this.getValue(pos) !== null && this.getValue(pos) !== undefined;
  }

  some(check: (pos: Pos, value: T | null)=>boolean): boolean {
    for(var y: Y = 0 as Y; y < this.ySize; y++) {
      for(var x: X = 0 as X; x < this.xSize; x++) {
        if(check(this.#poses[y][x], this.values[y][x])) {
          return true;
        }
      }
    }
    return false;
  }

  find(check: (pos: Pos, value: T | null)=>boolean): ValueAndPos<T | null> | null {
    for(var y = 0 as Y; y < this.ySize; y++) {
      for(var x = 0 as X; x < this.xSize; x++) {
        if(check(this.#poses[y][x], this.values[y][x])) {
          return { pos: this.#poses[y][x], value: this.values[y][x] };
        }
      }
    }
    return null;
  }

  findAll(check: (pos: Pos, value: T | null)=>boolean): ValueAndPos<T | null>[] {
    var result = [];
    for(var y = 0 as Y; y < this.ySize; y++) {
      for(var x = 0 as X; x < this.xSize; x++) {
        if(check(this.#poses[y][x], this.values[y][x])) {
          result.push({
            pos: this.#poses[y][x],
            value: this.values[y][x]
          });
        }
      }
    }
    return result;
  }

  /**
   * @deprecated
   * @ignore
   */
  getFromDrection(pos: PosReadable, direction: Direction): ValueAndPos<T | null> | undefined {
    return this.getValueWithDirection(pos, direction);
  }

  getValueWithDirection(pos: PosReadable, direction: Direction): ValueAndPos<T | null> | undefined {
    var p = Pos.createFromPos(pos).addDirection(direction);
    var v = this.getValue(p);
    if(v === undefined) {
      return undefined;
    }
    return {
      pos: p,
      value: v
    };
  }

  indexToPos(index: number): Pos {
    if(index < 0 || index >= this.xSize * this.ySize) {
      throw new Error('out of index');
    }
    return new Pos(
      index % this.xSize as X,
      Math.floor(index / this.xSize) as Y
    );
  }

  posToIndex(pos: PosReadable): number {
    if(pos.x < 0 || pos.x >= this.xSize || pos.y < 0 || pos.y >= this.ySize) {
      throw new Error('out of index');
    }
    return pos.y * this.xSize + pos.x;
  }

  copy(): BoardCore<T> {
    var result = new BoardCore<T>(this.xSize, this.ySize);
    this.forEach((pos, v) => result.values[pos.y][pos.x] = v);
    return result;
  }
}

/**
 * Two-dimensional board
 */
export class Board<T> implements BoardReadable<T> {
  readonly #boardCore: BoardCore<T>;

  constructor(boardCore: BoardCore<T>, skipCopy: SkipCopy = false as SkipCopy) {
    this.#boardCore = skipCopy ? boardCore : boardCore.copy();
  }

  get xSize(): number { return this.#boardCore.xSize; }
  get ySize(): number { return this.#boardCore.ySize; }

  /**
   * Two-dimensional array as raw data on the board
   * 
   * @return Return a copy. Updating the returned value does not affect the board.
   */
  get values(): (T | null)[][] { return this.#boardCore.copy().values; }

  /**
   * Put pieces on the board (immutable)
   */
  put(pos: PosReadable, value: T | null): Board<T> {
    var newBoardCore = this.#boardCore.copy();
    newBoardCore.values[pos.y][pos.x] = value;
    return new Board<T>(newBoardCore, true as SkipCopy);
  }

  /**
   * @deprecated
   * @ignore
   */
  putFromXY(x: X, y: Y, value: T | null) {
    return this.put(new Pos(x, y), value);
  }

  putWithXY(x: X, y: Y, value: T | null) {
    return this.put(new Pos(x, y), value);
  }

  forEach(callback: (pos: Pos, value: T | null)=>void) {
    this.#boardCore.forEach(callback);
  }

  getValue(pos: PosReadable): T | null | undefined {
    return this.#boardCore.getValue(pos);
  }

  /**
   * @deprecated
   * @ignore
   */
  getValueFromXY(x: X, y: Y): T | null | undefined {
    return this.#boardCore.getValueWithXY(x, y);
  }

  getValueWithXY(x: X, y: Y): T | null | undefined {
    return this.#boardCore.getValueWithXY(x, y);
  }

  exists(pos: PosReadable): boolean {
    return this.#boardCore.exists(pos);
  }

  copy(): Board<T> {
    return new Board<T>(this.#boardCore.copy());
  }

  some(check: (pos: Pos, value: T | null)=>boolean): boolean {
    return this.#boardCore.some(check);
  }

  find(check: (pos: Pos, value: T | null)=>boolean): ValueAndPos<T | null> | null {
    return this.#boardCore.find(check);
  }
  findAll(check: (pos: Pos, value: T | null)=>boolean): ValueAndPos<T | null>[] {
    return this.#boardCore.findAll(check);
  }

  /**
   * @deprecated
   * @ignore
   */
  getFromDrection(pos: PosReadable, direction: Direction): ValueAndPos<T | null> | undefined {
    return this.#boardCore.getValueWithDirection(pos, direction);
  }

  getValueWithDirection(pos: PosReadable, direction: Direction): ValueAndPos<T | null> | undefined {
    return this.#boardCore.getValueWithDirection(pos, direction);
  }

  indexToPos(index: number): Pos {
    return this.#boardCore.indexToPos(index);
  }

  posToIndex(pos: PosReadable): number {
    return this.#boardCore.posToIndex(pos);
  }

  toMutable(): BoardMutable<T> {
    return new BoardMutable<T>(this.#boardCore);
  }

  static empty<T>(xSize: number, ySize: number): Board<T> {
    return new Board<T>(new BoardCore(xSize, ySize), true as SkipCopy)
  }
}

/**
 * Use of Board class is recommended, but it is used when the processing speed and memory usage efficiency are required.
 */
export class BoardMutable<T> implements BoardReadable<T> {
  boardCore: BoardCore<T>;
  constructor(boardCore: BoardCore<T>, skipCopy: SkipCopy = false as SkipCopy) {
    this.boardCore = skipCopy ? boardCore : boardCore.copy();
  }

  get xSize(): number { return this.boardCore.xSize; }
  get ySize(): number { return this.boardCore.ySize; }

  /**
   * Put pieces on the board (mutable)
   */
  put(pos: PosReadable, value: T | null): BoardMutable<T> {
    this.boardCore.values[pos.y][pos.x] = value;
    return this;
  }

  forEach(callback: (pos: Pos, value: T | null)=>void) {
    this.boardCore.forEach(callback);
  }

  getValue(pos: PosReadable): T | null | undefined {
    return this.boardCore.getValue(pos);
  }

  /**
   * @deprecated
   * @ignore
   */
  getValueFromXY(x: X, y: Y): T | null | undefined {
    return this.boardCore.getValueWithXY(x, y);
  }

  getValueWithXY(x: X, y: Y): T | null | undefined {
    return this.boardCore.getValueWithXY(x, y);
  }

  exists(pos: PosReadable): boolean {
    return this.boardCore.exists(pos);
  }

  copy(): Board<T> {
    return new Board<T>(this.boardCore.copy());
  }

  some(check: (pos: Pos, value: T | null)=>boolean): boolean {
    return this.boardCore.some(check);
  }

  find(check: (pos: Pos, value: T | null)=>boolean): ValueAndPos<T | null> | null {
    return this.boardCore.find(check);
  }

  findAll(check: (pos: Pos, value: T | null)=>boolean): ValueAndPos<T | null>[] {
    return this.boardCore.findAll(check);
  }

  /**
   * @deprecated
   * @ignore
   */
  getFromDrection(pos: PosReadable, direction: Direction): ValueAndPos<T | null> | undefined {
    return this.boardCore.getValueWithDirection(pos, direction);
  }

  getValueWithDirection(pos: PosReadable, direction: Direction): ValueAndPos<T | null> | undefined {
    return this.boardCore.getValueWithDirection(pos, direction);
  }

  indexToPos(index: number): Pos {
    return this.boardCore.indexToPos(index);
  }

  posToIndex(pos: PosReadable): number {
    return this.boardCore.posToIndex(pos);
  }

  static empty<T>(xSize: number, ySize: number): BoardMutable<T> {
    return new BoardMutable<T>(new BoardCore(xSize, ySize), true as SkipCopy)
  }

  toImmutable(): Board<T> {
    return new Board<T>(this.boardCore);
  }
}

export type ValueAndPos<T> = {
  readonly pos: Pos,
  readonly value:T
}
