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

use napi::bindgen_prelude::*;
use napi_derive::napi;

use crate::geometry::Vec3;

fn bigint_value(value: &BigInt) -> i64 {
  if value.words.len() == 0 {
    0
  } else {
    let (f, v, _) = value.get_u64();
    if f { -(v as i128) as i64 } else { v as i64 }
  }
}
#[napi]
pub struct MineBuffer {
  buf: Vec<u8>,
  r_pos: usize,
  w_pos: usize,
}

#[napi]
impl MineBuffer {
  #[napi(constructor)]
  pub fn new(buf: Option<Buffer>) -> Self {
    let vec = buf.map_or(Vec::new(), |b| b.to_vec());
    let len = vec.len();
    return Self {
      buf: vec,
      r_pos: 0,
      w_pos: len,
    }
  }

  pub fn reserve(&mut self, size: usize) {
    self.buf.reserve(size);
  }

  #[napi(js_name="reserve")]
  pub fn reserve_js(&mut self, size: i64) {
    self.reserve(size as usize);
  }

  pub fn get_buffer(&self) -> &[u8] {
    &self.buf[self.r_pos..self.w_pos]
  }

  #[napi(js_name = "getBuffer")]
  pub fn get_buffer_js(&self) -> Buffer {
    if self.r_pos >= self.w_pos {
      return Buffer::from(vec![]);
    }
    Buffer::from(&self.buf[self.r_pos..self.w_pos])
  }

  pub fn remaining(&self) -> usize {
    self.w_pos - self.r_pos
  }

  #[napi(js_name = "remaining")]
  pub fn remaining_js(&self) -> u32 {
    self.remaining() as u32
  }

  #[napi(js_name = "readOffset", getter)]
  pub fn read_offset(&self) -> u32 {
    self.r_pos as u32
  }

  #[napi(js_name = "readOffset", setter)]
  pub fn set_read_offset(&mut self, offset: u32) {
    self.r_pos = offset as usize;
  }

  #[napi(js_name = "writeOffset", getter)]
  pub fn write_offset(&self) -> u32 {
    self.w_pos as u32
  }

  #[napi(js_name = "writeOffset", setter)]
  pub fn set_write_offset(&mut self, offset: u32) {
    self.w_pos = offset as usize;
  }

  #[napi(factory)]
  pub fn clone(&self) -> Self {
    Self {
      buf: self.buf.clone(),
      r_pos: self.r_pos,
      w_pos: self.w_pos,
    }
  }

  #[napi]
  pub fn reset(&mut self) {
    self.buf.clear();
    self.r_pos = 0;
    self.w_pos = 0;
  }

  pub fn peek_u8(&self) -> Result<u8> {
    if self.r_pos < self.w_pos {
      Ok(self.buf[self.r_pos as usize])
    } else {
      Err(Error::new(Status::GenericFailure, "Buffer underflow".into()))
    }
  }

  #[napi(js_name = "peekUByte")]
  pub fn peek_u8_js(&self) -> Result<i32> {
    self.peek_u8().map(|v| v as i32)
  }

  pub fn seek_delta(&mut self, delta: i64) -> Result<()> {
    if self.r_pos + (delta as usize) <= self.w_pos {
      self.r_pos += delta as usize;
      Ok(())
    } else {
      Err(Error::new(Status::GenericFailure, "Buffer underflow".into()))
    }
  }

  #[napi(js_name = "seekDelta")]
  pub fn seek_delta_js(&mut self, delta: i64) -> Result<()> {
    self.seek_delta(delta)
  }

  pub fn read_u8(&mut self) -> Result<u8> {
    if self.r_pos < self.w_pos {
      let res = self.buf[self.r_pos as usize];
      self.r_pos += 1;
      Ok(res)
    } else {
      Err(Error::new(Status::GenericFailure, "Buffer underflow".into()))
    }
  }

  #[napi(js_name = "readUByte")]
  pub fn read_u8_js(&mut self) -> Result<i32> {
    self.read_u8().map(|v| v as i32)
  }

