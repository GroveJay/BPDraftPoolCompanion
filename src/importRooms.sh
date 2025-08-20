#!/usr/bin/env bash
main() {
	local APP_PATH="./App"
	local ROOM_NAME_FILE="${APP_PATH}/roomName.ts"
	local ROOM_MAP_FILE="${APP_PATH}/roomMap.ts"
	local ROOM_CSV="${APP_PATH}/rooms.csv"

	printf "export const ROOM_NAME = {\n" > "${ROOM_NAME_FILE}"

	cut -f 2 -d ',' "${ROOM_CSV}" | sed -e 's/\(.*\)/\1,\1/g' | awk -F ',' 'NR>1 {{gsub(/ /,"_",$2);gsub(/\047/,"", $2);gsub(/\-/,"",$2);$2=toupper($2)": \""$1"\",";} print "\t"$2}' >> "${ROOM_NAME_FILE}"

	printf "}\n\nexport type ROOM_NAME_TYPE = typeof ROOM_NAME[keyof typeof ROOM_NAME];" >> "${ROOM_NAME_FILE}"

	printf "import { ROOM_NAME, type ROOM_NAME_TYPE } from \"./roomName\";\nimport { ROOM_TYPE, type Room } from \"./types\";\n\nexport const ROOM_MAP: { [key: ROOM_NAME_TYPE]: Room } = {\n" > "${ROOM_MAP_FILE}"

	awk -F ',' 'NR>1 {\
		{\
			gsub(/ /,"_",$2);\
			gsub(/\047/,"", $2);\
			gsub(/\-/,"",$2);\
			$2=toupper($2);\
			gsub(/ /,"_",$4);\
			gsub(/\;/,", ROOM_TYPE.",$4);\
			$4="ROOM_TYPE."toupper($4)\
		}\
		print "\
	[ROOM_NAME."$2"]: {\n\
		shortName: \""$1"\",\n\
		displayName: \""$3"\",\n\
		types: ["$4"],\n\
		rarity: "$5",\n\
		doors: "$6",\n\
		gemCost: "$7",\n\
		gems: "$8",\n\
		keys: "$9",\n\
	},\
"}' < "${ROOM_CSV}" >> "${ROOM_MAP_FILE}"

	printf "}" >> "${ROOM_MAP_FILE}"
}

main
