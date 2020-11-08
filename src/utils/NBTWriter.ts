// NBTWriter.ts - Write NBT bytes// Copyright (C) 2020 MineNode
// Copyright (C) 2020 MineNode
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
// along with this program.  If not, see <https://www.gnu.org/licenses/>..

import MineBuffer from "./MineBuffer";
import * as NBTStructure from "./NBTStructure";

export default class NBTWriter {
  private get_tag_id(nbt_tag: NBTStructure.AnyTag): number {
    if (nbt_tag instanceof NBTStructure.TagByte) {
      return 1;
    } else if (nbt_tag instanceof NBTStructure.TagShort) {
      return 2;
    } else if (nbt_tag instanceof NBTStructure.TagInt) {
      return 3;
    } else if (nbt_tag instanceof NBTStructure.TagLong) {
      return 4;
    } else if (nbt_tag instanceof NBTStructure.TagFloat) {
      return 5;
    } else if (nbt_tag instanceof NBTStructure.TagDouble) {
      return 6;
    } else if (nbt_tag instanceof NBTStructure.TagByteArray) {
      return 7;
    } else if (nbt_tag instanceof NBTStructure.TagString) {
      return 8;
    } else if (nbt_tag instanceof NBTStructure.TagList) {
      return 9;
    } else if (nbt_tag instanceof NBTStructure.TagCompound) {
      return 10;
    } else if (nbt_tag instanceof NBTStructure.TagIntArray) {
      return 11;
    } else if (nbt_tag instanceof NBTStructure.TagLongArray) {
      return 12;
    } else {
      // To stop ts from throwing a fit about types
      return 42;
    }
  }
  private write_tag(nbt_tag: NBTStructure.AnyTag, mine_buffer: MineBuffer, name: string | null, write_type: boolean, write_name: boolean): void {
    // Write the tag type

    if (write_type) {
      mine_buffer.writeByte(this.get_tag_id(nbt_tag));
    }

    // If we are to write name, then do so
    if (write_name) {
      // Write name
      let length;
      if (name == null) {
        length = 0;
      } else {
        length = name.length;
      }

      mine_buffer.writeShort(length);
      if (name != "" && name != undefined) {
        mine_buffer.writeBytes(Buffer.from(name));
      }
    }

    // Write individual tag data
    if (nbt_tag instanceof NBTStructure.TagByte) {
      // TAG_Byte
      mine_buffer.writeByte(nbt_tag.data);
    } else if (nbt_tag instanceof NBTStructure.TagShort) {
      mine_buffer.writeShort(nbt_tag.data);

    } else if (nbt_tag instanceof NBTStructure.TagInt) {
      mine_buffer.writeInt(nbt_tag.data);

    } else if (nbt_tag instanceof NBTStructure.TagLong) {
      mine_buffer.writeLong(nbt_tag.data);

    } else if (nbt_tag instanceof NBTStructure.TagFloat) {
      mine_buffer.writeFloat(nbt_tag.data);

    } else if (nbt_tag instanceof NBTStructure.TagDouble) {
      mine_buffer.writeDouble(nbt_tag.data);

    } else if (nbt_tag instanceof NBTStructure.TagByteArray) {
      mine_buffer.writeInt(nbt_tag.data.length);

      for (let i = 0; i < nbt_tag.data.length; i++) {
        mine_buffer.writeByte(nbt_tag.data[i]);
      }

    } else if (nbt_tag instanceof NBTStructure.TagString) {
      mine_buffer.writeShort(nbt_tag.data.length);
      mine_buffer.writeBytes(Buffer.from(nbt_tag.data, "utf8"));

    } else if (nbt_tag instanceof NBTStructure.TagList) {
      mine_buffer.writeByte(nbt_tag.data_type);
      mine_buffer.writeInt(nbt_tag.data.length);
      for (let i = 0; i < nbt_tag.data.length; i++) {
        this.write_tag(nbt_tag.data[i], mine_buffer, null, false, false);
      }

    } else if (nbt_tag instanceof NBTStructure.TagCompound) {
      for (const key in nbt_tag.data) {
        this.write_tag(nbt_tag.data[key], mine_buffer, key, true, true);
      }
      mine_buffer.writeByte(0);

    } else if (nbt_tag instanceof NBTStructure.TagIntArray) {
      mine_buffer.writeInt(nbt_tag.data.length);
      for (let i = 0; i < nbt_tag.data.length; i++) {
        mine_buffer.writeInt(nbt_tag.data[i]);
      }

    } else if (nbt_tag instanceof NBTStructure.TagLongArray) {
      mine_buffer.writeInt(nbt_tag.data.length);
      for (let i = 0; i < nbt_tag.data.length; i++) {
        mine_buffer.writeLong(nbt_tag.data[i]);
      }
      
    }
  }

  public write_nbt(nbt_tree: NBTStructure.TagCompound, mine_buffer: MineBuffer): void {
    this.write_tag(nbt_tree, mine_buffer, null, true, true);
  }
}
