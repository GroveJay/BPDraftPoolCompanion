import { RankFileToKey } from "./utilities.ts";
import type { PlacedRoom, ROOM_DIRECTORY_CATEGORY_TYPE } from "./types.ts";
import { ROOM_TYPE, ROOM_DIRECTORY_CATEGORY } from "./types.ts";
import { ROOM_NAME, type ROOM_NAME_TYPE } from "./roomName";

export const MAX_RANK = 9;
export const MIN_RANK = 1;
export const MIN_FILE = 0;
export const MAX_FILE = 4;

export const RARITY_MAP: {[key: number]: string} = {
	1: 'Commonplace',
	2: 'Standard',
	3: 'Unusual',
	4: 'Rare',
}

export const ROOM_TYPES_ARRAY = Object.keys(ROOM_TYPE).map(a => { return a as keyof typeof ROOM_TYPE });
export const ROOM_DIRECTORY_CATEGORY_ARRAY = Object.keys(ROOM_DIRECTORY_CATEGORY).map(a => { return a as keyof typeof ROOM_DIRECTORY_CATEGORY });
const ROOM_NAME_ARRAY = Object.keys(ROOM_NAME).map(a => { return a as keyof typeof ROOM_NAME });

export const ROOM_CATEGORIES: [ROOM_DIRECTORY_CATEGORY_TYPE, number, number][] = [
	[ROOM_DIRECTORY_CATEGORY.NUMBERED, 0, 46],
	[ROOM_DIRECTORY_CATEGORY.BEDROOM, 46, 46 + 8],
	[ROOM_DIRECTORY_CATEGORY.HALLWAY, 46 + 8, 46 + 8 + 8],
	[ROOM_DIRECTORY_CATEGORY.GREEN, 46 + 8 + 8, 46 + 8 + 8 + 8],
	[ROOM_DIRECTORY_CATEGORY.SHOP, 46 + 8 + 8 + 8, 46 + 8 + 8 + 8 + 8],
	[ROOM_DIRECTORY_CATEGORY.RED, 46 + 8 + 8 + 8 + 8, 46 + 8 + 8 + 8 + 8 + 8],
	[ROOM_DIRECTORY_CATEGORY.ADDITION, 46 + 8 + 8 + 8 + 8 + 8, 46 + 8 + 8 + 8 + 8 + 8 + 8],
	[ROOM_DIRECTORY_CATEGORY.FOUND, 46 + 8 + 8 + 8 + 8 + 8 + 8, 46 + 8 + 8 + 8 + 8 + 8 + 8 + 8],
	[ROOM_DIRECTORY_CATEGORY.OUTER, 46 + 8 + 8 + 8 + 8 + 8 + 8 + 8, 46 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8],
];
export const ROOM_CATEGORY_MAP: Map<ROOM_DIRECTORY_CATEGORY_TYPE,ROOM_NAME_TYPE[]> = new Map(
	ROOM_CATEGORIES.map(
	([category, start, end]): [ROOM_DIRECTORY_CATEGORY_TYPE, ROOM_NAME_TYPE[]] => {
		return [
			category,
			ROOM_NAME_ARRAY.slice(start, end).map(roomNameEnum => ROOM_NAME[roomNameEnum])
		];
	},
	[]
));

export const UPGRADES: { [key in ROOM_NAME_TYPE]?: ROOM_NAME_TYPE[] } = {
	[ROOM_NAME.SPARE_ROOM]: [ROOM_NAME.SPARE_BEDROOM],
	[ROOM_NAME.PARLOR]: [ROOM_NAME.PARLOR_UPGRADE_A],
	[ROOM_NAME.BREAK_ROOM]: [ROOM_NAME.GAME_ROOM],
	[ROOM_NAME.CLOSET]: [ROOM_NAME.HALLWAY_CLOSET],
	[ROOM_NAME.STOREROOM]: [ROOM_NAME.STOREROOM_UPGRADE_A],
	[ROOM_NAME.NOOK]: [ROOM_NAME.NOOK_UPGRADE_A],
	[ROOM_NAME.AQUARIUM]: [ROOM_NAME.ELECTRIC_EEL_AQUARIUM],
	[ROOM_NAME.BOUDOIR]: [ROOM_NAME.BOUDOIR_UPGRADE_A],
	[ROOM_NAME.GUEST_BEDROOM]: [ROOM_NAME.QUEST_BEDROOM],
	[ROOM_NAME.NURSERY]: [ROOM_NAME.INDOOR_NURSERY],
	[ROOM_NAME.HALLWAY]: [ROOM_NAME.HALLWAY_UPGRADE_A],
	[ROOM_NAME.COURTYARD]: [ROOM_NAME.COURTYARD_UPGRADE_A],
	[ROOM_NAME.CLOISTER]: [ROOM_NAME.CLOISTER_OF_DAUJA],
	[ROOM_NAME.MAIL_ROOM]: [ROOM_NAME.MAIL_ROOM_UPGRADE_A],
}

export const ROOM_46_RANK_FILE_KEY = RankFileToKey({ rank: 10, file: 2 });
export const ANTECHAMBER_RANK_FILE_KEY = RankFileToKey({ rank: 9, file: 2 });
export const ENTRANCE_HALL_RANK_FILE_KEY = RankFileToKey({ rank: 1, file: 2 });
export const OUTER_ROOM_RANK_FILE_KEY = RankFileToKey({ rank: -1, file: -1 });

export const DEFAULT_MANOR_PLACED_ROOMS: [string, PlacedRoom][] = [
	[ROOM_46_RANK_FILE_KEY, { roomName: ROOM_NAME.ROOM_46, rotation: 0 }],
	[ANTECHAMBER_RANK_FILE_KEY, { roomName: ROOM_NAME.ANTECHAMBER, rotation: 0 }],
	[ENTRANCE_HALL_RANK_FILE_KEY, { roomName: ROOM_NAME.ENTRANCE_HALL, rotation: 0 }]
];

export const ALL_ROOM_NAMES = Object.values(ROOM_NAME);