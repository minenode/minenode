// DataTypes.ts - defines and interacts with various data types
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

export enum GameMode {
  NONE = -1,
  SURVIVAL = 0,
  CREATIVE = 1,
  ADVENTURE = 2,
  SPECTATOR = 3,
}

export enum Difficulty {
  PEACEFUL = 0,
  EASY = 1,
  NORMAL = 2,
  HARD = 3,
}

export enum PluginChannel {
  MINECRAFT_BRAND = "minecraft:brand",
}

export enum EntityAction {
  START_SNEAKING = 0,
  STOP_SNEAKING = 1,
  LEAVE_BED = 2,
  START_SPRINTING = 3,
  STOP_SPRINTING = 4,
  START_HORSE_JUMP = 5,
  STOP_HORSE_JUMP = 6,
  OPEN_HORSE_INVENTORY = 7,
  START_ELYTA_FLIGHT = 8,
}

export enum InventoryHotbarSlot {
  SLOT_1 = 0,
  SLOT_2 = 1,
  SLOT_3 = 2,
  SLOT_4 = 3,
  SLOT_5 = 4,
  SLOT_6 = 5,
  SLOT_7 = 6,
  SLOT_8 = 7,
  SLOT_9 = 8,
}

export enum AllEntityStatus {
  // Entity
  ENTITY__HONEY_BLOCK_SLIDE_PARTICLES = 0,
  // Snowball (Entity)
  SNOWBALL__POOF_PARTICLES = 3,
  // Egg (Entity)
  EGG__ICONCRACK_PARTICLES = 3,
  // Fishing Hook (Entity)
  FISHING_HOOK__PULL_PLAYER = 31,
  // Abstract Arrow (Entity)
  // Arrow (Abstract Arrow)
  ARROW__TIPPED_ARROW_PARTICLES = 0,
  // Firework Rocket (Entity)
  FIREWORK_ROCKET__EXPLOSION_EFFECT = 17,
  // Living Entity (Entity)
  LIVING_ENTITY__HURT_ANIMATION_AND_SOUND = 2,
  LIVING_ENTITY__DEATH_ANIMATION_AND_SOUND = 3,
  LIVING_ENTITY__SHIELD_BLOCK_SOUND = 29,
  LIVING_ENTITY__SHIELD_BREAK_SOUND = 30,
  LIVING_ENTITY__THORNS_HURT_ANIMATION_AND_SOUND = 33,
  LIVING_ENTITY__TOTEM_OF_UNDYING_ANIMATION_AND_SOUND = 35,
  LIVING_ENTITY__HURT_ANIMATION_AND_DROWN_SOUND = 36,
  LIVING_ENTITY__HURT_ANIMATION_AND_BURN_SOUND = 37,
  LIVING_ENTITY__HURT_ANIMATION_AND_BERRY_BUSH_SOUND = 44,
  LIVING_ENTITY__SPAWN_PORTAL_TELEPORT_PARTICLES = 46,
  LIVING_ENTITY__EQUIPMENT_BREAK_MAIN_HAND = 47,
  LIVING_ENTITY__EQUIPMENT_BREAK_OFF_HAND = 48,
  LIVING_ENTITY__EQUIPMENT_BREAK_HEAD = 49,
  LIVING_ENTITY__EQUIPMENT_BREAK_CHEST = 50,
  LIVING_ENTITY__EQUIPMENT_BREAK_LEGS = 51,
  LIVING_ENTITY__EQUIPMENT_BREAK_FEET = 52,
  LIVING_ENTITY__HONEY_BLOCK_FALL_PARTICLES = 54,
  LIVING_ENTITY__SWAP_HANDS = 55,
  LIVING_ENTITY__HURT_ANIMATION_AND_FREEZING_SOUND = 57,
  LIVING_ENTITY__DEATH_SMOKE_PARTICLES = 60,
  // Player (Living Entity)
  PLAYER__MARK_ITEM_USE_AS_FINISHED = 9,
  PLAYER__ENABLE_REDUCED_DEBUG_INFO = 22,
  PLAYER__DISABLE_REDUCED_DEBUG_INFO = 23,
  PLAYER__SET_OP_PERMISSION_0 = 24,
  PLAYER__SET_OP_PERMISSION_1 = 25,
  PLAYER__SET_OP_PERMISSION_2 = 26,
  PLAYER__SET_OP_PERMISSION_3 = 27,
  PLAYER__SET_OP_PERMISSION_4 = 28,
  PLAYER__SPAWN_CLOUD_PARTICLES = 43,
  // Armor Stand (Living Entity)
  ARMOR_STAND__HIT_SOUND = 32,
  // Mob (Living Entity)
  MOB__EXPLOSION_PARTICLE = 20,
  // Water Animal (Mob)
  // Squid (Water Animal)
  SQUID__RESET_ROTATION = 19,
  // Dolphin (Water Animal)
  DOLPHIN__HAPPY_PARTICLES = 38,
  // Creature (Mob)
  // Ageable (Creature)
  // Animal (Ageable)
  ANIMAL__LOVE_MODE_PARTICLES = 18,
  // Abstract Horse (Animal)
  ABSTRACT_HORSE__SMOKE_PARTICLES = 6,
  ABSTRACT_HORSE__HEART_PARTICLES = 7,
  // Ocelot (Animal)
  OCELOT__SMOKE_PARTICLES = 40,
  OCELOT__HEART_PARTICLES = 41,
  // Rabbit (Animal)
  RABBIT__ROTATED_JUMP_ANIMATION_AND_PARTICLES = 1,
  // Sheep (Animal)
  SHEEP__GRASS_EATING_ANIMATION = 10,
  // Fox (Animal)
  FOX__EATING_PARTICLES = 45,
  // Goat (Animal)
  GOAT__LOWER_HEAD = 58,
  GOAT__STOP_LOWERING_HEAD = 59,
  // Tameable Animal (Animal)
  TAMEABLE_ANIMAL__SMOKE_PARTICLES = 6,
  TAMEABLE_ANIMAL__HEART_PARTICLES = 7,
  // Wolf (Tameable Animal)
  WOLF__SHAKING_WATER_ANIMATION = 8,
  WOLF__STOP_SHAKING_WATER_ANIMATION = 56,
  // Villager (Ageable)
  VILLAGER__HEART_PARTICLES = 12,
  VILLAGER__ANGRY_PARTICLES = 13,
  VILLAGER__HAPPY_PARTICLES = 14,
  VILLAGER__SPLASH_PARTICLES = 42,
  // Golem (Creature)
  // Iron Golem (Golem)
  IRON_GOLEM__ATTACK_ANIMATION_AND_SOUND = 4,
  IRON_GOLEM__POPPY_ANIMATION = 11,
  IRON_GOLEM__STOP_POPPY_ANIMATION = 34,
  // Evoker Fangs (Entity)
  EVOKER_FANGS__ATTACK_ANIMATION_AND_SOUND = 4,
  // Monster (Creature)
  // Witch (Monster)
  WITCH__MAGIC_PARTICLES = 15,
  // Ravager (Monster)
  RAVAGER__ATTACK_ANIMATION = 4,
  RAVAGER__STUN = 39,
  // Zombie (Monster)
  // Zombie Villager (Zombie)
  ZOMBIE_VILLAGER__CURE_FINISHED_SOUND = 16,
  // Guardian (Monster)
  GUARDIAN__ATTACK_SOUND = 21,
  // Minecart (Entity)
  // Minecart TNT (Minecart)
  MINECART_TNT__IGNITE = 10,
  // Minecart Spawner (Minecart)
  MINECART_SPAWNER__RESET_DELAY = 1,
  // Hoglin (Animal)
  HOGLIN__ATTACK_ANIMATION_AND_SOUND = 4,
  // Zoglin (Monster)
  ZOGLIN__ATTACK_ANIMATION_AND_SOUND = 4,
}

// TODO: Entity type, EntityStatus by type, etc.
