import React, { useCallback, useEffect, useRef, useState } from "react";
import './index.css';
import { ALL_ROOM_NAMES, DEFAULT_MANOR_PLACED_ROOMS, ROOM_CATEGORY_MAP, ROOM_DIRECTORY_CATEGORY_ARRAY } from "./constants";
import Manor from "./Manor";
import { DEFAULT_SETTINGS, GetEntryRotationsForSelectedRankFile, MobileContext, RankFileToKey, SettingsContext, useLocalStorage, ValidRoomRotations } from "./utilities";
import RoomsList from "./RoomsList";
import { Button, Form, FormControl, InputGroup, Modal, ModalBody, ModalHeader } from "react-bootstrap";
import RoomTile from "./RoomTile";
import { type RankFile, type Settings, type PlacedRoom, ROOM_DIRECTORY_CATEGORY, type ROOM_DIRECTORY_CATEGORY_TYPE } from "./types";
import { ROOM_MAP } from "./roomMap";
import toast from "react-hot-toast";
import { ROOM_NAME, type ROOM_NAME_TYPE } from "./roomName";

const MEDIA_WIDTH_QUERY = "(width <= 600px)"
const MatchMediaWidth = () => window.matchMedia(MEDIA_WIDTH_QUERY).matches;

const BluePrince: React.FC = () => {
	const [placedRooms, setPlacedRooms] = useLocalStorage<Map<string,PlacedRoom>>(
		'bluePrinceTodaysManor',
		new Map(DEFAULT_MANOR_PLACED_ROOMS),
		(i) => JSON.stringify(Array.from(i.entries())),
		(i) => new Map(JSON.parse(i))
	);
	const [selectedRankFile, setSelectedRankFile] = useState<RankFile>();
	const [selectedRoomData, setSelectedRoomData] = useState<{roomName: ROOM_NAME_TYPE; rotations: number[]}>();
	const [settings, setSettings] = useLocalStorage<Settings>('bluePrinceSettings', DEFAULT_SETTINGS);
	const [showSettings, setShowSettings] = useState(false);
	const [mobile, setMobile] = useState(MatchMediaWidth());

	const resizeRef = useRef<ResizeObserver>(null);
	const parentDivRef = useRef<HTMLDivElement>(null);

	const resize = useCallback(() => {
		setMobile(MatchMediaWidth);
	}, []);

	useEffect(() => {
		if (!resizeRef.current) {
            resizeRef.current = new ResizeObserver(resize);
        }
        const { current: currentParentDivRef } = parentDivRef;
        if (currentParentDivRef) {
            resizeRef.current.observe(currentParentDivRef);
        }

		return () => {
			if (resizeRef.current && currentParentDivRef) {
                resizeRef.current?.unobserve(currentParentDivRef);
            }
		}
	}, [resize]);

	const placeRoom = useCallback((roomName: ROOM_NAME_TYPE, rotation: number, rankFile: RankFile) => {
		const rankFileKey = RankFileToKey(rankFile);
		const placedRoom: PlacedRoom = {
			roomName,
			rotation,
		};
		setSelectedRoomData(undefined);
		setSelectedRankFile(undefined);
		setPlacedRooms((oldPlacedRooms) => {
			return new Map(oldPlacedRooms.set(rankFileKey, placedRoom));
		});
		if (roomName === ROOM_NAME.THE_FOUNDATION) {
			setSettings((oldSettings) => {
				const updatedSettings = {...oldSettings};
				updatedSettings.FoundationLocation = rankFileKey;
				updatedSettings.FoundationRotation = rotation;
				return updatedSettings;
			});
		}
	}, [setPlacedRooms, setSettings]);

	const removeRoom = useCallback((rankFile: RankFile) => {
		const rankFileKey = RankFileToKey(rankFile);
		const placedRoom = placedRooms.get(rankFileKey);
		if (placedRoom === undefined) return;
		const updatedPlacedRooms = new Map(placedRooms);
		updatedPlacedRooms.delete(rankFileKey);

		const selectedEntryRotations = GetEntryRotationsForSelectedRankFile(rankFile, updatedPlacedRooms);
		const room = ROOM_MAP[placedRoom.roomName];
		const rotations = ValidRoomRotations(placedRoom.roomName, rankFile, selectedEntryRotations, settings.ConservatoryDraftingMemo)
		setSelectedRankFile(rankFile);
		if (rotations.length !== 1 && rotations.length !== 4 && (
			room.doors !== 2
		)) {
			setSelectedRoomData({
				roomName: placedRoom.roomName,
				rotations,
			});
		} else {
			setSelectedRoomData(undefined);
		}
		if (placedRoom.roomName === ROOM_NAME.THE_FOUNDATION) {
			setSettings((oldSettings) => {
				const updatedSettings = {...oldSettings};
				updatedSettings.FoundationLocation = DEFAULT_SETTINGS.FoundationLocation;
				updatedSettings.FoundationRotation = DEFAULT_SETTINGS.FoundationRotation;
				return updatedSettings;
			})
		}
		setPlacedRooms(updatedPlacedRooms);
	}, [placedRooms, settings, setPlacedRooms, setSettings]);

	const resetManor = useCallback(() => {
		const resetManorPlacedRooms = new Map(DEFAULT_MANOR_PLACED_ROOMS);
		if (settings.FoundationLocation !== '') {
			resetManorPlacedRooms.set(settings.FoundationLocation, {
				roomName: ROOM_NAME.THE_FOUNDATION,
				rotation: settings.FoundationRotation,
			})
		}
		setPlacedRooms(resetManorPlacedRooms);
	}, [setPlacedRooms, settings]);

	const showManorOnMobile = !mobile || selectedRankFile === undefined;

	return <SettingsContext.Provider value={settings}>
		<MobileContext.Provider value={mobile}>
		<div
			style={{
				padding: !mobile ? '10px 10px 0px 10px' : 'unset',
				display: 'flex',
				width: '100%',
				height: '100%',
			}}
			ref={parentDivRef}
		>
			{showManorOnMobile &&
				<Manor
					placedRooms={placedRooms}
					tileClicked={(rankFile) => {
						if (selectedRankFile === undefined) {
							const rankFileKey = RankFileToKey(rankFile);
							if (placedRooms.has(rankFileKey)) {
								removeRoom(rankFile);
							} else {
								if (selectedRoomData !== undefined && selectedRoomData.roomName === ROOM_NAME.THE_FOUNDATION) {
									const foundationRotations = ValidRoomRotations(ROOM_NAME.THE_FOUNDATION, rankFile, [0,1,2,3], settings.ConservatoryDraftingMemo);
									setSelectedRoomData({
										roomName: ROOM_NAME.THE_FOUNDATION,
										rotations: foundationRotations,
									});
								}
								setSelectedRankFile(rankFile);
							}
						} else {
							setSelectedRankFile(undefined);
						}
					}}
					selectedRoom={selectedRankFile}
					settingsClicked={() => setShowSettings(true)}
					resetClicked={resetManor}
					placingFoundation={selectedRoomData?.roomName === ROOM_NAME.THE_FOUNDATION && selectedRankFile === undefined}
				/>
			}
			{(!mobile || selectedRankFile !== undefined) &&
				<RoomsList
					selectedRankFile={selectedRankFile}
					placedRooms={placedRooms}
					selectedEntryRotations={selectedRankFile === undefined ? [] : GetEntryRotationsForSelectedRankFile(selectedRankFile, placedRooms)}
					roomSelected={(roomName: ROOM_NAME_TYPE, rotations: number[]) => {
						if (roomName === ROOM_NAME.THE_FOUNDATION && selectedRankFile === undefined) {
							console.log('secretly placing foundation')
							setSelectedRoomData({ roomName, rotations: [] });
							return;
						}

						const room = ROOM_MAP[roomName];
						if (rotations.length === 1 || (rotations.length === 4 && room.doors === 6)) {
							if (selectedRankFile === undefined) return;
							placeRoom(roomName, rotations[0], selectedRankFile);
							return;
						}
						if (rotations.length === 2) {
							if (selectedRankFile === undefined) return;
							const room = ROOM_MAP[roomName];
							if (room.doors !== undefined && room.doors === 2) {
								placeRoom(roomName, rotations[0], selectedRankFile);
								return;
							}
						}
						setSelectedRoomData({ roomName, rotations });
					}}
					onCancel={() => {
						setSelectedRankFile(undefined);
					}}
				/>
			}
			{
				selectedRoomData &&
				selectedRankFile &&
				<Modal
					show={true}
					onHide={() => { setSelectedRoomData(undefined) }}
					data-bs-theme="dark"
				>
					<ModalHeader closeButton>
						<div>
							Placing {selectedRoomData.roomName}
						</div>
					</ModalHeader>
					<ModalBody>
						<div
							style={{
								display: 'flex',
								flexDirection: 'row',
								justifyContent: 'center',
							}}
						>
							{selectedRoomData.rotations.map(rotation => {
								return <RoomTile
									key={`${rotation}-${selectedRoomData.roomName}`}
									rotation={rotation}
									roomName={selectedRoomData.roomName}
									clickable={true}
									onClick={() => {
										placeRoom(selectedRoomData.roomName, rotation, selectedRankFile);
									}}
								/>
							})}
						</div>
					</ModalBody>
				</Modal>
			}
		</div>
		<Modal
			show={showSettings}
			onHide={() => setShowSettings(false)}
			data-bs-theme="dark"
		>
			<ModalHeader closeButton>
				<h3
					style={{ marginBottom: 0 }}
				>
					Settings
				</h3>
			</ModalHeader>
			<ModalBody>
				<Form.Switch
					defaultChecked={settings.Inheritance}
					id="inheritance"
					label="Inheritance"
					onChange={() => {
						const updatedSettings = {...settings};
						updatedSettings.Inheritance = !settings.Inheritance;
						setSettings(updatedSettings);
					}}
					inline
				/>
				<Form.Switch
					defaultChecked={settings.ConservatoryDraftingMemo}
					id="conservatory-memo"
					label="Drafting Locations Memo"
					onChange={() => {
						const updatedSettings = {...settings};
						updatedSettings.ConservatoryDraftingMemo = !settings.ConservatoryDraftingMemo;
						setSettings(updatedSettings);
					}}
					inline
				/>
				<Form.Switch
					defaultChecked={settings.DoubleBoudoir}
					id="double-boudoir"
					label="Double Boudoir"
					onChange={() => {
						const updatedSettings = {...settings};
						updatedSettings.DoubleBoudoir = !settings.DoubleBoudoir;
						setSettings(updatedSettings);
					}}
					inline
				/>
				<Form.Switch
					defaultChecked={settings.DoubleObservatory}
					id="double-observatory"
					label="Double Observatory"
					onChange={() => {
						const updatedSettings = {...settings};
						updatedSettings.DoubleObservatory = !settings.DoubleObservatory;
						setSettings(updatedSettings);
					}}
					inline
				/>
				<Form.Switch
					defaultChecked={settings.WestGate}
					id="west-gate"
					label="West Gate Path"
					onChange={() => {
						const updatedSettings = {...settings};
						updatedSettings.WestGate = !settings.WestGate;
						setSettings(updatedSettings);
					}}
					inline
				/>
				<Form.Switch
					defaultChecked={settings.Shrine}
					id="shrine"
					label="Shrine Blessings"
					onChange={() => {
						const updatedSettings = {...settings};
						updatedSettings.Shrine = !settings.Shrine;
						setSettings(updatedSettings);
					}}
					inline
				/>
				{settings.Shrine &&
					<Form.Switch
						defaultChecked={settings.BlessingoftheGardener}
						id="blessing-of-the-gardener"
						label="Blessing of the Gardener"
						onChange={() => {
							const updatedSettings = {...settings};
							updatedSettings.BlessingoftheGardener = !settings.BlessingoftheGardener;
							setSettings(updatedSettings);
						}}
						inline
					/>
				}
				<hr/>
				<h4>
					Discovered Rooms
					<span
						style={{ float: 'right' }}
					>
						<FindRoomInput
							onSuccess={(room: ROOM_NAME_TYPE) => {
								const currentSetDiscoveredRooms = new Set(settings.DiscoveredRooms);
								currentSetDiscoveredRooms.add(room);
								const updatedSettings = {...settings};
								updatedSettings.DiscoveredRooms = Array.from(currentSetDiscoveredRooms);
								setSettings(updatedSettings);
							}}
						/>
					</span>
				</h4>
				{
					ROOM_DIRECTORY_CATEGORY_ARRAY
						.filter(c => settings.WestGate ? true : ROOM_DIRECTORY_CATEGORY[c] !== ROOM_DIRECTORY_CATEGORY.OUTER)
						.map(c => {
							const category = ROOM_DIRECTORY_CATEGORY[c];
							const categoryRooms = ROOM_CATEGORY_MAP.get(category);
							return categoryRooms === undefined
								? null
								: <RoomDirectoryUnlocker
									key={category}
									category={category}
									checked={categoryRooms.every(room => settings.DiscoveredRooms.includes(room))}
									onBulkChange={(checked: boolean) => {
										const currentSetDiscoveredRooms = new Set(settings.DiscoveredRooms);
										if (checked) {
											categoryRooms.forEach(roomName => {
												currentSetDiscoveredRooms.add(roomName);
											});
										} else {
											categoryRooms.forEach(roomName => {
												currentSetDiscoveredRooms.delete(roomName);
											})
										}
										const updatedSettings = {...settings};
										updatedSettings.DiscoveredRooms = Array.from(currentSetDiscoveredRooms);
										setSettings(updatedSettings);
									}}
								/>
						}
					)
				}
			</ModalBody>
		</Modal>
	</MobileContext.Provider>
	</SettingsContext.Provider>;
}

