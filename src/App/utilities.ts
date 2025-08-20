import { createContext, useCallback, useState } from "react";
import { MAX_RANK, ROOM_TYPES_ARRAY, MAX_FILE, MIN_RANK, MIN_FILE, ENTRANCE_HALL_RANK_FILE_KEY, OUTER_ROOM_RANK_FILE_KEY } from "./constants";
import { type Doors, type RankFile, type Settings, type PlacedRoom, ROOM_TYPE } from "./types";
import { ROOM_MAP } from "./roomMap";
import { ROOM_NAME, type ROOM_NAME_TYPE } from "./roomName";

export const DEFAULT_SETTINGS: Settings = {
	Inheritance: false,
	ConservatoryDraftingMemo: false,
	DoubleBoudoir: false,
	DoubleObservatory: false,
	WestGate: false,
	DiscoveredRooms: [],
	FoundationLocation: '',
	FoundationRotation: 0,
	Shrine: false,
	BlessingoftheGardener: false,
};
export const SettingsContext = createContext<Settings>(DEFAULT_SETTINGS);
export const MobileContext = createContext<boolean>(false);

export const RotateDoors = (doors: Doors, rotation: number) => {
	const topRightBottomLeft = [doors.top, doors.right, doors.bottom, doors.left];
	return {
		top: topRightBottomLeft[rotation],
		right: topRightBottomLeft[(1 + rotation) % 4],
		bottom: topRightBottomLeft[(2 + rotation) % 4],
		left: topRightBottomLeft[(3 + rotation) % 4],
	};
}

export const ConvertRoomType = (type: string) => {
	const enumName = ROOM_TYPES_ARRAY.find(k => ROOM_TYPE[k] === type);
	return !enumName
		? undefined
    	: ROOM_TYPE[enumName];
}

const RANK_FILE_KEY_JOINER = '-';
export const RankFileToKey = (rankFile: RankFile) =>
	[rankFile.rank, rankFile.file].join(RANK_FILE_KEY_JOINER);

export const ParseRankFileKey = (rankFileKey: string): RankFile => {
	const parts = rankFileKey.split(RANK_FILE_KEY_JOINER);
	return {
		rank: parseInt(parts[0]),
		file: parseInt(parts[1]),
	};
}

export const RankFileRight = (rankFile: RankFile): RankFile|undefined => {
	const { rank, file } = rankFile;
	return (file + 1 > MAX_RANK)
		? undefined
		: {
			rank,
			file: file + 1,
		};
}

export const RankFileBelow = (rankFile: RankFile): RankFile|undefined => {
	const { rank, file } = rankFile;
	return (rank - 1 < 1)
		? undefined
		: {
			rank: rank - 1,
			file,
		};
}

export const RankFileAbove = (rankFile: RankFile): RankFile|undefined => {
	const { rank, file } = rankFile;
	return (rank + 1 > MAX_RANK)
		? undefined
		: {
			rank: rank + 1,
			file: file,
		};
}

export const RankFileLeft = (rankFile: RankFile): RankFile|undefined => {
	return {
		rank: rankFile.rank,
		file: rankFile.file - 1,
	}
}

// 1 == Bottom only
// 2 == Bottom & Top
// 3 == Bottom & Left
// 4 == Bottom & Right
// 5 == Bottom & Left && Right
// 6 == All
export const GetDoorConfigurationForDoorType = (doorType: number): Doors => {
	return {
		top: doorType === 2 || doorType === 6,
		right: doorType === 4 || doorType === 5 || doorType === 6,
		bottom: doorType !== 0,
		left: doorType === 3 || doorType === 5 || doorType === 6,
	}
}

export const AllAvailableRoomTilesFromPlacedRooms = (placedRoomsMap: Map<string,PlacedRoom>) => {
	const accessibleRoomIDs: string[] = [];
	Array.from(new Array(MAX_FILE + 1)).forEach((_, file) => {
		Array.from(Array(MAX_RANK).keys()).forEach(rank => {
			const rankFileKey = RankFileToKey({ rank, file });
			if (!placedRoomsMap.has(rankFileKey)) {
				accessibleRoomIDs.push(rankFileKey);
			}
		})
	})
	return accessibleRoomIDs;
}

