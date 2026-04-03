#!/usr/bin/env python3

import argparse
import json
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[2]
TIMELINE_PATH = ROOT / ".codex" / "activity-timeline.jsonl"


def load_entries():
    if not TIMELINE_PATH.exists():
        return []

    entries = []
    with TIMELINE_PATH.open("r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            try:
                entries.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return entries


def format_entry(entry):
    timestamp = entry.get("timestamp", "?")
    event = entry.get("event", "Unknown")
    turn_id = entry.get("turn_id") or "-"
    summary = entry.get("summary") or "-"
    return f"{timestamp}  {event:<16} turn={turn_id:<12} {summary}"


def main():
    parser = argparse.ArgumentParser(description="Render the Codex activity timeline.")
    parser.add_argument("-n", "--lines", type=int, default=50, help="Number of recent entries to show.")
    parser.add_argument("--json", action="store_true", help="Print raw JSON entries.")
    args = parser.parse_args()

    entries = load_entries()
    selected = entries[-args.lines :] if args.lines > 0 else entries

    if args.json:
        json.dump(selected, sys.stdout, indent=2)
        sys.stdout.write("\n")
        return

    if not selected:
        sys.stdout.write(f"No timeline entries found at {TIMELINE_PATH}\n")
        return

    for entry in selected:
        sys.stdout.write(format_entry(entry))
        sys.stdout.write("\n")


if __name__ == "__main__":
    main()
