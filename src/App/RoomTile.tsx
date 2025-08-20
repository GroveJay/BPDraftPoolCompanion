import { Badge } from "react-bootstrap";
import { GetDoorConfigurationForDoorType, MobileContext, RotateDoors } from "./utilities";
import { ROOM_MAP } from "./roomMap";
import { type ROOM_NAME_TYPE } from "./roomName";
import { ROOM_TYPE } from "./types";
import { useContext } from "react";

const GEM_DISPLAY = [
	"", "💎", "💎💎", "💎💎💎", "💎💎💎💎", "💎💎💎💎💎", "💎💎💎💎💎💎", "💎💎💎💎💎💎"
];
const KEY_DISPLAY = [
	"", "🔑", "🔑🔑",
];

interface RoomTileProps {
	roomName: ROOM_NAME_TYPE;
	small?: boolean;
	showGemCount?: boolean;
	useShortName?: boolean;
	rotation?: number;
	clickable?: boolean;
	onClick?: () => void;
	faded?: boolean;
	doorOverride?: number;
}

const VALID_STYLE_TYPES = [
	ROOM_TYPE.BLUEPRINT,
	ROOM_TYPE.BEDROOM,
	ROOM_TYPE.HALLWAY,
	ROOM_TYPE.GREEN,
	ROOM_TYPE.SHOP,
	ROOM_TYPE.RED,
	ROOM_TYPE.BLACKPRINT,
	ROOM_TYPE.UNPLACED,
	ROOM_TYPE.UNPLACED_SELECTED,
	ROOM_TYPE.NONE,
];

const RoomTile: React.FC<RoomTileProps> = ({
	roomName,
	rotation = 0,
	clickable = false,
	onClick = () => {},
	faded = false,
	doorOverride,
	small = false,
}) => {
	const {
		doors: originalDoors,
		displayName,
		types,
		gemCost,
		shortName,
		gems,
		keys,
	} = ROOM_MAP[roomName];
	const mobile = useContext(MobileContext);

	const validStyleTypes = Array.from(new Set(types.filter(t => VALID_STYLE_TYPES.includes(t))));
	const typeStyleNames = validStyleTypes.length !== 0
		? validStyleTypes.map(t => t.replace(' ', '')).join(' ')
		: 'Unknown';
	const doorConfiguration = GetDoorConfigurationForDoorType(doorOverride || originalDoors);
	const doors = RotateDoors(doorConfiguration, rotation);
	const hoverable = clickable && types[0] !== ROOM_TYPE.NONE;
	return <div className={`roomTileParent ${small ? 'small' : ''} ${(!small && mobile ? 'mobile' : '')}`}>
		<div className={`roomTileWrapper ${typeStyleNames} ${faded ? 'faded' : ''}`}>
			{
				doors.top && 
				<div className="door door-horizontal door-top" />
			}
			{
				doors.left &&
				<div className="door door-vertical door-left"/>
			}
			<div
				className={`roomTile ${hoverable ? 'hoverable' : ''}`}
				onClick={() => {
					if (clickable) {
						onClick();
					}
				}}
			>
				<div>
					{(small || mobile) ? shortName : displayName}
				</div>
				{!small && gemCost !== undefined && gemCost !== 0 &&
					<Badge as="div" pill className="roomBadge gemCost">
						{GEM_DISPLAY[gemCost]}
					</Badge>
				}
				{!small && gems !== undefined && gems !== 0 &&
					<Badge as="div" pill className="roomBadge gemGain">
						{GEM_DISPLAY[gems]}
					</Badge>
				}
				{!small && keys !== undefined && keys !== 0 &&
					<Badge as="div" pill className="roomBadge keyGain">
						{KEY_DISPLAY[keys]}
					</Badge>
				}
			</div>
			{
				doors.right &&
				<div className="door door-vertical door-right" />
			}
			{
				doors.bottom &&
				<div className="door door-horizontal door-bottom" />
			}
		</div>
	</div>
}

export default RoomTile;