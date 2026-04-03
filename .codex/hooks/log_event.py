#!/usr/bin/env python3

import json
from datetime import datetime, timezone
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[2]
TIMELINE_PATH = ROOT / ".codex" / "activity-timeline.jsonl"


def _read_payload():
    raw = sys.stdin.read().strip()
    if not raw:
      return {}
    try:
      return json.loads(raw)
    except json.JSONDecodeError:
      return {"hook_event_name": "Unknown", "raw_stdin": raw}


def _compact_text(value, limit=240):
    if value is None:
        return None
    text = value if isinstance(value, str) else json.dumps(value, sort_keys=True)
    text = " ".join(text.split())
    if len(text) <= limit:
        return text
    return f"{text[: limit - 3]}..."


def _extract_details(payload):
    event_name = payload.get("hook_event_name", "Unknown")
    tool_input = payload.get("tool_input") or {}
    tool_response = payload.get("tool_response")

    details = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event": event_name,
        "session_id": payload.get("session_id"),
        "turn_id": payload.get("turn_id"),
        "cwd": payload.get("cwd"),
        "source": payload.get("source"),
        "tool_name": payload.get("tool_name"),
        "tool_use_id": payload.get("tool_use_id"),
        "command": tool_input.get("command"),
        "prompt": payload.get("prompt"),
        "stop_hook_active": payload.get("stop_hook_active"),
        "last_assistant_message": _compact_text(payload.get("last_assistant_message")),
    }

    if event_name == "PostToolUse":
        details["tool_response_preview"] = _compact_text(tool_response)

    if "raw_stdin" in payload:
        details["raw_stdin"] = _compact_text(payload["raw_stdin"])

    summary_bits = []
    if details["source"]:
        summary_bits.append(f"source={details['source']}")
    if details["command"]:
        summary_bits.append(f"cmd={_compact_text(details['command'], 140)}")
    if details["prompt"]:
        summary_bits.append(f"prompt={_compact_text(details['prompt'], 140)}")
    if details.get("tool_response_preview"):
        summary_bits.append(f"output={details['tool_response_preview']}")
    if details["last_assistant_message"]:
        summary_bits.append(f"assistant={details['last_assistant_message']}")
    details["summary"] = " | ".join(summary_bits)
    return details


def main():
    payload = _read_payload()
    entry = _extract_details(payload)
    TIMELINE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with TIMELINE_PATH.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(entry, sort_keys=True))
        handle.write("\n")


if __name__ == "__main__":
    main()
