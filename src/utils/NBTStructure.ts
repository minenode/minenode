// NBTStructure.ts - Store NBT types
// Copyright (C) 2021 MineNode
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import Long from "long";

export type AnyTag =
  | TagByte
  | TagShort
  | TagInt
  | TagLong
  | TagFloat
  | TagDouble
  | TagByteArray
  | TagString
  | TagList
  | TagCompound
  | TagIntArray
  | TagLongArray;

export class TagByte {
  public data: number;
  public constructor(data: number) {
    this.data = data;
  }
}

export class TagShort {
  public data: number;
  public constructor(data: number) {
    this.data = data;
  }
}

export class TagInt {
  public data: number;
  public constructor(data: number) {
    this.data = data;
  }
}

export class TagLong {
  public data: Long;
  public constructor(data: Long) {
    this.data = data;
  }
}

export class TagFloat {
  public data: number;
  public constructor(data: number) {
    this.data = data;
  }
}

export class TagDouble {
  public data: number;
  public constructor(data: number) {
    this.data = data;
  }
}

export class TagByteArray {
  public data: number[] = [];
}

export class TagString {
  public data: string;
  public constructor(data: string) {
    this.data = data;
  }
}

export class TagList {
  public data: AnyTag[] = [];
  public data_type: number;
  public constructor(data_type: number) {
    this.data_type = data_type;
  }
}

export class TagCompound {
  public data: { [key: string]: AnyTag } = {};
}

export class TagIntArray {
  public data: number[] = [];
}

export class TagLongArray {
  public data: Long[] = [];
}
