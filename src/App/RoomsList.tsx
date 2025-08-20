import React, { useContext, useState } from "react";
import RoomCategory from "./RoomCategory";
import { RARITY_MAP, ROOM_CATEGORY_MAP } from "./constants";
import { ROOM_DIRECTORY_CATEGORY, type PlacedRoom, type RankFile } from "./types";
import { MobileContext, SettingsContext } from "./utilities";
import { Form, OverlayTrigger, Popover, PopoverBody, PopoverHeader } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faFilter, faRefresh } from "@fortawesome/free-solid-svg-icons";
import RoomTile from "./RoomTile";
import { ROOM_NAME, type ROOM_NAME_TYPE } from "./roomName";
import RangeSlider from "./rangeSlider";

const MIN_GEM_COST = 0;
const MAX_GEM_COST = 6;
const DEFAULT_ROOM_CONFIGURATION_FILTER = [1,2,3,4,5,6];

export const RarityDots: React.FC<{rarity: number }> = ({ rarity }) => {
	return <>
		{Array.from((new Array(rarity)).keys()).map(i => {
			return <span className={`rarity rarity-${i}`} key={`rarity-dots-filled-${i}-${rarity}`}>
				●
			</span>
		})}
		{Array.from((new Array(4 - rarity)).keys()).map((i) => {
			return <span key={`rarity-dots-empty-${rarity}-${i}`}>
				○
			</span>
		})}
	</>
}

const DEFAULT_GEM_COST_FILTER: [number, number] = [MIN_GEM_COST, MAX_GEM_COST];

const RoomsList: React.FC<{
	selectedRankFile: RankFile|undefined;
	placedRooms: Map<string, PlacedRoom>;
	selectedEntryRotations: number[];
	roomSelected: (roomName: ROOM_NAME_TYPE, validRotations: number[]) => void;
	onCancel: () => void;
}> = ({
	selectedRankFile,
	placedRooms,
	selectedEntryRotations,
	roomSelected,
	onCancel,
}) => {
	const [gemCostFilter, setGemCostFilter] = useState<[number,number]>(DEFAULT_GEM_COST_FILTER)
	const [doorConfigurationFilter, setDoorConfigurationFilter] = useState(new Set(DEFAULT_ROOM_CONFIGURATION_FILTER));
	const [hasGemsFilter, setHasGemsFilter] = useState(false);
	const [hasKeysFilter, setHasKeysFilter] = useState(false);

	const {
		WestGate
	} = useContext(SettingsContext);
	const mobile = useContext(MobileContext);

	return <div
		className={`roomList ${mobile ? 'mobile' : ''}`}
	>
		<div className={`roomListHeader ${mobile ? 'mobile' : ''}`}>
			<OverlayTrigger
				placement="bottom"
				trigger="click"
				overlay={<Popover id="popover-basic" data-bs-theme="dark" style={{ minWidth: '200px' }}>
					<PopoverHeader as="h3" style={{ color: '#EEE', textAlign: 'center' }}>
						Filter Rooms
						<span
							style={{ float: 'right' }}
						>
							<FontAwesomeIcon
								icon={faRefresh}
								onClick={() => {
									setGemCostFilter(DEFAULT_GEM_COST_FILTER);
									setDoorConfigurationFilter(new Set(DEFAULT_ROOM_CONFIGURATION_FILTER));
									setHasGemsFilter(false);
									setHasKeysFilter(false);
								}}
							/>
						</span>
					</PopoverHeader>
					<PopoverBody style={{ margin: '0 1rem'}}>
						<h6
							style={{ textAlign: 'center' }}
						>
							Gem Cost
						</h6>
						<RangeSlider
							min={MIN_GEM_COST}
							max={MAX_GEM_COST}
							initialMin={gemCostFilter[0]}
							initialMax={gemCostFilter[1]}
							onChange={(values) => {
								setGemCostFilter(values as [number,number]);
							}}
							step={1}
						/>
						<div
							style={{
								display: 'flex',
								flexDirection: 'row',
								justifyContent: 'center',
							}}
						>
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'right',
								}}
							>
								<Form.Switch
									style={{
										fontSize: '.9rem',
										marginRight: 0,
									}}
									checked={hasGemsFilter}
									id="gem-filter"
									onChange={() => {
										setHasGemsFilter(!hasGemsFilter)
									}}
									inline
								/>
								<Form.Switch
									style={{
										fontSize: '.9rem',
										marginRight: 0,
									}}
									checked={hasKeysFilter}
									id="gem-filter"
									onChange={() => {
										setHasKeysFilter(!hasKeysFilter)
									}}
									inline
								/>
							</div>
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
								}}
							>
								<label className="form-check-label">Has Gems</label>
								<label className="form-check-label">Has Keys</label>
							</div>
						</div>
						<h6
							style={{
								paddingTop: 5,
								textAlign: 'center',
							}}
						>
							Door Arrangement
						</h6>
						<div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
							{Array.from(Array(DEFAULT_ROOM_CONFIGURATION_FILTER.length).keys()).map((doorConfiguration) => {
								const doorType = doorConfiguration + 1;
								return <div
									style={{ flex: '1 1 30%' }}
									className="roomTileContainer"
									key={`${doorType}-door-configuration-filter`}
								>
									<RoomTile
										roomName={ROOM_NAME.UNPLACED_SELECTED}
										doorOverride={doorType}
										faded={!doorConfigurationFilter.has(doorType)}
										clickable={true}
										onClick={() => {
											const updatedDoorConfigurationFilter = new Set(doorConfigurationFilter);
											if (updatedDoorConfigurationFilter.has(doorType)) {
												updatedDoorConfigurationFilter.delete(doorType)
											} else {
												updatedDoorConfigurationFilter.add(doorType);
											}
											setDoorConfigurationFilter(updatedDoorConfigurationFilter);
										}}
										small
									/>
								</div>
							})}
						</div>
					</PopoverBody>
				</Popover>}
				onExit={() => {}}
			>
					{({ ref, ...triggerHandler }) => (
						<FontAwesomeIcon
							{...triggerHandler}
							icon={faFilter}
							ref={ref}
							size="xl"
						/>
				)}
			</OverlayTrigger>
			{mobile && <FontAwesomeIcon
				style={{ float: 'right' }}
				icon={faArrowLeft}
				size="xl"
				onClick={onCancel}
			/>
			}
			{!mobile && Array.from(Array(4).keys()).map(offsetRarity => {
				const rarity = offsetRarity + 1;
				return <div
					style={{
						flex: 1,
						position: 'sticky',
					}}
					key={`Rarity-Header-${offsetRarity}`}
				>
					<h4
						style={{
							textAlign: 'center',
							fontWeight: 'lighter',
						}}
					>
						<span className="rarityTitle">
							{RARITY_MAP[rarity]}
						</span>
						<RarityDots rarity={rarity}/>
					</h4>
				</div>
			})}
		</div>
		{
			Array.from(ROOM_CATEGORY_MAP.entries())
				.filter(([c,]) => WestGate ? true : c !== ROOM_DIRECTORY_CATEGORY.OUTER)
				.map(([category, roomNames]) =>
				<RoomCategory
					key={category}
					category={category}
					roomNames={roomNames}
					selectedRankFile={selectedRankFile}
					placedRooms={placedRooms}
					selectedEntryRotations={selectedEntryRotations}
					roomSelected={roomSelected}
					gemCostFilter={gemCostFilter}
					doorConfigurationFilter={doorConfigurationFilter}
					hasGemsFilter={hasGemsFilter}
					hasKeysFilter={hasKeysFilter}
				/>)
		}
	</div>
}

export default RoomsList;