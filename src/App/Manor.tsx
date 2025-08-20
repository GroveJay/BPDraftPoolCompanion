import React, { useContext } from "react";
import RoomTile from "./RoomTile";
import { AllAvailableRoomTilesFromPlacedRooms, GetAccessibleRoomTileIDsFromPlacedRooms, MobileContext, RankFileToKey, SettingsContext } from "./utilities";
import type { RankFile, PlacedRoom } from "./types";
import { MAX_FILE, MAX_RANK, OUTER_ROOM_RANK_FILE_KEY } from "./constants";
import { ROOM_NAME } from "./roomName";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faRefresh } from "@fortawesome/free-solid-svg-icons";

interface ManorProps {
	placedRooms: Map<string,PlacedRoom>
	tileClicked: (rankFile: RankFile) => void;
	selectedRoom?: RankFile;
	settingsClicked: () => void;
	resetClicked: () => void;
	placingFoundation?: boolean;
}

const UNCLICKABLE_ROOM_NAMES = [
	ROOM_NAME.ENTRANCE_HALL,
	ROOM_NAME.ANTECHAMBER,
	ROOM_NAME.ROOM_46,
];

const Manor: React.FC<ManorProps> = ({
	placedRooms,
	tileClicked,
	selectedRoom,
	settingsClicked,
	resetClicked,
	placingFoundation = false,
}) => {
	const {
		Inheritance,
		WestGate
	} = useContext(SettingsContext);
	const mobile = useContext(MobileContext);
	const accessibleRoomTileIDs = placingFoundation
		? AllAvailableRoomTilesFromPlacedRooms(placedRooms)
		: selectedRoom === undefined
			? GetAccessibleRoomTileIDsFromPlacedRooms(placedRooms)
			: [RankFileToKey(selectedRoom)];
	const outerRoom = placedRooms.get(OUTER_ROOM_RANK_FILE_KEY);

	return <div
		className={`manor ${mobile ? 'mobile' : ''}`}
	>
		<div
			style={{
				display: 'flex',
				flexDirection: 'row',
				lineHeight: '25px',
			}}
		>
			<div
				style={{
					float: 'left',
					top: 10,
					left: 10,
				}}
			>
				<FontAwesomeIcon
					icon={faGear}
					size="xl"
					onClick={settingsClicked}
				/>
			</div>
			<h4 className="headerText"
				style={{ flex: 1 }}
			>
				Today's Manor
			</h4>
			<div
				style={{
					float: 'right',
					top: 10,
					left: 10,
				}}
			>
				<FontAwesomeIcon
					icon={faRefresh}
					size="xl"
					onClick={resetClicked}
				/>
			</div>
		</div>
		<div style={{
			display: 'flex',
			flexDirection: 'row',
			letterSpacing: -1,
			lineHeight: '25px',
			fontSize: '.5rem',
		}}>
			<div
				style={{
					flex: '1 1 auto',
					display: 'flex',
				}}
			>
				{Array.from(new Array(MAX_FILE + 1)).map((_, file) => {
					return <div
						key={`${file}-file`}
						style={{
							display: 'flex',
							flexDirection: 'column',
							flex: '1',
						}}
					>
						{Array.from(Array(MAX_RANK + (Inheritance ? 1 : 0)).keys()).reverse().map((i) => {
							const rank = i + 1;
							const roomTileKey = RankFileToKey({ rank, file });
							const rankDisplay = file === 0
								? <div
									className="rankLabel"
								>
									{rank}
								</div>
								: <></>;

							if (rank === MAX_RANK + 1 && file !== 2) {
								return <div
									className="roomTileContainer"
									key={roomTileKey}
								>
									{rankDisplay}
									<RoomTile
										roomName={ROOM_NAME.NONE}
										small
									/>
								</div>
							}

							const roomPlaced = placedRooms.get(roomTileKey);
							const roomName = roomPlaced
								? roomPlaced.roomName
								: (selectedRoom && rank === selectedRoom.rank && file === selectedRoom.file) ? ROOM_NAME.UNPLACED_SELECTED : ROOM_NAME.UNPLACED;
							const rotation = roomPlaced
								? roomPlaced.rotation
								: 0;
							const accessible = accessibleRoomTileIDs.includes(roomTileKey);
							const clickable = accessible || (
								roomPlaced !== undefined && !UNCLICKABLE_ROOM_NAMES.includes(roomName)
							)
							const faded = !accessible && !roomPlaced;
							return <div
								key={roomTileKey}
								className="roomTileContainer"
							>
								{rankDisplay}
								<RoomTile
									roomName={roomName}
									rotation={rotation}
									onClick={() => {
										tileClicked({ rank, file });
									}}
									clickable={clickable}
									faded={faded}
									useShortName
									small
								/>
							</div>
							
						})}
					</div>
				})}
			</div>
		</div>
		{WestGate && <div>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					lineHeight: '25px',
				}}
			>
				<div
					className="rankLabel"
					style={{ opacity: 0 }}
				>
					{MAX_RANK + 1}
				</div>
				<h5 className="headerText"
					style={{
						flex: 1,
						marginTop: '10px',
					}}
				>
					Outer Room
				</h5>
			</div>
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
				}}
			>
				<div
					className="rankLabel"
					style={{ opacity: 0 }}
				>
					{MAX_RANK + 1}
				</div>
				<div style={{ flex: 1 }}/>
				<div style={{ flex: 1 }}/>
				<div style={{ flex: 1 }} className="roomTileContainer">
					<RoomTile
						roomName={outerRoom !== undefined
							? outerRoom.roomName
							: (selectedRoom && (RankFileToKey(selectedRoom) === OUTER_ROOM_RANK_FILE_KEY))
								? ROOM_NAME.UNPLACED_SELECTED
								: ROOM_NAME.UNPLACED
						}
						clickable={selectedRoom === undefined || RankFileToKey(selectedRoom) === OUTER_ROOM_RANK_FILE_KEY}
						faded={selectedRoom !== undefined && RankFileToKey(selectedRoom) !== OUTER_ROOM_RANK_FILE_KEY}
						onClick={() => {
							tileClicked({ rank: -1, file: -1 });
						}}
						useShortName
						small
					/>
				</div>
				<div style={{ flex: 1 }}/>
				<div style={{ flex: 1 }}/>
			</div>
		</div>
		}
	</div>;
}

export default Manor;