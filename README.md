# 🐋 DSH Bot Mode

> **Bot Mode for DeepSeek Harness** — a roster of named bots with their own personas, chats and routines. / 把 DeepSeek Harness 的子 Agent 变成一群有名字、有性格的 Bot。

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A **validation plugin** that turns DeepSeek Harness's subagent capability into a friendly roster of named bots — each with its own name, avatar, persona (system prompt), and chat. Built on the native DSH plugin seams: **zero core patches**, every effect removable.

## Features

- **🐋 Bot roster** — a sidebar entry (`sidebar.footer.action`) opens a glassy panel (`shell.overlay`) listing your bots: avatar, name, persona summary.
- **➕ Create / edit / delete bots** — name, emoji avatar, persona prompt; persisted in `localStorage`.
- **💬 Chat with a bot** — each message dispatches a one-shot subagent (`provider: "spawn"`) whose prompt carries the bot persona + your message; replies stream back into the panel. Conversation history is client-owned.
- **🎨 DeepSeek visual style** — blue-violet gradient glass, whale motif.
- **🔌 Zero core patches** — client UI rides `ctx.slots.inject`, host service is a plain HTTP route on the profile's web server. Toggle off / remove the plugin and the stock UI returns exactly.

## Install

> Requires DeepSeek Harness web profile (`dsh web`). Tested on macOS.

```sh
git clone --depth 1 https://github.com/zenghaili0901/dsh-bot-mode.git
# link the plugin into the profile's node_modules
ln -s "$PWD/dsh-bot-mode" "$DSH_HOME/profiles/node_modules/@deepseek-ai/dsh-client-ui-bot-mode"
```

Then append to `$DSH_HOME/profiles/web/cordis.patch.yml`:

```yaml
- insert:
    - id: bot-mode
      name: '@deepseek-ai/dsh-client-ui-bot-mode'
```

Restart the web profile (`dsh web`) and reload the page. The 🐋 entry appears at the sidebar foot, next to Settings.

## Usage

1. Click **🐋 Bot Mode** in the sidebar footer (or the Bot Mode card under Settings → Plugins).
2. In the panel: **＋ 新建 Bot** — pick a name, emoji avatar, and persona prompt (e.g. "你是精通 SQL 的数据分析师…").
3. Click a bot to open its chat; type a message and send. The bot replies in character.

## Architecture

```
Browser (client plugin)                    Node (host plugin)
┌─────────────────────────────┐            ┌──────────────────────────────┐
│ BotModeEntry  sidebar.footer│  fetch     │ POST /bot-mode/chat          │
│ BotModeOverlay shell.overlay│ ─────────▶ │   ctx.subagents.start("spawn")│
│ BotChat        chat view    │  JSON      │   persona + message → prompt │
│ BotModeCard    settings     │ ◀───────── │   settleRun → reply          │
└─────────────────────────────┘   reply    └──────────────────────────────┘
```

- Client: `lib/client.js` — `__ModuleLoader__` bundle (hand-authored, no build step), registers into `settings.plugin.item`, `sidebar.footer.action`, `shell.overlay`.
- Host: `lib/index.js` — registers `POST /bot-mode/chat` on the profile web server; locates the calling agent by `sessionId`, starts a one-shot subagent whose first text block carries the persona.

## Development

```
dsh-bot-mode/
├── package.json       # dsh.client manifest (platform: web)
├── lib/
│   ├── index.js       # host half: HTTP route + subagent dispatch
│   └── client.js      # client half: roster + chat UI (no build step)
└── node_modules/      # local link to @deepseek-ai/dsh-subagent (dev only)
```

## Roadmap (validation → production)

- [ ] Persisted per-bot chat history
- [ ] Bot-to-bot messaging (@mention relay)
- [ ] Group chats (round-robin coordination)
- [ ] Routines (cron tasks per bot via `dsh-schedule`)
- [ ] Deep persona injection via `system-prompt/assemble`

## License

MIT
