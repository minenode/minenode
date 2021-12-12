// PositionYP.ts - represents a basic X/Y/Z cartesian position along with yaw and pitch.
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

import BasicPosition3D from "./BasicPosition3D";

export default class PositionYP extends BasicPosition3D {
  public yaw: number;
  public pitch: number;

  public constructor(x = 0, y = 0, z = 0, yaw = 0, pitch = 0) {
    super(x, y, z);
    this.yaw = yaw;
    this.pitch = pitch;
  }
}
