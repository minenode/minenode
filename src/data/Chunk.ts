import MineBuffer from "../utils/MineBuffer";

// TODO: WIP

type BlockState = unknown;

function getGlobalPaletteIdFromState(state: BlockState): number {
  // TODO
  void state;
  return 0;
}

function getStatefromGlobalPaletteId(globalPaletteId: number): BlockState {
  // TODO
  void globalPaletteId;
  return 0;
}

export interface Palette {
  idForState(state: BlockState): number;
  stateForId(id: number): BlockState;
  getBitsPerBlock(): number;
  read(buffer: MineBuffer): void;
  write(buffer: MineBuffer): void;
}

export class IndirectPalette implements Palette {
  private idToState: Map<number, BlockState> = new Map();
  private stateToId: Map<BlockState, number> = new Map();
  private bitsPerBlock: number;

  public constructor(bitsPerBlock: number) {
    this.bitsPerBlock = bitsPerBlock;
  }

  public idForState(state: BlockState): number {
    const id = this.stateToId.get(state);
    if (typeof id === "undefined") {
      throw new Error(`No id found for state ${state}`);
    }
    return id;
  }

  public stateForId(id: number): BlockState {
    const state = this.idToState.get(id);
    if (typeof state === "undefined") {
      throw new Error(`No state found for id ${id}`);
    }
    return state;
  }

  public getBitsPerBlock(): number {
    return this.bitsPerBlock;
  }

  public read(buffer: MineBuffer): void {
    this.idToState.clear();
    this.stateToId.clear();
    const count = buffer.readVarInt();
    for (let i = 0; i < count; i++) {
      const id = buffer.readVarInt();
      const state = getStatefromGlobalPaletteId(id);
      this.idToState.set(id, state);
      this.stateToId.set(state, id);
    }
  }

  public write(buffer: MineBuffer): void {
    if (this.idToState.size !== this.stateToId.size) {
      throw new Error("idToState and stateToId must be the same size");
    }
    buffer.writeVarInt(this.idToState.size);
    for (let id = 0; id < this.idToState.size; id++) {
      const state = this.stateForId(id);
      buffer.writeVarInt(getGlobalPaletteIdFromState(state));
    }
  }
}

export class DirectPalette implements Palette {
  public idForState(state: BlockState): number {
    return getGlobalPaletteIdFromState(state);
  }

  public stateForId(id: number): BlockState {
    return getStatefromGlobalPaletteId(id);
  }

  public getBitsPerBlock(): number {
    return 0; // TODO
    // return Math.ceil(Math.log2(BlockState.getAll().length));
  }

  public read(buffer: MineBuffer): void {
    // Do nothing
    void buffer;
  }

  public write(buffer: MineBuffer): void {
    // Do nothing
    void buffer;
  }
}

export function choosePalette(bitsPerBlock: number): Palette {
  if (bitsPerBlock <= 4) {
    return new IndirectPalette(4);
  } else if (bitsPerBlock <= 8) {
    return new IndirectPalette(bitsPerBlock);
  } else {
    return new DirectPalette();
  }
}
