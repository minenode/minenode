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

use napi_derive::napi;
use serde_json::json;

#[napi]
pub struct Vec2 {
  pub x: f64,
  pub y: f64,
}

#[napi]
impl Vec2 {
  #[napi(constructor)]
  pub fn new(x: f64, y: f64) -> Self {
    Self { x, y }
  }

  #[napi(factory)]
  pub fn zero() -> Vec2 {
    Vec2 { x: 0.0, y: 0.0 }
  }
  
  #[napi(factory)]
  pub fn from_string(s: String) -> Self {
    let s = s.trim();
    if !s.starts_with("Vec2(") || !s.ends_with(")") {
      // Retorna um valor padrão em caso de erro
      return Vec2 { x: 0.0, y: 0.0 }; // Valor padrão, você pode ajustar conforme necessário
    }

    let content = &s[5..s.len() - 1];
    let parts: Vec<&str> = content.split(',').collect();

    if parts.len() != 2 {
      // Retorna um valor padrão em caso de erro
      return Vec2 { x: 0.0, y: 0.0 }; // Valor padrão, você pode ajustar conforme necessário
    }

    let x: f64 = parts[0].trim().parse().unwrap_or(0.0); // Valor padrão em caso de erro
    let y: f64 = parts[1].trim().parse().unwrap_or(0.0); // Valor padrão em caso de erro

    Vec2 { x, y }
  }


  #[napi]
  pub fn magnitude(&self) -> f64 {
    (self.x * self.x + self.y * self.y).sqrt()
  }

  #[napi]
  // angle of vector in radians
  pub fn angle(&self) -> f64 {
    self.y.atan2(self.x)
  }

  #[napi]
  pub fn to_string(&self) -> String {
    format!("Vec2({}, {})", self.x, self.y)
  }

  #[napi(js_name="toJSON")]
  pub fn to_json(&self) -> String {
    json!({
      "x": self.x,
      "y": self.y,
    }).to_string()
  }

  #[napi]
  pub fn add(&mut self, other: &Vec2) {
    self.x += other.x;
    self.y += other.y;
  }

  #[napi]
  pub fn sub(&mut self, other: &Vec2) {
    self.x -= other.x;
    self.y -= other.y;
  }

  #[napi]
  pub fn mul(&mut self, other: &Vec2) {
    self.x *= other.x;
    self.y *= other.y;
  }

  #[napi]
  pub fn div(&mut self, other: &Vec2) {
    self.x /= other.x;
    self.y /= other.y;
  }

  #[napi]
  // angle is in radians
  pub fn rotate(&mut self, angle: f64) {
    let cos = angle.cos();
    let sin = angle.sin();
    let x = self.x;
    let y = self.y;
    self.x = x * cos - y * sin;
    self.y = x * sin + y * cos;
  }

  #[napi]
  pub fn normalize(&mut self) {
    let mag = self.magnitude();
    self.x /= mag;
    self.y /= mag;
  }

  #[napi]
  pub fn distance(&self, other: &Vec2) -> f64 {
    let dx = self.x - other.x;
    let dy = self.y - other.y;
    (dx * dx + dy * dy).sqrt()
  }
}

#[napi]
pub struct Vec3 {
  pub x: f64,
  pub y: f64,
  pub z: f64,
}

#[napi]
impl Vec3 {
  #[napi(constructor)]
  pub fn new(x: f64, y: f64, z: f64) -> Self {
    Vec3 { x, y, z }
  }

  #[napi(factory)]
  pub fn zero() -> Vec3 {
    Vec3 { x: 0.0, y: 0.0, z: 0.0 }
  }

  #[napi]
  pub fn magnitude(&self) -> f64 {
    (self.x * self.x + self.y * self.y + self.z * self.z).sqrt()
  }

  #[napi]
  // angle of vector in radians
  pub fn angle(&self) -> f64 {
    self.z.atan2(self.y)
  }

  #[napi]
  pub fn to_string(&self) -> String {
    format!("Vec3({}, {}, {})", self.x, self.y, self.z)
  }

  #[napi(js_name="toJSON")]
  pub fn to_json(&self) -> String {
    json!({
      "x": self.x,
      "y": self.y,
      "z": self.z,
    }).to_string()
  }

  #[napi]
  pub fn add(&mut self, other: &Vec3) {
    self.x += other.x;
    self.y += other.y;
    self.z += other.z;
  }

  #[napi]
  pub fn sub(&mut self, other: &Vec3) {
    self.x -= other.x;
    self.y -= other.y;
    self.z -= other.z;
  }

  #[napi]
  pub fn mul(&mut self, other: &Vec3) {
    self.x *= other.x;
    self.y *= other.y;
    self.z *= other.z;
  }