  pub fn read_bytes(&mut self, len: usize) -> Result<Vec<u8>> {
    if len == 0 {
      return Err(Error::new(Status::GenericFailure, "read_bytes called with length of 0".into()));
    }
    if self.remaining() >= len {
      let res = self.buf[self.r_pos..(self.r_pos + len)].to_vec();
      self.r_pos += len;
      Ok(res)
    } else {
      Err(Error::new(Status::GenericFailure, "Buffer underflow".into()))
    }
  }

  #[napi(js_name = "readBytes")]
  pub fn read_bytes_js(&mut self, len: u32) -> Result<Buffer> {
    let len = len as usize;
    let res = self.read_bytes(len)?;
    Ok(Buffer::from(res))
  }

  pub fn read_remaining(&mut self) -> Result<Vec<u8>> {
    let len = self.remaining();
    self.read_bytes(len)
  }

  #[napi(js_name = "readRemaining")]
  pub fn read_remaining_js(&mut self) -> Result<Buffer> {
    let remaining = self.read_remaining()?;
    Ok(Buffer::from(remaining))
  }

  pub fn read_i8(&mut self) -> Result<i8> {
    if self.r_pos < self.w_pos {
      // TODO: check wrap around
      let res = self.buf[self.r_pos as usize] as i8; 
      self.r_pos += 1;
      Ok(res)
    } else {
      Err(Error::new(Status::GenericFailure, "Buffer underflow".into()))
    }
  }

  #[napi(js_name = "readByte")]
  pub fn read_i8_js(&mut self) -> Result<i32> {
    self.read_i8().map(|v| v as i32)
  }

  #[napi(js_name="readBoolean")]
  pub fn read_bool(&mut self) -> Result<bool> {
    if self.r_pos < self.w_pos {
      let res = self.buf[self.r_pos as usize] != 0;
      self.r_pos += 1;
      Ok(res)
    } else {
      Err(Error::new(Status::GenericFailure, "Buffer underflow".into()))
    }
  }

  #[napi(js_name="readInt")]
  pub fn read_i32(&mut self) -> Result<i32> {
    if self.r_pos + 4 <= self.w_pos {
      let res = i32::from_be_bytes(self.buf[self.r_pos as usize..(self.r_pos + 4) as usize].try_into().unwrap());
      self.r_pos += 4;
      Ok(res)
    } else {
      Err(Error::new(Status::GenericFailure, "Buffer underflow".into()))
    }
  }

  #[napi(js_name="readUInt")]
  pub fn read_u32(&mut self) -> Result<u32> {
    if self.r_pos + 4 <= self.w_pos {
      let res = u32::from_be_bytes(self.buf[self.r_pos as usize..(self.r_pos + 4) as usize].try_into().unwrap());
      self.r_pos += 4;
      Ok(res)
    } else {
      Err(Error::new(Status::GenericFailure, "Buffer underflow".into()))
    }
  }

  #[napi(js_name="readLong",ts_return_type="bigint")]
  pub fn read_i64(&mut self) -> Result<i64n> {
    if self.r_pos + 8 <= self.w_pos {
      let res = i64::from_be_bytes(self.buf[self.r_pos as usize..(self.r_pos + 8) as usize].try_into().unwrap());
      self.r_pos += 8;
      Ok(i64n(res))
    } else {
      Err(Error::new(Status::GenericFailure, "Buffer underflow".into()))
    }
  }

  #[napi(js_name="readULong",ts_return_type="bigint")]
  pub fn read_u64(&mut self) -> Result<i128> {
    if self.r_pos + 8 <= self.w_pos {
      let res = u64::from_be_bytes(self.buf[self.r_pos as usize..(self.r_pos + 8) as usize].try_into().unwrap());
      self.r_pos += 8;
      Ok(res as i128)
    } else {
      Err(Error::new(Status::GenericFailure, "Buffer underflow".into()))
    }
  }

  pub fn read_f32(&mut self) -> Result<f32> {
    if self.r_pos + 4 <= self.w_pos {
      let res = f32::from_be_bytes(self.buf[self.r_pos as usize..(self.r_pos + 4) as usize].try_into().unwrap());
      self.r_pos += 4;
      Ok(res)
    } else {
      Err(Error::new(Status::GenericFailure, "Buffer underflow".into()))
    }
  }

