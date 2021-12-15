// PlayClientboundServerDifficultyMessage.ts - creates Plugin messages
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

import MineBuffer from "../../../../../utils/MineBuffer";
import { IClientboundMessage } from "../../../Message";
import { Difficulty } from "../../../../../utils/Enums";

export interface PlayClientboundServerDifficultyMessageOptions {
  difficulty: Difficulty;
  difficultyLocked: boolean;
}

export class PlayClientboundServerDifficultyMessage implements IClientboundMessage {
  public id = 0x0e;

  public difficulty: Difficulty;
  public difficultyLocked: boolean;

  public constructor(options: PlayClientboundServerDifficultyMessageOptions) {
    this.difficulty = options.difficulty;
    this.difficultyLocked = options.difficultyLocked;
  }

  public encode(buffer: MineBuffer): void {
    buffer.writeUByte(this.difficulty).writeBoolean(this.difficultyLocked);
  }
}