export const GetAccessibleRoomTileIDsFromPlacedRooms = (placedRoomsMap: Map<string,PlacedRoom>) => {
	const seenRankFiles: Set<string> = new Set();
	const accessibleRoomIDs: string[] = [];
	const frontierRankFiles = [ParseRankFileKey(ENTRANCE_HALL_RANK_FILE_KEY)];
	// Add Foundation w/ location to this list if it exists?
	const foundationPlacedRoomEntry = Array.from(placedRoomsMap.entries()).find(([, placedRoom]) => {
		return placedRoom.roomName === ROOM_NAME.THE_FOUNDATION;
	});
	if (foundationPlacedRoomEntry !== undefined) {
		frontierRankFiles.push(ParseRankFileKey(foundationPlacedRoomEntry[0]));
	}


	while (frontierRankFiles.length > 0) {
		const currentRankFile = frontierRankFiles.pop();
		if (currentRankFile === undefined) {
			console.warn("Room rankFile was undefiend when determining next explorable rooms");
			continue;
		}
		const currentRankFileKey = RankFileToKey(currentRankFile);
		seenRankFiles.add(currentRankFileKey);
		const currentRoom = placedRoomsMap.get(currentRankFileKey);
		if (currentRoom === undefined) {
			accessibleRoomIDs.push(currentRankFileKey);
			continue;
		}
		const room = ROOM_MAP[currentRoom.roomName];
		const doorConfiguration = GetDoorConfigurationForDoorType(room.doors);
		const currentRoomDoors = RotateDoors(doorConfiguration, currentRoom.rotation);
		const rankFiles = [];
		if (currentRoomDoors.top) {
			rankFiles.push(RankFileAbove(currentRankFile));
		}

		if (currentRoomDoors.left) {
			rankFiles.push(RankFileLeft(currentRankFile));
		}

		if (currentRoomDoors.bottom) {
			rankFiles.push(RankFileBelow(currentRankFile));
		}

		if (currentRoomDoors.right) {
			rankFiles.push(RankFileRight(currentRankFile));
		}

		rankFiles.filter(a => { return a !== undefined })
			.forEach(rankFile => {
				const key = RankFileToKey(rankFile);
				if (!seenRankFiles.has(key)) {
					frontierRankFiles.push(rankFile);
					seenRankFiles.add(key);
				}
			}
		)
	}
	return accessibleRoomIDs;
}

// Entry Rotation is a bad name, it's what number of clockwise 90 degree rotations
// are valid for the selected rank and file for a dead-end room
// in other words, what doors could we be entering a selected rank and file from
// where 0 is below, 1 is left, 2 is above, and 3 is right

export const ValidRoomRotations = (
	roomName: ROOM_NAME_TYPE,
	selectedRankFile: RankFile,
	selectedEntryRotations: number[],
	conservatoryDraftingMemo: boolean,
): number[] => {
	const room = ROOM_MAP[roomName];
	const doorConfiguration = GetDoorConfigurationForDoorType(room.doors);
	const roomIsOuterRoom = room.types.includes(ROOM_TYPE.OUTER_ROOM);
	if (RankFileToKey(selectedRankFile) === OUTER_ROOM_RANK_FILE_KEY) {
		return roomIsOuterRoom
			? [0]
			: [];
	}

	if (roomIsOuterRoom) {
		return [];
	}

	const validRotations: Set<number> = new Set();
	// Find all rotations where a door points in one of the entry directions
	selectedEntryRotations.forEach(entryRotation => {
		Array.from(new Array(4)).forEach((_, rotation) => {
			const doors = RotateDoors(doorConfiguration, rotation);
			let doorValue: boolean = false;
			switch (entryRotation) {
				case 0:
					doorValue = doors.bottom;
					break;
				case 1:
					doorValue = doors.left;
					break;
				case 2:
					doorValue = doors.top;
					break;
				case 3:
					doorValue = doors.right;
					break;
			}
			if (doorValue) {
				validRotations.add(rotation);
			}
		})
	});
	// const entryValidRotations = Array.from(validRotations).join(',');

	// Remove rotations where a door is pointing outside
	if (selectedRankFile.rank === MAX_RANK || selectedRankFile.rank === MIN_RANK || selectedRankFile.file === MAX_FILE || selectedRankFile.file === MIN_FILE) {
		validRotations.forEach((rotation) => {
			const doors = RotateDoors(doorConfiguration, rotation);
			if (selectedRankFile.rank === MAX_RANK && doors.top) {
				validRotations.delete(rotation);
			} else if (selectedRankFile.rank === MIN_RANK && doors.bottom) {
				validRotations.delete(rotation);
			} else if (selectedRankFile.file === MIN_FILE && doors.left) {
				validRotations.delete(rotation)
			} else if (selectedRankFile.file === MAX_FILE && doors.right) {
				validRotations.delete(rotation)
			}
		});
	}

	if (conservatoryDraftingMemo) {
		switch (roomName) {
			case ROOM_NAME.WEST_WING_HALL:
				if (selectedRankFile.file !== MIN_FILE) {
					return [];
				}
				break;
			case ROOM_NAME.GARAGE:
				if (selectedRankFile.file !== MIN_FILE) {
					return [];
				}
				break;
			case ROOM_NAME.HER_LADYSHIPS_CHAMBER:
				// TODO: Add south-facing pull restriction?
				if (selectedRankFile.file !== MIN_FILE) {
					return [];
				}
				break;
			case ROOM_NAME.EAST_WING_HALL:
				if (selectedRankFile.file !== MAX_FILE) {
					return [];
				}
				break;
			case ROOM_NAME.MASTER_BEDROOM:
				if (selectedRankFile.file !== MAX_FILE) {
					return [];
				}
				break;
			case ROOM_NAME.CONSERVATORY:
				if (
					(selectedRankFile.rank === MAX_RANK || selectedRankFile.rank === MIN_RANK) &&
					(selectedRankFile.file === MAX_FILE || selectedRankFile.file === MIN_FILE)) {
					break;
				} else {
					return [];
				}
			case ROOM_NAME.BOOKSHOP:
				// TODO: one of the connected rooms must be the library
				break;
		}
	}
	// TODO: other checks: drafting requirements

	/*
	console.log(`checking if room is placable: ${room.name}
  	selected Rank File: ${selectedRankFile.rank},${selectedRankFile.file}
  	selectedEntryRotations: ${selectedEntryRotations}
  	entryValidRotations: ${entryValidRotations}
  	results: ${Array.from(validRotations).join(', ')}`)
  	*/
	return Array.from(validRotations);
}

