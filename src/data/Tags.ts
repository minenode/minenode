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

export enum TagIdentifier {
  BLOCK = "minecraft:block",
  ENTITY_TYPE = "minecraft:entity_type",
  FLUID = "minecraft:fluid",
  FUNCTION = "minecraft:function",
  GAME_EVENT = "minecraft:game_event",
  ITEM = "minecraft:item",
}

// See: https://minecraft.wiki/w/Tag
// TODO: function types
export enum TagBlockType {
  MINEABLE_AXE = "mineable/axe",
  MINEABLE_HOE = "mineable/hoe",
  MINEABLE_PICKAXE = "mineable/pickaxe",
  MINEABLE_SHOVEL = "mineable/shovel",
  ACACIA_LOGS = "acacia_logs",
  ANIMALS_SPAWNABLE_ON = "animals_spawnable_on",
  ANVIL = "anvil",
  AXOLOTLS_SPAWNABLE_ON = "axolotls_spawnable_on",
  BAMBOO_PLANTABLE_ON = "bamboo_plantable_on",
  BANNERS = "banners",
  BASE_STONE_NETHER = "base_stone_nether",
  BASE_STONE_OVERWORLD = "base_stone_overworld",
  BEACON_BASE_BLOCKS = "beacon_base_blocks",
  BEDS = "beds",
  BEEHIVES = "beehives",
  BEE_GROWABLES = "bee_growables",
  BIG_DRIPLEAF_PLACEABLE = "big_dripleaf_placeable",
  BIRCH_LOGS = "birch_logs",
  BUTTONS = "buttons",
  CAMPFIRES = "campfires",
  CANDLE_CAKES = "candle_cakes",
  CANDLES = "candles",
  CARPETS = "carpets",
  CAULDRONS = "cauldrons",
  CAVE_VINES = "cave_vines",
  CLIMBABLE = "climbable",
  COAL_ORES = "coal_ores",
  COPPER_ORES = "copper_ores",
  CORALS = "corals",
  CORAL_BLOCKS = "coral_blocks",
  CORAL_PLANTS = "coral_plants",
  CRIMSON_STEMS = "crimson_stems",
  CROPS = "crops",
  CRYSTAL_SOUND_BLOCKS = "crystal_sound_blocks",
  DARK_OAK_LOGS = "dark_oak_logs",
  DEEPSLATE_ORE_REPLACEABLES = "deepslate_ore_replaceables",
  DIAMOND_ORES = "diamond_ores",
  DIRT = "dirt",
  DOORS = "doors",
  DRAGON_IMMUNE = "dragon_immune",
  DRIPSTONE_REPLACEABLE_BLOCKS = "dripstone_replaceable_blocks",
  EMERALD_ORES = "emerald_ores",
  ENDERMAN_HOLDABLE = "enderman_holdable",
  FEATURES_CANNOT_REPLACE = "features_cannot_replace",
  FENCE_GATES = "fence_gates",
  FENCES = "fences",
  FIRE = "fire",
  FLOWER_POTS = "flower_pots",
  FLOWERS = "flowers",
  FOXES_SPAWNABLE_ON = "foxes_spawnable_on",
  GEODE_INVALID_BLOCKS = "geode_invalid_blocks",
  GOATS_SPAWNABLE_ON = "goats_spawnable_on",
  GOLD_ORES = "gold_ores",
  GUARDED_BY_PIGLINS = "guarded_by_piglins",
  HOGLIN_REPELLENTS = "hoglin_repellents",
  ICE = "ice",
  IMPERMEABLE = "impermeable",
  INFINIBURN_END = "infiniburn_end",
  INFINIBURN_NETHER = "infiniburn_nether",
  INFINIBURN_OVERWORLD = "infiniburn_overworld",
  INSIDE_STEP_SOUND_BLOCKS = "inside_step_sound_blocks",
  IRON_ORES = "iron_ores",
  JUNGLE_LOGS = "jungle_logs",
  LAPIS_ORES = "lapis_ores",
  LAVA_POOL_CANNOT_REPLACE = "lava_pool_cannot_replace",
  LEAVES = "leaves",
  LOGS = "logs	",
  LOGS_THAT_BURN = "logs_that_burn",
  LUSH_GROUND_REPLACEABLE = "lush_ground_replaceable",
  MOOSHROOMS_SPAWNABLE_ON = "mooshrooms_spawnable_on",
  MOSS_REPLACEABLE = "moss_replaceable",
  MUSHROOM_GROW_BLOCK = "mushroom_grow_block",
  NEEDS_DIAMOND_TOOL = "needs_diamond_tool",
  NEEDS_IRON_TOOL = "needs_iron_tool",
  NEEDS_STONE_TOOL = "needs_stone_tool",
  NON_FLAMMABLE_WOOD = "non_flammable_wood",
  NYLIUM = "nylium",
  OAK_LOGS = "oak_logs",
  OCCLUDES_VIBRATION_SIGNALS = "occludes_vibration_signals",
  PARROTS_SPAWNABLE_ON = "parrots_spawnable_on",
  PIGLIN_REPELLENTS = "piglin_repellents",
  PLANKS = "planks",
  POLAR_BEARS_SPAWNABLE_ON_IN_FROZEN_OCEAN = "polar_bears_spawnable_on_in_frozen_ocean",
  PORTALS = "portals",
  PRESSURE_PLATES = "pressure_plates",
  PREVENT_MOB_SPAWNING_INSIDE = "prevent_mob_spawning_inside",
  RABBITS_SPAWNABLE_ON = "rabbits_spawnable_on",
  RAILS = "rails",
  REDSTONE_ORES = "redstone_ores",
  REPLACEABLE_PLANTS = "replaceable_plants",
  SAND = "sand",
  SAPLINGS = "saplings",
  SHULKER_BOXES = "shulker_boxes",
  SIGNS = "signs",
  SLABS = "slabs",
  SMALL_DRIPLEAF_PLACEABLE = "small_dripleaf_placeable",
  SMALL_FLOWERS = "small_flowers",
  SNOW = "snow",
  SOUL_FIRE_BASE_BLOCKS = "soul_fire_base_blocks",
  SOUL_SPEED_BLOCKS = "soul_speed_blocks",
  SPRUCE_LOGS = "spruce_logs",
  STAIRS = "stairs",
  STANDING_SIGNS = "standing_signs",
  STONE_BRICKS = "stone_bricks",
  STONE_ORE_REPLACEABLES = "stone_ore_replaceables",
  STONE_PRESSURE_PLATES = "stone_pressure_plates",
  STRIDER_WARM_BLOCKS = "strider_warm_blocks",
  TALL_FLOWERS = "tall_flowers",
  TERRACOTTA = "terracotta",
  TRAPDOORS = "trapdoors",
  UNDERWATER_BONEMEALS = "underwater_bonemeals",
  UNSTABLE_BOTTOM_CENTER = "unstable_bottom_center",
  VALID_SPAWN = "valid_spawn",
  WALLS = "walls",
  WALL_CORALS = "wall_corals",
  WALL_POST_OVERRIDE = "wall_post_override",
  WALL_SIGNS = "wall_signs",
  WARPED_STEMS = "warped_stems",
  WART_BLOCKS = "wart_blocks",
  WITHER_IMMUNE = "wither_immune",
  WITHER_SUMMON_BASE_BLOCKS = "wither_summon_base_blocks",
  WOLVES_SPAWNABLE_ON = "wolves_spawnable_on",
  WOODEN_BUTTONS = "wooden_buttons",
  WOODEN_DOORS = "wooden_doors",
  WOODEN_FENCES = "wooden_fences",
  WOODEN_PRESSURE_PLATES = "wooden_pressure_plates",
  WOODEN_SLABS = "wooden_slabs",
  WOODEN_STAIRS = "wooden_stairs",
  WOODEN_TRAPDOORS = "wooden_trapdoors",
  WOOL = "wool",
}

