/* dsh-bot-mode — client bundle (web).
 * Hand-authored __ModuleLoader__ format. Compact Hermes-inspired BOTS panel:
 * docked left, small footprint, bot icon grid, search over chat history,
 * modal create, chat view with live task-status animation.
 * Host route: POST /bot-mode/chat.
 */
window.__ModuleLoader__.load({
  id: "@deepseek-ai/dsh-client-ui-bot-mode",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    let react = require("react");
    let runtimeClient = require("@deepseek-ai/dsh-client-runtime/client");

    const h = react.createElement;
    const { useState, useRef, useEffect } = react;
    const { defineStore } = runtimeClient;

    /* ---------------- styles ---------------- */
    const css = [
      /* compact docked panel */
      ".bm-overlay{position:fixed;left:266px;top:12px;width:262px;max-height:62vh;display:flex;flex-direction:column;border:1px solid var(--dsw-alias-border-l2);border-radius:14px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 94%,transparent);backdrop-filter:blur(20px);box-shadow:0 12px 40px rgba(2,6,20,.25);z-index:9999;overflow:hidden;pointer-events:auto;font-size:13px;color:var(--dsw-alias-label-primary)}",
      ".bm-overlay-head{display:flex;align-items:center;gap:8px;padding:10px 12px 8px;border-bottom:1px solid var(--dsw-alias-border-l1);background:linear-gradient(120deg,color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent),color-mix(in srgb,#7b5cff 8%,transparent))}",
      ".bm-overlay-title{font-weight:700;font-size:13px;display:flex;align-items:center;gap:6px;letter-spacing:.3px;flex:1;min-width:0}",
      ".bm-icon-btn{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:8px;width:24px;height:24px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;line-height:1;padding:0;flex:none}",
      ".bm-icon-btn:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-brand-primary)}",
      ".bm-overlay-body{padding:8px 10px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;flex:1}",
      ".bm-search{width:100%;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:9px;padding:6px 9px;color:var(--dsw-alias-label-primary);font-size:12px;outline:none}",
      ".bm-search:focus{border-color:var(--dsw-alias-brand-primary)}",
      ".bm-search::placeholder{color:var(--dsw-alias-label-secondary)}",
      /* bot icon grid */
      ".bm-grid{display:flex;flex-wrap:wrap;gap:10px;padding:4px 2px}",
      ".bm-chip{display:flex;flex-direction:column;align-items:center;gap:4px;width:52px;cursor:pointer;border:none;background:none;padding:4px 2px;border-radius:10px;position:relative}",
      ".bm-chip:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".bm-chip-avatar{font-size:16px;width:38px;height:38px;display:flex;align-items:center;justify-content:center;border-radius:50%;position:relative}",
      ".bm-chip-name{color:var(--dsw-alias-label-secondary);font-size:10px;max-width:52px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      /* status dot on avatar */
      ".bm-status-dot{position:absolute;right:-1px;bottom:-1px;width:10px;height:10px;border-radius:50%;border:2px solid var(--dsw-alias-bg-layer-2)}",
      ".bm-status-idle{background:var(--dsw-alias-label-secondary);opacity:.6}",
      ".bm-status-running{background:#4d6bfe;animation:bm-pulse 1s ease-in-out infinite}",
      ".bm-status-done{background:#22c55e}",
      ".bm-status-pending{background:#f59e0b;animation:bm-pulse 1.4s ease-in-out infinite}",
      "@keyframes bm-pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(77,107,254,.4)}50%{opacity:.55;box-shadow:0 0 0 4px rgba(77,107,254,0)}}",
      /* search results */
      ".bm-results{display:flex;flex-direction:column;gap:6px}",
      ".bm-result{display:flex;align-items:center;gap:8px;padding:7px 9px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-1);cursor:pointer}",
      ".bm-result:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".bm-result-text{font-size:11px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0}",
      ".bm-empty{color:var(--dsw-alias-label-secondary);text-align:center;padding:14px 0;font-size:11.5px}",
      /* modal */
      ".bm-modal{position:fixed;inset:0;background:rgba(2,6,20,.45);backdrop-filter:blur(3px);z-index:10001;display:flex;align-items:center;justify-content:center;pointer-events:auto}",
      ".bm-modal-card{width:400px;max-width:92vw;max-height:84vh;overflow-y:auto;display:flex;flex-direction:column;gap:10px;border:1px solid var(--dsw-alias-border-l2);border-radius:16px;background:var(--dsw-alias-bg-layer-2);box-shadow:0 24px 60px rgba(2,6,20,.5);padding:16px;font-size:13px;color:var(--dsw-alias-label-primary)}",
      ".bm-modal-title{font-weight:700;font-size:14px;display:flex;align-items:center;gap:8px}",
      ".bm-modal-sub{color:var(--dsw-alias-label-secondary);font-size:11.5px;line-height:17px}",
      ".bm-field{display:flex;flex-direction:column;gap:4px}",
      ".bm-field label{color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:600}",
      ".bm-avatar-pick{display:flex;gap:8px;align-items:center;flex-wrap:wrap}",
      ".bm-avatar-pick .bm-chip-avatar{cursor:pointer;border:2px solid transparent}",
      ".bm-avatar-pick .sel{border-color:var(--dsw-alias-brand-primary)}",
      ".bm-color-pick{display:flex;gap:6px;flex-wrap:wrap}",
      ".bm-color-pick button{width:22px;height:22px;border-radius:50%;border:2px solid transparent;cursor:pointer}",
      ".bm-color-pick button.sel{border-color:var(--dsw-alias-label-primary)}",
      ".bm-input{width:100%;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:10px;padding:8px 10px;color:var(--dsw-alias-label-primary);font-size:12px;outline:none}",
      ".bm-input:focus{border-color:var(--dsw-alias-brand-primary)}",
      ".bm-input::placeholder{color:var(--dsw-alias-label-secondary)}",
      ".bm-textarea{width:100%;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:10px;padding:8px 10px;color:var(--dsw-alias-label-primary);font-size:12px;outline:none;resize:vertical;min-height:64px;font-family:inherit}",
      ".bm-textarea::placeholder{color:var(--dsw-alias-label-secondary)}",
      ".bm-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:2px}",
      ".bm-btn{border:1px solid transparent;background:linear-gradient(135deg,#4d6bfe,#7b5cff);color:#fff;border-radius:10px;padding:7px 13px;font-size:12px;cursor:pointer;font-weight:600}",
      ".bm-btn:hover{filter:brightness(1.1)}",
      ".bm-btn:disabled{opacity:.5;cursor:default}",
      ".bm-btn-ghost{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary)}",
      ".bm-advanced{border:1px solid var(--dsw-alias-border-l1);border-radius:10px;overflow:hidden}",
      ".bm-advanced-head{display:flex;align-items:center;justify-content:space-between;width:100%;border:none;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);cursor:pointer;padding:7px 10px;font-size:12px;font-weight:600}",
      ".bm-advanced-body{padding:10px;border-top:1px solid var(--dsw-alias-border-l1);display:flex;flex-direction:column;gap:8px}",
      /* compact chat */
      ".bm-chat{display:flex;flex-direction:column;height:100%;min-height:220px;max-height:calc(62vh - 96px)}",
      ".bm-chat-head{display:flex;align-items:center;gap:8px;padding:8px 2px 6px;border-bottom:1px solid var(--dsw-alias-border-l1)}",
      ".bm-back{border:none;background:none;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:15px;padding:2px 5px;border-radius:6px;line-height:1}",
      ".bm-back:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}",
      ".bm-chat-title{display:flex;align-items:center;gap:7px;font-weight:600;font-size:12.5px;min-width:0}",
      ".bm-chat-status{display:flex;align-items:center;gap:5px;margin-left:auto;color:var(--dsw-alias-label-secondary);font-size:10.5px;flex:none}",
      ".bm-chat-status .bm-status-dot{position:static;border:none;width:8px;height:8px}",
      ".bm-msgs{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:6px;padding:8px 0}",
      ".bm-msg{max-width:92%;padding:7px 10px;border-radius:11px;line-height:18px;white-space:pre-wrap;word-break:break-word;font-size:12px}",
      ".bm-msg-user{align-self:flex-end;background:linear-gradient(135deg,#4d6bfe,#7b5cff);color:#fff;border-bottom-right-radius:3px}",
      ".bm-msg-bot{align-self:flex-start;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-bottom-left-radius:3px}",
      ".bm-msg-sys{align-self:center;color:var(--dsw-alias-label-secondary);font-size:10.5px}",
      ".bm-msg-meta{font-size:9.5px;color:var(--dsw-alias-label-secondary);margin-bottom:2px;display:flex;align-items:center;gap:4px}",
      ".bm-composer{display:flex;gap:6px;padding-top:7px;border-top:1px solid var(--dsw-alias-border-l1)}",
      ".bm-composer .bm-input{flex:1;padding:6px 9px;font-size:12px}",
      /* sidebar entry + settings card */
      ".bm-entry-btn{display:flex;align-items:center;gap:8px;width:100%;border:none;background:none;color:var(--dsw-alias-label-secondary);cursor:pointer;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:600}",
      ".bm-entry-btn:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}",
      ".bm-card{border:1px solid var(--dsw-alias-border-l2);background:linear-gradient(120deg,color-mix(in srgb,var(--dsw-alias-brand-primary) 10%,transparent),color-mix(in srgb,#7b5cff 6%,transparent));border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:4px}",
      ".bm-card-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:600;display:flex;align-items:center;gap:8px}",
      ".bm-card-desc{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
      ".bm-toggle{margin-left:auto;border:1px solid var(--dsw-alias-border-l2);height:28px;color:var(--dsw-alias-label-primary);cursor:pointer;background:var(--dsw-alias-bg-layer-1);border-radius:14px;flex:none;align-items:center;gap:6px;padding:0 10px 0 6px;font-size:12px;display:inline-flex}",
      ".bm-toggle[aria-pressed=true]{background:linear-gradient(135deg,#4d6bfe,#7b5cff);color:#fff;border-color:transparent}",
    ].join("");

    const CSS_TAG = "@deepseek-ai/dsh-client-ui-bot-mode/botmode.css";
    if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(CSS_TAG) + "]") === null) {
      const tag = document.createElement("style");
      tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-bot-mode";
      tag.dataset.pluginCss = CSS_TAG;
      tag.textContent = css;
      document.head.appendChild(tag);
    }

    /* ---------------- persistence ---------------- */
    const BOTS_KEY = "dsh-bot-mode.bots";
    const CHATS_KEY = "dsh-bot-mode.chats";
    const AVATAR_COLORS = ["#4d6bfe", "#7b5cff", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#64748b"];
    const DEFAULT_BOTS = [
      { id: "researcher", name: "研究员", emoji: "🔬", color: "#4d6bfe", persona: "你是一位严谨的研究助理：擅长检索资料、交叉验证多个来源，并输出带引用的结构化报告。", createdAt: Date.now() },
      { id: "reviewer", name: "代码评审", emoji: "🧐", color: "#22c55e", persona: "你是一位资深代码评审员：关注正确性、可读性与性能，每次给出可执行的具体建议。", createdAt: Date.now() },
    ];
    function loadJSON(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        const val = raw ? JSON.parse(raw) : null;
        return val !== null && val !== undefined ? val : fallback;
      } catch { return fallback; }
    }
    function saveJSON(key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
    }
    function loadBots() {
      const arr = loadJSON(BOTS_KEY, null);
      return Array.isArray(arr) && arr.length ? arr : DEFAULT_BOTS;
    }
    function loadChats() { return loadJSON(CHATS_KEY, {}); }

    /* ---------------- shared store ---------------- */
    const uiStore = defineStore({
      init: () => ({ overlayOpen: false, bots: loadBots(), chats: loadChats(), busyBotId: null, lastDoneAt: null, revision: -1 }),
      actions: {
        toggleOverlay: (d, open) => { d.overlayOpen = open; },
        addBot: (d, bot) => { d.bots = d.bots.concat([bot]); saveJSON(BOTS_KEY, d.bots); },
        removeBot: (d, id) => { d.bots = d.bots.filter((b) => b.id !== id); saveJSON(BOTS_KEY, d.bots); },
        appendMessage: (d, botId, msg) => {
          const list = d.chats[botId] ? d.chats[botId].concat([msg]) : [msg];
          d.chats = Object.assign({}, d.chats, { [botId]: list });
          saveJSON(CHATS_KEY, d.chats);
        },
        clearChat: (d, botId) => {
          d.chats = Object.assign({}, d.chats, { [botId]: [] });
          saveJSON(CHATS_KEY, d.chats);
        },
        setBusy: (d, botId) => { d.busyBotId = botId; },
        sync: (d, next, revision) => {
          if (revision <= d.revision) return;
          d.overlayOpen = next.overlayOpen;
          d.bots = next.bots;
          d.chats = next.chats;
          d.busyBotId = next.busyBotId;
          d.revision = revision;
        },
      },
    });

    /* ---------------- small helpers ---------------- */
    function avatarBg(color) {
      return color ? "linear-gradient(135deg," + color + "," + color + "44)" : "linear-gradient(135deg,#4d6bfe,#7b5cff)";
    }
    function statusClass(state) {
      if (state === "running") return "bm-status-running";
      if (state === "pending") return "bm-status-pending";
      if (state === "done") return "bm-status-done";
      return "bm-status-idle";
    }

    /* ---------------- components ---------------- */
    function BotModeCard(props) {
      const { useStore, toggleOverlay } = props;
      const state = useStore((s) => s);
      return h("li", { className: "bm-card" },
        h("div", { style: { display: "flex", alignItems: "center" } },
          h("span", { className: "bm-card-title" }, "🐋 Bot Mode"),
          h("button", { className: "bm-toggle", "aria-pressed": state.overlayOpen ? "true" : "false", onClick: () => toggleOverlay(!state.overlayOpen) },
            state.overlayOpen ? "面板已开" : "打开面板")
        ),
        h("div", { className: "bm-card-desc" }, "把 DeepSeek Harness 的子 Agent 变成一群有名字、有性格的 Bot，各聊各的，还能互相协作。"),
        h("div", { className: "bm-card-desc" }, h("strong", null, "点击侧边栏底部 🐋 或这里打开 Bot 面板。"))
      );
    }

    function BotModeEntry(props) {
      const { wide, useStore, toggleOverlay } = props;
      const state = useStore((s) => s);
      return h("button", {
        className: "bm-entry-btn",
        onClick: () => toggleOverlay(!state.overlayOpen),
      }, wide ? h("span", null, "🐋 Bot Mode") : h("span", null, "🐋"));
    }

    /* ————— compact panel ————— */
    function BotModeOverlay(props) {
      const { useStore, useSessions, addBot, removeBot, appendMessage, toggleOverlay, setBusy } = props;
      const state = useStore((s) => s);
      const [activeBot, setActiveBot] = useState(null);
      const [creating, setCreating] = useState(false);
      const sessions = useSessions ? useSessions((s) => s) : null;
      const sessionId = sessions && sessions.current ? sessions.current : undefined;
      if (!state.overlayOpen) return null;
      return h("div", { className: "bm-overlay" },
        h("div", { className: "bm-overlay-head" },
          h("span", { className: "bm-overlay-title" }, "🐋 BOTS"),
          h("button", { className: "bm-icon-btn", title: "新建 Agent", onClick: () => setCreating(true) }, "+"),
          h("button", { className: "bm-icon-btn", title: "关闭", onClick: () => toggleOverlay(false) }, "✕")
        ),
        h("div", { className: "bm-overlay-body" },
          activeBot
            ? h(BotChat, {
                bot: activeBot,
                sessionId,
                chats: state.chats,
                busy: state.busyBotId === activeBot.id,
                onBack: () => setActiveBot(null),
                onAppend: (msg) => appendMessage(activeBot.id, msg),
                onClear: () => appendMessage ? null : null,
                setBusy,
              })
            : h(BotRoster, {
                bots: state.bots,
                chats: state.chats,
                busyBotId: state.busyBotId,
                onPick: (bot) => setActiveBot(bot),
                onNew: () => setCreating(true),
                onRemove: (id) => removeBot(id),
              })
        ),
        creating ? h(NewBotModal, {
          onClose: () => setCreating(false),
          onCreate: (bot) => { addBot(bot); setCreating(false); },
        }) : null
      );
    }

    /* roster: icon grid, search over chat history */
    function BotRoster(props) {
      const { bots, chats, busyBotId, onPick, onNew, onRemove } = props;
      const [query, setQuery] = useState("");
      const [confirmId, setConfirmId] = useState(null);
      useEffect(() => {
        if (confirmId === null) return;
        const timer = setTimeout(() => setConfirmId(null), 3000);
        return () => clearTimeout(timer);
      }, [confirmId]);
      const q = query.trim().toLowerCase();
      const searching = q.length > 0;
      // search over bot names + chat history
      const results = [];
      if (searching) {
        bots.forEach((bot) => {
          if ((bot.name || "").toLowerCase().includes(q) || (bot.persona || "").toLowerCase().includes(q)) {
            results.push({ bot, label: "Bot：" + bot.name, text: bot.persona });
          }
          (chats[bot.id] || []).forEach((m) => {
            if ((m.text || "").toLowerCase().includes(q)) {
              results.push({ bot, label: bot.name + " 的对话", text: m.text, when: m.ts });
            }
          });
        });
      }
      return h("div", { style: { display: "flex", flexDirection: "column", gap: 8, flex: 1 } },
        h("input", { className: "bm-search", placeholder: "搜索历史对话…", value: query, onChange: (e) => setQuery(e.target.value) }),
        searching
          ? (results.length === 0
              ? h("div", { className: "bm-empty" }, "没有匹配的对话")
              : h("div", { className: "bm-results" },
                  results.slice(0, 20).map((r, i) =>
                    h("div", { key: i, className: "bm-result", onClick: () => onPick(r.bot) },
                      h("span", { className: "bm-chip-avatar", style: { background: avatarBg(r.bot.color), width: 26, height: 26, fontSize: 12, flex: "none" } }, r.bot.emoji),
                      h("div", { style: { minWidth: 0, flex: 1 } },
                        h("div", { style: { fontSize: 11, fontWeight: 600, color: "var(--dsw-alias-label-primary)" } }, r.label),
                        h("div", { className: "bm-result-text" }, r.text)
                      )
                    )
                  )
                ))
          : (bots.length === 0
              ? h("div", { className: "bm-empty" }, "还没有 Bot，点右上角 + 新建 ✨")
              : h("div", { className: "bm-grid" },
                  bots.map((bot) =>
                    h("button", { key: bot.id, className: "bm-chip", onClick: () => onPick(bot), title: bot.name },
                      h("span", { className: "bm-chip-avatar", style: { background: avatarBg(bot.color) } },
                        bot.emoji,
                        h("span", { className: "bm-status-dot " + statusClass(bot.id === busyBotId ? "running" : (bot.id === confirmId ? "pending" : "idle")) })
                      ),
                      h("span", { className: "bm-chip-name" }, bot.name)
                    )
                  )
                ))
      );
    }

    /* modal create */
    function NewBotModal(props) {
      const [name, setName] = useState("");
      const [persona, setPersona] = useState("");
      const [emoji, setEmoji] = useState("🤖");
      const [color, setColor] = useState(AVATAR_COLORS[0]);
      const [advanced, setAdvanced] = useState(false);
      const EMOTIONS = ["🤖", "🐋", "🔬", "🧐", "🎨", "📈", "🛡️", "🧠"];
      const submit = () => {
        const n = name.trim();
        if (!n) return;
        props.onCreate({ id: "bot-" + Date.now(), name: n, emoji, color, persona: persona.trim() || "你是一位乐于助人的助手。", createdAt: Date.now() });
      };
      return h("div", { className: "bm-modal", onClick: (e) => { if (e.target === e.currentTarget) props.onClose(); } },
        h("div", { className: "bm-modal-card" },
          h("div", { className: "bm-modal-title" }, "🐋 New Agent"),
          h("div", { className: "bm-modal-sub" }, "一个有名字、有性格的团队成员，拥有自己的记忆、技能和对话。"),
          h("div", { className: "bm-field" },
            h("label", null, "头像"),
            h("div", { className: "bm-avatar-pick" },
              EMOTIONS.map((e) => h("span", { key: e, className: "bm-chip-avatar" + (e === emoji ? " sel" : ""), style: { background: avatarBg(color) }, onClick: () => setEmoji(e) }, e))
            )
          ),
          h("div", { className: "bm-field" },
            h("label", null, "头像颜色"),
            h("div", { className: "bm-color-pick" },
              AVATAR_COLORS.map((c) => h("button", { key: c, className: c === color ? "sel" : "", style: { background: c }, onClick: () => setColor(c) }, ""))
            )
          ),
          h("div", { className: "bm-field" },
            h("label", null, "名字"),
            h("input", { className: "bm-input", placeholder: "如：数据分析师", value: name, onChange: (e) => setName(e.target.value) })
          ),
          h("div", { className: "bm-field" },
            h("label", null, "人格设定（system prompt）"),
            h("textarea", { className: "bm-textarea", placeholder: "如：你是精通 SQL 的数据分析师…", value: persona, onChange: (e) => setPersona(e.target.value) })
          ),
          h("div", { className: "bm-advanced" },
            h("button", { className: "bm-advanced-head", onClick: () => setAdvanced(!advanced) },
              h("span", null, "高级"),
              h("span", null, advanced ? "▾" : "▸")
            ),
            advanced ? h("div", { className: "bm-advanced-body" },
              h("div", { className: "bm-field" },
                h("label", null, "行为提示（补充）"),
                h("input", { className: "bm-input", placeholder: "可选：语气、输出格式等额外约束" })
              )
            ) : null
          ),
          h("div", { className: "bm-modal-actions" },
            h("button", { className: "bm-btn bm-btn-ghost", onClick: props.onClose }, "取消"),
            h("button", { className: "bm-btn", onClick: submit, disabled: !name.trim() }, "创建 Bot")
          )
        )
      );
    }

    /* compact chat with live status */
    function BotChat(props) {
      const { bot, sessionId, chats, busy, onBack, onAppend, setBusy } = props;
      const [input, setInput] = useState("");
      const [sending, setSending] = useState(false);
      const listRef = useRef(null);
      const messages = chats[bot.id] || [];
      useEffect(() => {
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      }, [messages, sending]);

      const send = async () => {
        const text = input.trim();
        if (!text || sending) return;
        onAppend({ role: "user", text, ts: Date.now() });
        setInput("");
        setSending(true);
        setBusy(bot.id);
        try {
          const res = await fetch("/bot-mode/chat", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ sessionId, bot, message: text }),
          });
          const data = await res.json();
          const reply = data && data.ok ? data.reply : (data && data.error ? "⚠️ " + data.error : "（无回复）");
          onAppend({ role: "bot", text: reply, ts: Date.now(), done: true });
        } catch (err) {
          onAppend({ role: "bot", text: "请求失败: " + (err.message || err), ts: Date.now(), done: true });
        }
        setSending(false);
        setBusy(null);
      };

      const lastDone = messages.length ? messages[messages.length - 1] : null;
      const statusLabel = busy ? "任务进行中…" : (sending ? "任务进行中…" : (lastDone && lastDone.done ? "任务完成" : "空闲"));

      return h("div", { className: "bm-chat" },
        h("div", { className: "bm-chat-head" },
          h("button", { className: "bm-back", onClick: onBack }, "←"),
          h("span", { className: "bm-chip-avatar", style: { background: avatarBg(bot.color), width: 26, height: 26, fontSize: 13, flex: "none" } }, bot.emoji),
          h("span", { className: "bm-chat-title" }, bot.name),
          h("span", { className: "bm-chat-status" },
            h("span", { className: "bm-status-dot " + (busy ? "bm-status-running" : (lastDone && lastDone.done ? "bm-status-done" : "bm-status-idle")) }),
            statusLabel
          )
        ),
        h("div", { className: "bm-msgs", ref: listRef },
          messages.length === 0
            ? h("div", { className: "bm-msg-sys" }, "临时任务，聊完即走 👋")
            : messages.map((m, i) =>
                h("div", { key: i, className: m.role === "user" ? "bm-msg bm-msg-user" : "bm-msg bm-msg-bot" },
                  m.role === "bot" && m.done ? h("div", { className: "bm-msg-meta" }, "✓ 完成") : null,
                  m.text
                )
              ),
          sending ? h("div", { className: "bm-msg-sys" }, bot.name + " 思考中…") : null
        ),
        h("div", { className: "bm-composer" },
          h("input", {
            className: "bm-input",
            placeholder: "给 " + bot.name + " 发消息…",
            value: input,
            onChange: (e) => setInput(e.target.value),
            onKeyDown: (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } },
          }),
          h("button", { className: "bm-btn", onClick: send, disabled: sending || !input.trim() }, "发送")
        )
      );
    }

    /* ---------------- registration ---------------- */
    const cardInjected = (actions) => ({ toggleOverlay: (open) => actions.toggleOverlay(open) });
    const entryInjected = (actions) => ({ toggleOverlay: (open) => actions.toggleOverlay(open) });
    const overlayInjected = (actions) => ({
      addBot: (bot) => actions.addBot(bot),
      removeBot: (id) => actions.removeBot(id),
      appendMessage: (botId, msg) => actions.appendMessage(botId, msg),
      toggleOverlay: (open) => actions.toggleOverlay(open),
      setBusy: (botId) => actions.setBusy(botId),
    });

    function apply(ctx) {
      ctx.slots.inject("settings.plugin.item", () =>
        ctx.slots.register({
          name: "settings.plugin.item",
          id: "bot-mode",
          key: "bot-mode",
          order: 5,
          store: uiStore,
          inject: cardInjected,
        }, BotModeCard)
      );
      ctx.slots.inject("sidebar.footer.action", () =>
        ctx.slots.register({
          name: "sidebar.footer.action",
          id: "bot-mode",
          key: "bot-mode",
          order: 1,
          store: uiStore,
          inject: entryInjected,
        }, BotModeEntry)
      );
      ctx.slots.inject("shell.overlay", () =>
        ctx.slots.register({
          name: "shell.overlay",
          id: "bot-mode",
          key: "bot-mode",
          order: 1,
          store: uiStore,
          inject: overlayInjected,
        }, BotModeOverlay)
      );
    }

    module.exports = { apply, inject: ["slots"] };
    return module.exports;
  },
});
