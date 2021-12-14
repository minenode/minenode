// Natives.ts - Native function interface (Wasm)
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

import fs from "fs";
import path from "path";

import { getRootDirectory } from "./DeployUtils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const WebAssembly: any;

export interface wasm_binary {
  ussr: (n: bigint, s: bigint) => bigint;
  utos: (n: bigint) => bigint;
}

export function loadWebAssembly(moduleName: "binary"): wasm_binary;
export function loadWebAssembly<Exports extends Record<string, unknown>, Imports extends Record<string, unknown>>(
  moduleName: string,
  imports?: Imports,
): Exports {
  const modulePath = path.join(getRootDirectory(), "wasm", `${moduleName}.wasm`);
  const buffer = fs.readFileSync(modulePath);
  const module = new WebAssembly.Module(buffer);
  const instance = new WebAssembly.Instance(module, imports);
  return instance.exports as Exports;
}

export const binary = loadWebAssembly("binary");