  #[napi(js_name="readFloat")]
  pub fn read_f32_js(&mut self) -> Result<f64> {
    self.read_f32().map(|v| v as f64)
  }

  #[napi(js_name="readDouble")]
  pub fn read_f64(&mut self) -> Result<f64> {
    if self.r_pos + 8 <= self.w_pos {
      let res = f64::from_be_bytes(self.buf[self.r_pos as usize..(self.r_pos + 8) as usize].try_into().unwrap());
      self.r_pos += 8;
      Ok(res)
    } else {
      Err(Error::new(Status::GenericFailure, "Buffer underflow".into()))
    }
  }

  #[napi(js_name="readVarInt")]
  pub fn read_var_int(&mut self) -> Result<i32> {
    let mut res = 0;
    let mut shift = 0;
    loop {
      if self.r_pos >= self.w_pos {
        return Err(Error::new(Status::GenericFailure, "Buffer underflow".into()));
      }
      let b = self.buf[self.r_pos as usize];
      self.r_pos += 1;
      res |= ((b & 0x7f) as i32) << shift;
      if b & 0x80 == 0 {
        break;
      }
      shift += 7;
    }
    Ok(res)
  }

  #[napi(js_name="readVarLong")]
  pub fn read_var_long(&mut self) -> Result<i64n> {
    let mut res = 0;
    let mut shift = 0;
    loop {
      if self.r_pos >= self.w_pos {
        return Err(Error::new(Status::GenericFailure, "Buffer underflow".into()));
      }
      let b = self.buf[self.r_pos as usize];
      self.r_pos += 1;
      res |= ((b & 0x7f) as i64) << shift;
      if b & 0x80 == 0 {
        break;
      }
      shift += 7;
    }
    Ok(i64n(res))
  }

  #[napi(js_name="readString")]
  pub fn read_string(&mut self) -> Result<String> {
    let len = self.read_var_int()?;
    self.read_bytes(len as usize).map(|v| String::from_utf8(v).unwrap())
  }

  pub fn read_i16(&mut self) -> Result<i16> {
    if self.r_pos + 2 <= self.w_pos {
      let res = i16::from_be_bytes(self.buf[self.r_pos as usize..(self.r_pos + 2) as usize].try_into().unwrap());
      self.r_pos += 2;
      Ok(res)
    } else {
      Err(Error::new(Status::GenericFailure, "Buffer underflow".into()))
    }
  }

  #[napi(js_name="readShort")]
  pub fn read_i16_js(&mut self) -> Result<i32> {
    self.read_i16().map(|v| v as i32)
  }

  pub fn read_u16(&mut self) -> Result<u16> {
    if self.r_pos + 2 <= self.w_pos {
      let res = u16::from_be_bytes(self.buf[self.r_pos as usize..(self.r_pos + 2) as usize].try_into().unwrap());
      self.r_pos += 2;
      Ok(res)
    } else {
      Err(Error::new(Status::GenericFailure, "Buffer underflow".into()))
    }
  }

  #[napi(js_name="readUShort")]
  pub fn read_u16_js(&mut self) -> Result<u32> {
    self.read_u16().map(|v| v as u32)
  }

  #[napi(js_name="readPosition")]
  pub fn read_position(&mut self) -> Result<Vec3> {
    let val = self.read_u64()?;

    let x = ((val >> 38) & 0x3FFFFFF) as i32;
    let y = (val & 0xFFF) as i32;
    let z = ((val >> 12) & 0x3FFFFFF) as i32;

    let x = if x & 0x2000000 != 0 { x | !0x3FFFFFF } else { x };
    let y = if y & 0x800 != 0 { y | !0xFFF } else { y };
    let z = if z & 0x2000000 != 0 { z | !0x3FFFFFF } else { z };

    Ok(Vec3::new(x as f64, y as f64, z as f64))
}

  #[napi(js_name="readUUID")]
  pub fn read_uuid(&mut self) -> Result<String> {
    let bytes: [u8; 16] = self.read_bytes(16)?.try_into().unwrap();
    Ok(uuid::Uuid::from_bytes(bytes).to_string())
  }  

  // TODO: implement NBT