export const GetEntryRotationsForSelectedRankFile = (selectedRankFile: RankFile, placedRooms: Map<string, PlacedRoom>) => {
	const rankFilesToCheck: [RankFile|undefined, (door: Doors) => boolean][] = [
		[RankFileBelow(selectedRankFile), (doors: Doors) => doors.top],
		[RankFileLeft(selectedRankFile), (doors: Doors) => doors.right],
		[RankFileAbove(selectedRankFile), (doors: Doors) => doors.bottom],
		[RankFileRight(selectedRankFile), (doors: Doors) => doors.left],
	];
	const entryRotations = rankFilesToCheck.reduce((accumulator: number[], [rankFile, doorCheck], i) => {
		if (rankFile) {
			const key = RankFileToKey(rankFile);
			const placedRoom = placedRooms.get(key);
			if (placedRoom !== undefined) {
				const room = ROOM_MAP[placedRoom.roomName];
				const doorConfiguration = GetDoorConfigurationForDoorType(room.doors);
				const roomDoors = RotateDoors(doorConfiguration, placedRoom.rotation);
				if (doorCheck(roomDoors)) {
					accumulator.push(i);
				}
			}
		}
		return accumulator;
	}, []);
	return entryRotations;
}

export const useLocalStorage = <T>(
    key: string,
    defaultValue: T,
    customSerialize?: (input: T) => string,
    customDeserialize?: (input: string) => T
): [T, (input: T|((previousState: T) => T)) => void] => {
    const [state, setStateValue] = useState<T>(() => {
        let initialValue: string | null | T = localStorage.getItem(key);
        if (initialValue === null) {
            initialValue = defaultValue;
            if (initialValue === null || initialValue === undefined) {
                return initialValue;
            }
            const valueToUpsert = customSerialize ? customSerialize(initialValue) : JSON.stringify(initialValue);
            localStorage.setItem(key, valueToUpsert);
            return defaultValue;
        }
        return customDeserialize ? customDeserialize(initialValue) : JSON.parse(initialValue);
    });

    const setState = useCallback((input: (T | ((previousState: T) => T))) => {
        setStateValue((oldValue) => {
            const valueToUpsert = (input instanceof Function) ? input(oldValue) : input;
            const nextValue = customSerialize ? customSerialize(valueToUpsert) : JSON.stringify(valueToUpsert);
            localStorage.setItem(key, nextValue);
            return valueToUpsert;
        });
    }, [key, customSerialize]);

    return [state, setState];
}