  #[napi]
  pub fn div(&mut self, other: &Vec3) {
    self.x /= other.x;
    self.y /= other.y;
    self.z /= other.z;
  }

  #[napi]
  // angle is in radians
  pub fn rotate(&mut self, angle: f64) {
    let cos = angle.cos();
    let sin = angle.sin();
    let x = self.x;
    let y = self.y;
    let z = self.z;
    self.x = x * cos - y * sin;
    self.y = x * sin + y * cos;
    self.z = z;
  }

  #[napi]
  pub fn normalize(&mut self) {
    let mag = self.magnitude();
    self.x /= mag;
    self.y /= mag;
    self.z /= mag;
  }

  #[napi]
  pub fn distance(&self, other: &Vec3) -> f64 {
    let dx = self.x - other.x;
    let dy = self.y - other.y;
    let dz = self.z - other.z;
    (dx * dx + dy * dy + dz * dz).sqrt()
  }
}

#[napi]
pub struct Vec5 {
  pub x: f64,
  pub y: f64,
  pub z: f64,
  pub yaw: f64,
  pub pitch: f64,
}

#[napi]
impl Vec5 {
  #[napi(constructor)]
  pub fn new(x: f64, y: f64, z: f64, yaw: f64, pitch: f64) -> Self {
    Vec5 { x, y, z, yaw, pitch }
  }

  #[napi(factory)]
  pub fn zero() -> Vec5 {
    Vec5 { x: 0.0, y: 0.0, z: 0.0, yaw: 0.0, pitch: 0.0 }
  }

  #[napi]
  pub fn magnitude(&self) -> f64 {
    (self.x * self.x + self.y * self.y + self.z * self.z).sqrt()
  }

  #[napi]
  // angle of vector in radians
  pub fn angle(&self) -> f64 {
    self.z.atan2(self.y)
  }

  #[napi]
  pub fn to_string(&self) -> String {
    format!("Vec5({}, {}, {}, {}, {})", self.x, self.y, self.z, self.yaw, self.pitch)
  }

  #[napi(js_name="toJSON")]
  pub fn to_json(&self) -> String {
    json!({
      "x": self.x,
      "y": self.y,
      "z": self.z,
      "yaw": self.yaw,
      "pitch": self.pitch,
    }).to_string()
  }

  #[napi]
  pub fn add(&mut self, other: &Vec5) {
    self.x += other.x;
    self.y += other.y;
    self.z += other.z;
    self.yaw += other.yaw;
    self.pitch += other.pitch;
  }

  #[napi]
  pub fn sub(&mut self, other: &Vec5) {
    self.x -= other.x;
    self.y -= other.y;
    self.z -= other.z;
    self.yaw -= other.yaw;
    self.pitch -= other.pitch;
  }

  #[napi]
  pub fn mul(&mut self, other: &Vec5) {
    self.x *= other.x;
    self.y *= other.y;
    self.z *= other.z;
    self.yaw *= other.yaw;
    self.pitch *= other.pitch;
  }

  #[napi]
  pub fn div(&mut self, other: &Vec5) {
    self.x /= other.x;
    self.y /= other.y;
    self.z /= other.z;
    self.yaw /= other.yaw;
    self.pitch /= other.pitch;
  }

  #[napi]
  pub fn rotate(&mut self, angle: f64) {
    let cos = angle.cos();
    let sin = angle.sin();
    let x = self.x;
    let y = self.y;
    let z = self.z;
    self.x = x * cos - y * sin;
    self.y = x * sin + y * cos;
    self.z = z;
  }

  #[napi]
  pub fn normalize(&mut self) {
    let mag = self.magnitude();
    self.x /= mag;
    self.y /= mag;
    self.z /= mag;
  }

  #[napi]
  pub fn distance(&self, other: &Vec5) -> f64 {
    let dx = self.x - other.x;
    let dy = self.y - other.y;
    let dz = self.z - other.z;
    let dyaw = self.yaw - other.yaw;
    let dpitch = self.pitch - other.pitch;
    (dx * dx + dy * dy + dz * dz + dyaw * dyaw + dpitch * dpitch).sqrt()
  }

  #[napi]
  pub fn to_vec3(&self) -> Vec3 {
    Vec3 { x: self.x, y: self.y, z: self.z }
  }

  #[napi]
  pub fn to_vec2(&self) -> Vec2 {
    Vec2 { x: self.x, y: self.y }
  }

  #[napi]
  pub fn intersects_with(&self, _other: &Vec3) -> bool {
    // Test if a ray from the origin intersects with the point
    // TODO
    false
  }
}
