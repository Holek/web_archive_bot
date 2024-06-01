#!/bin/bash

set +e

ID_FILE="transport_ids"
TOTAL_IDS=$(wc -l < "$ID_FILE")
# slots per day = total ids / 365 days in a year (rounded up)
SLOTS_PER_DAY=$(( (TOTAL_IDS + 364) / 365 ))

CURRENT_HOUR=$(date +%H)

if [ "$CURRENT_HOUR" -lt 8 ]; then
    CURRENT_SLOT=0
elif [ "$CURRENT_HOUR" -lt 16]; then
    CURRENT_SLOT=1
else
    CURRENT_SLOT=2
fi

DAY_OF_YEAR=$(date +%j)
SLOT_NUMBER=$(( (DAY_OF_YEAR - 1) * SLOTS_PER_DAY + CURRENT_SLOT + 1 ))

if [ "$SLOT_NUMBER" -gt "$TOTAL_IDS" ]; then
    echo "No more IDs to process."
    exit 0
fi

sed -n "${SLOT_NUMBER}p" "$ID_FILE" | while read -r ID; do
    echo "Archiving ID: $ID"
    TARGET_URL="http://tabor.we.wroclawiu.net/showveh.php?num=${ID}" node archive.js
done