export default BluePrince

interface RoomDirectoryUnlockerProps {
	category: ROOM_DIRECTORY_CATEGORY_TYPE;
	checked: boolean;
	onBulkChange: (checked: boolean) => void;
}

const RoomDirectoryUnlocker: React.FC<RoomDirectoryUnlockerProps> = ({
	category, checked, onBulkChange
}) => {
	return <div>
		<Form.Switch
			checked={checked}
			id={`${category}-room-directory-unlocker`}
			label={category}
			onChange={(e) => {
				onBulkChange(e.currentTarget.checked);
			}}
			inline
		/>
	</div>
}

const FindRoomInput: React.FC<{ onSuccess: (room: ROOM_NAME_TYPE) => void }> = ({ onSuccess }) => {
	const [input, setInput] = useState('');
	
	const submit = useCallback(() => {
		const roomName = ALL_ROOM_NAMES.find((v) => input === v);
		if (roomName !== undefined) {
			toast.success(`Discovered ${input}`);
			onSuccess(roomName);
		} else {
			toast.error(`${input} was not a recognized room`);
		}
	}, [onSuccess, input]);

	return <InputGroup size="sm">
		<FormControl
			value={input}
			placeholder="Exact room name"
			onChange={(e) => setInput(e.currentTarget.value)}
			onKeyUp={(e) => {
				if (e.key === 'Enter') {
					submit();
				}
			}}
		/>
		<Button
			children="Find"
			onClick={submit}
		/>
	</InputGroup>
}