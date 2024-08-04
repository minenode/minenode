/* eslint-disable license-header/header */
import { Vec3 } from "../../native";

export function getBlockIndex(pos: Vec3) {
  return (pos.y << 8) | (pos.z << 4) | pos.x;
}

export function neededBits(value: number) {
  return 32 - Math.clz32(value);
}

export function getLightSectionIndex(pos: Vec3, minY: number) {
  return Math.floor((pos.y - minY) / 16) + 1;
}

export function toBiomePos(pos: Vec3, minY: number) {
  return new Vec3(pos.x >> 2, ((pos.y - minY) & 0xf) >> 2, pos.z >> 2);
}

export function toSectionPos(pos: Vec3, minY: number) {
  return new Vec3(pos.x, (pos.y - minY) & 0xf, pos.z);
}

export function getSectionBlockIndex(pos: Vec3, minY: number) {
  return (((pos.y - minY) & 15) << 8) | (pos.z << 4) | pos.x;
}

export function getBiomeIndex(pos: Vec3) {
  return (pos.y << 4) | (pos.z << 2) | pos.x;
}