  pub fn write(&mut self, buf: &[u8]) {
    self.buf.extend_from_slice(buf);
    self.w_pos += buf.len();
  }

  #[napi(js_name="writeBytes")]
  pub fn write_js(&mut self, buf: Buffer) {
    self.write(buf.to_vec().as_slice());
  }

  pub fn write_u8(&mut self, val: u8) {
    self.buf.push(val);
    self.w_pos += 1;
  }

  #[napi(js_name="writeUByte")]
  pub fn write_byte_js(&mut self, val: i32) {
    self.write_u8(val as u8);
  }

  pub fn write_i8(&mut self, val: i8) {
    self.buf.push(val as u8);
    self.w_pos += 1;
  }

  #[napi(js_name="writeByte")]
  pub fn write_i8_js(&mut self, val: i32) {
    self.write_i8(val as i8);
  }

  #[napi(js_name="writeBoolean")]
  pub fn write_bool(&mut self, val: bool) {
    self.write_u8(if val { 1 } else { 0 });
  }

  pub fn write_float(&mut self, val: f32) {
    self.write(&val.to_be_bytes());
  }

  #[napi(js_name="writeFloat")]
  pub fn write_float_js(&mut self, val: f64) {
    self.write_float(val as f32);
  }

  #[napi(js_name="writeDouble")]
  pub fn write_double(&mut self, val: f64) {
    self.write(&val.to_be_bytes());
  }

  #[napi(js_name="writeInt")]
  pub fn write_i32(&mut self, val: i32) {
    self.write(&val.to_be_bytes());
  }

  #[napi(js_name="writeUInt")]
  pub fn write_u32(&mut self, val: u32) {
    self.write(&val.to_be_bytes());
  }

  #[napi(js_name="writeLong")]
  pub fn write_i64(&mut self, val: BigInt) {
    let val = bigint_value(&val);
    self.write(&val.to_be_bytes());
  }

  #[napi(js_name="writePosition")]
  pub fn write_position(&mut self, val: &Vec3) {
    let x = val.x as i64;
    let y = val.y as i64;
    let z = val.z as i64;
    let val = ((x & 0x3FFFFFF) << 38) | ((z & 0x3FFFFFF) << 12) | (y & 0xFFF);
    self.write(&val.to_be_bytes());
  }

  #[napi(js_name="writeUUID")]
  pub fn write_uuid(&mut self, val: String) -> Result<()> {
    let uuid = uuid::Uuid::parse_str(&val).unwrap();
    self.write(uuid.as_bytes());
    Ok(())
  }

  // TODO: NBT

  pub fn write_i16(&mut self, val: i16) {
    self.write(&val.to_be_bytes());
  }

  #[napi(js_name="writeShort")]
  pub fn write_i16_js(&mut self, val: i32) {
    self.write_i16(val as i16);
  }

  pub fn write_u16(&mut self, val: u16) {
    self.write(&val.to_be_bytes());
  }

  #[napi(js_name="writeUShort")]
  pub fn write_u16_js(&mut self, val: u32) {
    self.write_u16(val as u16);
  }

  #[napi(js_name="writeVarInt")]
  pub fn write_var_int(&mut self, val: i32) {
    let mut val = val;
    loop {
      let mut t = (val & 0b0111_1111) as u8;
      val = (val >> 7) & (i32::MAX >> 6); // >>>
      if val != 0 {
        t |= 0b1000_0000;
      }
      self.write_u8(t);
      if val == 0 {
        break;
      }
    }
  }

  #[napi(js_name="writeVarLong")]
  pub fn write_var_long(&mut self, val: BigInt) {
    let mut val = bigint_value(&val);
    loop {
      let mut t = (val & 0b0111_1111) as u8;
      val = (val >> 7) & (i64::MAX >> 6); // >>>
      if val != 0 {
        t |= 0b1000_0000;
      }
      self.write_u8(t);
      if val == 0 {
        break;
      }
    }
  }

  pub fn write_string(&mut self, val: &str) {
    self.write_var_int(val.len() as i32);
    self.write(val.as_bytes());
  }

  #[napi(js_name="writeString")]
  pub fn write_string_js(&mut self, val: String) {
    self.write_string(&val);
  }

  // TODO: NBT
}
