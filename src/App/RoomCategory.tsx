import { useContext } from "react";
import RoomTile from "./RoomTile";
import type { RankFile, PlacedRoom } from "./types";
import { MobileContext, SettingsContext, ValidRoomRotations } from "./utilities";
import { ROOM_MAP } from "./roomMap";
import { ROOM_NAME, type ROOM_NAME_TYPE } from "./roomName";
import { RarityDots } from "./RoomsList";

const RoomCategory: React.FC<{
	category: string;
	roomNames: ROOM_NAME_TYPE[];
	selectedRankFile: RankFile|undefined;
	placedRooms: Map<string, PlacedRoom>;
	selectedEntryRotations: number[];
	roomSelected: (roomName: ROOM_NAME_TYPE, validRotations: number[]) => void;
	gemCostFilter: [number,number];
	doorConfigurationFilter: Set<number>;
	hasGemsFilter: boolean;
	hasKeysFilter: boolean;
}> = ({
	category,
	roomNames,
	selectedRankFile,
	placedRooms,
	selectedEntryRotations,
	roomSelected,
	gemCostFilter,
	doorConfigurationFilter,
	hasGemsFilter,
	hasKeysFilter,
}) => {
	const {
		ConservatoryDraftingMemo,
		DoubleBoudoir,
		DoubleObservatory,
		DiscoveredRooms,
		BlessingoftheGardener,
	} = useContext(SettingsContext);
	const mobile = useContext(MobileContext);
	const placedRoomNames = Array.from(placedRooms.values()).map(placedRoom => placedRoom.roomName);
	const chamberOfMirrors = placedRoomNames.includes(ROOM_NAME.CHAMBER_OF_MIRRORS);
	const schoolhouse = placedRoomNames.includes(ROOM_NAME.SCHOOLHOUSE);

	return <div className="roomCategory">
		{mobile && <div className="roomCategoryHeader mobile">
			<div style={{ flex: 1 }}>
				<h4 className="headerText">
					{category}
				</h4>
			</div>
			<div style={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
				{Array.from(Array(4).keys()).map(offsetRarity => {
					return <div className="rarityContainer" key={`${offsetRarity}-rarity`}>
						<RarityDots rarity={offsetRarity + 1}/>
					</div>
				})}
			</div>
		</div>}
		<div style={{ display: 'flex', flex: 1 }}>
			{!mobile && <div
				style={{ display: 'flex' }}
			>
				<h4 className="headerText roomCategoryHeaderText">{category}</h4>
			</div>}
			{Array.from(Array(4).keys()).map(offsetRarity => {
				const rarity = offsetRarity + 1;
				const filteredRooms = roomNames.filter(roomName => {
					const room = ROOM_MAP[roomName];
					if (room.rarity !== rarity) {
						return false;
					}

					if (room.gemCost < gemCostFilter[0] || room.gemCost > gemCostFilter[1]) {
						return false;
					}

					if (!doorConfigurationFilter.has(room.doors)) {
						return false;
					}

					if (!DiscoveredRooms.includes(roomName)) {
						return false;
					}

					if (hasKeysFilter && room.keys === 0) {
						return false;
					}

					if (hasGemsFilter && room.gems === 0) {
						return false;
					}

					if (DoubleBoudoir && (roomName === ROOM_NAME.BOUDOIR || roomName === ROOM_NAME.BOUDOIR_UPGRADE_A)) {
						const boudoirCount = placedRoomNames.filter(placedRoomName => (placedRoomName === ROOM_NAME.BOUDOIR || placedRoomName === ROOM_NAME.BOUDOIR_UPGRADE_A)).length;
						const maxBoudoirCount = chamberOfMirrors ? 4 : 2;
						return boudoirCount < maxBoudoirCount
					}

					if (DoubleObservatory && roomName === ROOM_NAME.OBSERVATORY) {
						const observatoryCount = placedRoomNames.filter(placedRoomName => placedRoomName === ROOM_NAME.OBSERVATORY).length;
						const maxObservatoryCount = chamberOfMirrors ? 4 : 2;
						return observatoryCount < maxObservatoryCount;
					}

					if (chamberOfMirrors && roomName !== ROOM_NAME.CHAMBER_OF_MIRRORS) {
						const roomCount = placedRoomNames.filter(placedRoomName => placedRoomName === roomName).length;
						return roomCount < 2
					}

					if (schoolhouse && roomName === ROOM_NAME.CLASSROOM) {
						const classroomCount = placedRoomNames.filter(placedRoomName => placedRoomName === ROOM_NAME.CLASSROOM).length;
						return classroomCount < 9;
					}

					if (BlessingoftheGardener && (roomName === ROOM_NAME.COURTYARD)) {
						const courtyardCount = placedRoomNames.filter(placedRoomName => (placedRoomName === ROOM_NAME.COURTYARD || placedRoomName === ROOM_NAME.COURTYARD_UPGRADE_A)).length;
						const maxCourtyardCount = 9;
						return courtyardCount < maxCourtyardCount;
					}

					return !placedRoomNames.includes(roomName);
				});

				return <div
					className="roomCategoryRarityContainer"
					key={`${category}-${offsetRarity}`}
				>
					{filteredRooms.map((roomName, i) => {
						const validRotations = selectedRankFile === undefined
							? []
							: ValidRoomRotations(roomName, selectedRankFile, selectedEntryRotations, ConservatoryDraftingMemo);

						const clickable =
							(selectedRankFile !== undefined &&
							selectedEntryRotations !== undefined &&
							validRotations.length !== 0) || roomName === ROOM_NAME.THE_FOUNDATION;

						return <RoomTile
							key={`${category}-${rarity}-${i}`}
							roomName={roomName}
							showGemCount
							clickable={clickable}
							faded={!clickable && selectedRankFile !== undefined && selectedEntryRotations !== undefined}
							onClick={() => {
								console.log('valid rotations:', validRotations);
								roomSelected(roomName, validRotations);
							}}
						/>
					})}
				</div>
			})}
		</div>
	</div>
}

export default RoomCategory;