export enum TagEntityType {
  ARROWS = "arrows",
  AXOLOTL_ALWAYS_HOSTILES = "axolotl_always_hostiles",
  AXOLOTL_HUNT_TARGETS = "axolotl_hunt_targets",
  BEEHIVE_INHABITORS = "beehive_inhabitors",
  FREEZE_HURTS_EXTRA_TYPES = "freeze_hurt_extra_types",
  FREEZE_IMMUNE_ENTITY_TYPES = "freeze_immune_entity_types",
  IMPACT_PROJECTILES = "impact_projectiles",
  POWDER_SNOW_WALKABLE_MOBS = "powder_snow_walkable_mobs",
  RAIDERS = "raiders",
  SKELETONS = "skeletons",
}

export enum TagFluidType {
  LAVA = "lava",
  WATER = "water",
}

export enum TagGameEventType {
  IGNORE_VIBRATIONS_SNEAKING = "ignore_vibrations_sneaking",
  VIBRATIONS = "vibrations",
}

export enum TagItemType {
  ACACIA_LOGS = "acacia_logs",
  ANVIL = "anvil",
  ARROWS = "arrows",
  AXOLOTL_TEMPT_ITEMS = "axolotl_tempt_items",
  BANNERS = "banners",
  BEACON_PAYMENT_ITEMS = "beacon_payment_items",
  BEDS = "beds",
  BIRCH_LOGS = "birch_logs",
  BOATS = "boats",
  BUTTONS = "buttons",
  CANDLES = "candles",
  CARPETS = "carpets",
  CLUSTER_MAX_HARVESTABLES = "cluster_max_harvestables",
  COAL_ORES = "coal_ores",
  COALS = "coals",
  COPPER_ORES = "copper_ores",
  CREEPER_DROP_MUSIC_DISCS = "creeper_drop_music_discs",
  CRIMSON_STEMS = "crimson_stems",
  DARK_OAK_LOGS = "dark_oak_logs",
  DIAMOND_ORES = "diamond_ores",
  DIRT = "dirt",
  DOORS = "doors",
  EMERALD_ORES = "emerald_ores",
  FENCES = "fences",
  FISHES = "fishes",
  FLOWERS = "flowers",
  FOX_FOOD = "fox_food",
  FREEZE_IMMUNE_WEARABLES = "freeze_immune_wearables",
  GOLD_ORES = "gold_ores",
  IGNORED_BY_PIGLIN_BABIES = "ignored_by_piglin_babies",
  IRON_ORES = "iron_ores",
  JUNGLE_LOGS = "jungle_logs",
  LAPIS_ORES = "lapis_ores",
  LEAVES = "leaves",
  LECTERN_BOOKS = "lectern_books",
  LOGS = "logs",
  LOGS_THAT_BURN = "logs_that_burn",
  MUSIC_DISCS = "music_discs",
  NON_FLAMMABLE_WOOD = "non_flammable_wood",
  OAK_LOGS = "oak_logs",
  OCCLUDES_VIBRATION_SIGNALS = "occludes_vibration_signals",
  PIGLIN_FOOD = "piglin_food",
  PIGLIN_LOVED = "piglin_loved",
  PIGLIN_REPELLENTS = "piglin_repellents",
  PLANKS = "planks",
  RAILS = "rails",
  REDSTONE_ORES = "redstone_ores",
  SAND = "sand",
  SAPLINGS = "saplings",
  SIGNS = "signs",
  SLABS = "slabs",
  SMALL_FLOWERS = "small_flowers",
  SOUL_FIRE_BASE_BLOCKS = "soul_fire_base_blocks",
  SPRUCE_LOGS = "spruce_logs",
  STAIRS = "stairs",
  STONE_BRICKS = "stone_bricks",
  STONE_CRAFTING_MATERIALS = "stone_crafting_materials",
  STONE_TOOL_MATERIALS = "stone_tool_materials",
  TALL_FLOWERS = "tall_flowers",
  TERRACOTTA = "terracotta",
  TRAPDOORS = "trapdoors",
  WALLS = "walls",
  WARPED_STEMS = "warped_stems",
  WOODEN_BUTTONS = "wooden_buttons",
  WOODEN_FENCES = "wooden_fences",
  WOODEN_PRESSURE_PLATES = "wooden_pressure_plates",
  WOODEN_SLABS = "wooden_slabs",
  WOODEN_STAIRS = "wooden_stairs",
  WOODEN_TRAPDOORS = "wooden_trapdoors",
  WOOL = "wool",
}

export type TagType<T extends TagIdentifier = TagIdentifier> = T extends TagIdentifier.BLOCK
  ? TagBlockType
  : T extends TagIdentifier.ENTITY_TYPE
  ? TagEntityType
  : T extends TagIdentifier.FLUID
  ? TagFluidType
  : T extends TagIdentifier.GAME_EVENT
  ? TagGameEventType
  : T extends TagIdentifier.ITEM
  ? TagItemType
  : never; // TODO: add more types

// See: https://minecraft.wiki/w/Tag
export class Tag<T extends TagType = TagType> {
  public readonly items: string[];
  public readonly type: T;

  public constructor(type: T, items: string[] = []) {
    // TODO: identifier type
    this.type = type;
    this.items = items;
  }
}
