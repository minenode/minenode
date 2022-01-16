/*
 * Copyright (C) 2022 MineNode
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

export { Vec2, Vec3, Vec5 } from "../../native";

export interface IVec2 {
  x: number;
  y: number;
}

// export class Vec2 implements IVec2 {
//   public constructor(public x: number, public y: number) {}

//   public static get ZERO(): Vec2 {
//     return new Vec2(0, 0);
//   }

//   public clone(): Vec2 {
//     return new Vec2(this.x, this.y);
//   }

//   public add(other: IVec2): this {
//     this.x += other.x;
//     this.y += other.y;
//     return this;
//   }

//   public sub(other: IVec2): this {
//     this.x -= other.x;
//     this.y -= other.y;
//     return this;
//   }

//   public mul(other: IVec2): this {
//     this.x *= other.x;
//     this.y *= other.y;
//     return this;
//   }

//   public div(other: IVec2): this {
//     this.x /= other.x;
//     this.y /= other.y;
//     return this;
//   }

//   public scale(factor: number): this {
//     this.x *= factor;
//     this.y *= factor;
//     return this;
//   }

//   public distance(other: IVec2): number {
//     return Math.sqrt(this.distanceSquared(other));
//   }

//   public distanceSquared(other: IVec2): number {
//     const dx = this.x - other.x;
//     const dy = this.y - other.y;
//     return dx * dx + dy * dy;
//   }

//   public length(): number {
//     return Math.sqrt(this.lengthSquared());
//   }

//   public lengthSquared(): number {
//     return this.x * this.x + this.y * this.y;
//   }

//   public normalize(): this {
//     const length = this.length();
//     if (length !== 0) {
//       this.scale(1 / length);
//     }
//     return this;
//   }

//   public toString(): string {
//     return `(${this.x}, ${this.y})`;
//   }

//   public toJSON(): IVec2 {
//     return { x: this.x, y: this.y };
//   }
// }

export class ImmutableVec2 implements IVec2 {
  public constructor(public readonly x: number, public readonly y: number) {}

  public static get ZERO(): ImmutableVec2 {
    return new ImmutableVec2(0, 0);
  }

  public clone(): ImmutableVec2 {
    return new ImmutableVec2(this.x, this.y);
  }

  public add(other: IVec2): ImmutableVec2 {
    return new ImmutableVec2(this.x + other.x, this.y + other.y);
  }

  public sub(other: IVec2): ImmutableVec2 {
    return new ImmutableVec2(this.x - other.x, this.y - other.y);
  }

  public mul(other: IVec2): ImmutableVec2 {
    return new ImmutableVec2(this.x * other.x, this.y * other.y);
  }

  public div(other: IVec2): ImmutableVec2 {
    return new ImmutableVec2(this.x / other.x, this.y / other.y);
  }

  public scale(factor: number): ImmutableVec2 {
    return new ImmutableVec2(this.x * factor, this.y * factor);
  }

  public distance(other: IVec2): number {
    return Math.sqrt(this.distanceSquared(other));
  }

  public distanceSquared(other: IVec2): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return dx * dx + dy * dy;
  }

  public length(): number {
    return Math.sqrt(this.lengthSquared());
  }

  public lengthSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  public normalize(): ImmutableVec2 {
    const length = this.length();
    if (length !== 0) {
      return new ImmutableVec2(this.x / length, this.y / length);
    }
    return this;
  }

  public toString(): string {
    return `(${this.x}, ${this.y})`;
  }

  public toJSON(): IVec2 {
    return { x: this.x, y: this.y };
  }
}

export interface IVec3 extends IVec2 {
  x: number;
  y: number;
  z: number;
}

// export class Vec3 implements IVec2, IVec3 {
//   public constructor(public x: number, public y: number, public z: number) {}

//   public static get ZERO(): Vec3 {
//     return new Vec3(0, 0, 0);
//   }

//   public clone(): Vec3 {
//     return new Vec3(this.x, this.y, this.z);
//   }

//   public add(other: IVec3): this {
//     this.x += other.x;
//     this.y += other.y;
//     this.z += other.z;
//     return this;
//   }

//   public sub(other: IVec3): this {
//     this.x -= other.x;
//     this.y -= other.y;
//     this.z -= other.z;
//     return this;
//   }

//   public mul(other: IVec3): this {
//     this.x *= other.x;
//     this.y *= other.y;
//     this.z *= other.z;
//     return this;
//   }

//   public div(other: IVec3): this {
//     this.x /= other.x;
//     this.y /= other.y;
//     this.z /= other.z;
//     return this;
//   }

//   public scale(factor: number): this {
//     this.x *= factor;
//     this.y *= factor;
//     this.z *= factor;
//     return this;
//   }

//   public distance(other: IVec3): number {
//     return Math.sqrt(this.distanceSquared(other));
//   }

//   public distanceSquared(other: IVec3): number {
//     const dx = this.x - other.x;
//     const dy = this.y - other.y;
//     const dz = this.z - other.z;
//     return dx * dx + dy * dy + dz * dz;
//   }

//   public length(): number {
//     return Math.sqrt(this.lengthSquared());
//   }

//   public lengthSquared(): number {
//     return this.x * this.x + this.y * this.y + this.z * this.z;
//   }

//   public normalize(): this {
//     const length = this.length();
//     if (length !== 0) {
//       this.scale(1 / length);
//     }
//     return this;
//   }

//   public toString(): string {
//     return `(${this.x}, ${this.y}, ${this.z})`;
//   }

//   public toJSON(): IVec3 {
//     return { x: this.x, y: this.y, z: this.z };
//   }
// }

export class ImmutableVec3 implements IVec2, IVec3 {
  public constructor(public x: number, public y: number, public z: number) {}

  public static get ZERO(): ImmutableVec3 {
    return new ImmutableVec3(0, 0, 0);
  }

  public clone(): ImmutableVec3 {
    return new ImmutableVec3(this.x, this.y, this.z);
  }

  public add(other: IVec3): ImmutableVec3 {
    return new ImmutableVec3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  public sub(other: IVec3): ImmutableVec3 {
    return new ImmutableVec3(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  public mul(other: IVec3): ImmutableVec3 {
    return new ImmutableVec3(this.x * other.x, this.y * other.y, this.z * other.z);
  }

  public div(other: IVec3): ImmutableVec3 {
    return new ImmutableVec3(this.x / other.x, this.y / other.y, this.z / other.z);
  }

  public scale(factor: number): ImmutableVec3 {
    return new ImmutableVec3(this.x * factor, this.y * factor, this.z * factor);
  }

  public distance(other: IVec3): number {
    return Math.sqrt(this.distanceSquared(other));
  }

  public distanceSquared(other: IVec3): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const dz = this.z - other.z;
    return dx * dx + dy * dy + dz * dz;
  }

  public length(): number {
    return Math.sqrt(this.lengthSquared());
  }

  public lengthSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  public normalize(): ImmutableVec3 {
    const length = this.length();
    if (length !== 0) {
      return new ImmutableVec3(this.x / length, this.y / length, this.z / length);
    }
    return this;
  }

  public toString(): string {
    return `(${this.x}, ${this.y}, ${this.z})`;
  }

  public toJSON(): IVec3 {
    return { x: this.x, y: this.y, z: this.z };
  }
}

export interface IVec5 extends IVec3 {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
}

// export class Vec5 extends Vec3 implements IVec5, IVec3, IVec2 {
//   public constructor(public x: number, public y: number, public z: number, public yaw: number, public pitch: number) {
//     super(x, y, z);
//   }

//   public static get ZERO(): Vec5 {
//     return new Vec5(0, 0, 0, 0, 0);
//   }

//   public clone(): Vec5 {
//     return new Vec5(this.x, this.y, this.z, this.yaw, this.pitch);
//   }

//   public toString(): string {
//     return `(${this.x}, ${this.y}, ${this.z}, ${this.yaw}, ${this.pitch})`;
//   }

//   public toJSON(): IVec5 {
//     return { x: this.x, y: this.y, z: this.z, yaw: this.yaw, pitch: this.pitch };
//   }
// }
