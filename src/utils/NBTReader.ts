// NBTReader.ts - Read NBT bytes
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

import MineBuffer from "./MineBuffer";
import * as NBTStructure from "./NBTStructure";

export default class NBTReader {
  private read_tag(mine_buffer: MineBuffer, known_tag_type = -1, read_name: boolean): [string, NBTStructure.AnyTag] {
    // Read the NBT tag type
    let tag_type, tag_name_length, tag_name;
    tag_name = "None";

    if (known_tag_type == -1) {
      tag_type = mine_buffer.readByte();
    } else {
      tag_type = known_tag_type;
    }

    // Only read name length and name for non TAG_End tags.
    if (tag_type != 0 && read_name) {
      // Read the NBT tag name length
      tag_name_length = mine_buffer.readShort();
      // Read the NBT tag name (Make sure name isn't empty first)
      if (tag_name_length > 0) {
        tag_name = mine_buffer.readBytes(tag_name_length).toString("utf8");
      }
    }

    switch (tag_type) {
      case 1: {
        // TAG_Byte
        const int8 = mine_buffer.readByte();

        const new_tag = new NBTStructure.TagByte(int8);

        return [tag_name, new_tag];
      }

      case 2: {
        // TAG_Short
        const int16 = mine_buffer.readShort();

        const new_tag = new NBTStructure.TagShort(int16);

        return [tag_name, new_tag];
      }

      case 3: {
        // TAG_Int
        const int32 = mine_buffer.readInt();

        const new_tag = new NBTStructure.TagInt(int32);

        return [tag_name, new_tag];
      }

      case 4: {
        // TAG_Long
        const int64 = mine_buffer.readLong();

        const new_tag = new NBTStructure.TagLong(int64);

        return [tag_name, new_tag];
      }

      case 5: {
        // TAG_Float
        const float = mine_buffer.readFloat();

        const new_tag = new NBTStructure.TagFloat(float);

        return [tag_name, new_tag];
      }

      case 6: {
        // TAG_Double
        const double = mine_buffer.readDouble();

        const new_tag = new NBTStructure.TagFloat(double);

        return [tag_name, new_tag];
      }

      case 7: {
        // TAG_Byte_Array
        const payload_size = mine_buffer.readInt();

        const byte_array = new NBTStructure.TagByteArray();

        for (let i = 0; i < payload_size; i++) {
          byte_array.data[i] = mine_buffer.readByte();
        }

        return [tag_name, byte_array];
      }

      case 8: {
        // TAG_String
        const string_size = mine_buffer.readShort();

        const string_value = mine_buffer.readBytes(string_size).toString("utf8");

        const tag_string = new NBTStructure.TagString(string_value);

        return [tag_name, tag_string];
      }

      case 9: {
        // TAG_List
        const tag_id = mine_buffer.readByte();

        const payload_size = mine_buffer.readInt();

        const tag_list = new NBTStructure.TagList(tag_id);

        for (let i = 0; i < payload_size; i++) {
          const temp = this.read_tag(mine_buffer, tag_id, false);
          const tag = temp[1];

          tag_list.data[i] = tag;
        }

        return [tag_name, tag_list];
      }

      case 10: {
        // TAG_Compound
        const compound_tag = new NBTStructure.TagCompound();

        do {
          const temp = this.read_tag(mine_buffer, -1, true);
          const name = temp[0];
          const tag = temp[1];

          compound_tag.data[name] = tag;

          // Check for end tag
        } while (mine_buffer.peekByte() != 0);
        mine_buffer.advanceReadOffset(1);

        return [tag_name, compound_tag];
      }

      case 11: {
        // TAG_Int_Array
        const payload_size = mine_buffer.readInt();

        const int_array = new NBTStructure.TagIntArray();

        for (let i = 0; i < payload_size; i++) {
          const int32 = mine_buffer.readInt();

          int_array.data[i] = int32;
        }

        return [tag_name, int_array];
      }

      case 12: {
        // TAG_Long_Array
        const payload_size = mine_buffer.readInt();

        const long_array = new NBTStructure.TagLongArray();

        for (let i = 0; i < payload_size; i++) {
          const int64 = mine_buffer.readLong();

          long_array.data[i] = int64;
        }

        return [tag_name, long_array];
      }

      default: {
        // WARN: Malformed nbt input

        const new_tag = new NBTStructure.TagByte(69);
        return [tag_name, new_tag]; // Stop type checking from throwing a fit
      }
    }
  }

  public read_nbt(nbt_data: MineBuffer): NBTStructure.AnyTag {
    const temp = this.read_tag(nbt_data, -1, true); // Should be the unnamed root tag
    const tag = temp[1];

    return tag;
  }
}
