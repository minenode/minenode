// BasicPosition3D.ts - represents a basic X/Y/Z cartesian position
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

/**
 * Basic interface for X/Y/Z cartesian position.
 */
export interface IBasicPosition3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Represents a basic X/Y/Z cartesian position.
 */
export default class BasicPosition3D implements IBasicPosition3D {
  public x: number;
  public y: number;
  public z: number;

  public constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public getDistanceFrom(pos: IBasicPosition3D): number {
    const dx = pos.x - this.x;
    const dy = pos.y - this.y;
    const dz = pos.z - this.z;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  public static ZERO: Readonly<IBasicPosition3D> = { x: 0, y: 0, z: 0 };
}
