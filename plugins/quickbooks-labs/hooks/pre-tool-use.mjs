#!/usr/bin/env node
// QuickBooks Labs PreToolUse hook (macOS, Linux, Windows with node on PATH).
//
// Claude Code pipes the hook payload (JSON) to stdin before each QuickBooks
// Labs tool call. This script copies the conversation id (`session_id`) and
// the turn id (`prompt_id`) into the call's arguments as `claude_session_id`
// and `claude_prompt_id`, so the QuickBooks Labs server can keep one company
// per conversation. The server removes both fields before the tool runs; the
// model never sees them. Nothing else from the payload is sent or kept.
// `permission_mode` only chooses the permission decision below. The two ids
// travel inside the tool call, and nothing leaves this machine from here.
//
// Auto mode reviews the arguments Claude wrote, then this rewrite lands.
// A rewritten call with no permission decision is denied, and a retry fails
// the same way, because the model never sees the two fields and cannot repeat
// the rewritten input. In Auto mode the script returns "allow" with the
// rewrite so that call proceeds. Every other permission mode gets no
// decision, so approval prompts stay as they are.
// On any problem it prints nothing and exits 0: the call proceeds unkeyed and
// the server binds the company per user, as it does in chat.
//
// Temporary: this hook goes away once Claude Code carries a conversation id
// in the tool call's `_meta`; the server already reads the key as one input
// and will switch sources without a plugin change.
import { readFileSync } from "node:fs";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function main() {
  let payload;
  try {
    payload = JSON.parse(readFileSync(0, "utf8"));
  } catch {
    return;
  }
  if (!payload || typeof payload !== "object") return;
  if (payload.hook_event_name !== "PreToolUse") return;
  const session = payload.session_id;
  if (typeof session !== "string" || !UUID.test(session)) return;
  const prompt =
    typeof payload.prompt_id === "string" && payload.prompt_id.length <= 128
      ? payload.prompt_id
      : undefined;
  const input =
    payload.tool_input &&
    typeof payload.tool_input === "object" &&
    !Array.isArray(payload.tool_input)
      ? payload.tool_input
      : {};
  // `updatedInput` replaces the whole input, so the model's arguments ride
  // along unchanged; ours are appended after them.
  const updatedInput = {
    ...input,
    claude_session_id: session,
    ...(prompt ? { claude_prompt_id: prompt } : {}),
  };
  // "allow" accepts the rewritten call in Auto mode. The reason is debug-log
  // only. Other modes get no decision, so their approval prompts stay.
  const auto = payload.permission_mode === "auto";
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        ...(auto
          ? {
              permissionDecision: "allow",
              permissionDecisionReason:
                "QuickBooks Labs stamps the conversation id onto this call. The model's arguments are unchanged.",
            }
          : {}),
        updatedInput,
      },
    }),
  );
}

main();
