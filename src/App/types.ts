import type { ROOM_NAME_TYPE } from "./roomName";

export const ROOM_TYPE = {
	PERMANENT: "Permanent",
	BLUEPRINT: "Blueprint",
	BEDROOM: "Bedroom",
	UPGRADE: "Upgrade",
	PUZZLE: "Puzzle",
	TOMORROW: "Tomorrow",
	DEAD_END: "Dead End",
	FAKE_DEAD_END: "\"Dead End\"",
	SPREAD: "Spread",
	ADDITION: "Addition",
	ENTRY: "Entry",
	DRAFTING: "Drafting",
	MECHANICAL: "Mechanical",
	RED: "Red Room",
	GREEN: "Green Room",
	HALLWAY: "Hallway",
	SHOP: "Shop",
	BLACKPRINT: "Blackprint",
	OBJECTIVE: "Objective",
	OUTER_ROOM: "Outer Room",
	UNPLACED: "Unplaced",
	UNPLACED_SELECTED: "Unplaced Selected",
	NONE: "None"
}

export type ROOM_TYPE_TYPE = typeof ROOM_TYPE[keyof typeof ROOM_TYPE];

export const ROOM_DIRECTORY_CATEGORY = {
	NUMBERED: "Numbered",
	BEDROOM: "Bedrooms",
	HALLWAY: "Hallways",
	GREEN: "Green",
	SHOP: "Shops",
	RED: "Red",
	ADDITION: "Additions",
	FOUND: "Found",
	ARCHIVED: "Archived",
	OUTER: "Outer Room",
}

export type ROOM_DIRECTORY_CATEGORY_TYPE = typeof ROOM_DIRECTORY_CATEGORY[keyof typeof ROOM_DIRECTORY_CATEGORY];

export interface Settings {
	Inheritance: boolean;
	ConservatoryDraftingMemo: boolean;
	DoubleBoudoir: boolean;
	DoubleObservatory: boolean;
	WestGate: boolean;
	DiscoveredRooms: ROOM_NAME_TYPE[];
	FoundationLocation: string;
	FoundationRotation: number;
	Shrine: boolean;
	BlessingoftheGardener: boolean;
}

export interface Room {
	displayName: string
	doors: number;
	types: ROOM_TYPE_TYPE[];
	rarity: number;
	gemCost: number;
	shortName: string;
	gems: number;
	keys: number;
}

export interface Doors {
	top: boolean;
	right: boolean;
	left: boolean;
	bottom: boolean;
}

export interface RankFile {
	rank: number;
	file: number;
}

export interface PlacedRoom {
	roomName: ROOM_NAME_TYPE;
	rotation: number;
}