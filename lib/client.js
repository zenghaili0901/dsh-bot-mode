/* dsh-bot-mode — client bundle (web).
 * Hand-authored __ModuleLoader__ format. Hermes-inspired roster UI:
 * docked left panel (BOTS + search + rows + New Agent), modal create dialog,
 * chat view with think-time indicator. Host route: POST /bot-mode/chat.
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

    /* ---------------- styles (theme-aware, Hermes-inspired) ---------------- */
    const css = [
      /* docked left panel — sits right of the sidebar like a sibling region */
      ".bm-overlay{position:fixed;left:266px;top:12px;bottom:12px;width:340px;max-height:none;display:flex;flex-direction:column;border:1px solid var(--dsw-alias-border-l2);border-radius:14px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 92%,transparent);backdrop-filter:blur(20px);box-shadow:0 12px 40px rgba(2,6,20,.25);z-index:9999;overflow:hidden;pointer-events:auto;font-size:13px;color:var(--dsw-alias-label-primary)}",
      ".bm-overlay-head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px 8px;border-bottom:1px solid var(--dsw-alias-border-l1);background:linear-gradient(120deg,color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent),color-mix(in srgb,#7b5cff 8%,transparent))}",
      ".bm-overlay-title{font-weight:700;font-size:14px;display:flex;align-items:center;gap:8px;letter-spacing:.3px}",
      ".bm-overlay-body{padding:10px 12px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;flex:1}",
      ".bm-search{width:100%;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:9px;padding:7px 10px;color:var(--dsw-alias-label-primary);font-size:12px;outline:none}",
      ".bm-search:focus{border-color:var(--dsw-alias-brand-primary)}",
      ".bm-search::placeholder{color:var(--dsw-alias-label-secondary)}",
      ".bm-bot{display:flex;align-items:center;gap:10px;padding:9px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:11px;background:var(--dsw-alias-bg-layer-1);cursor:pointer;transition:background .15s}",
      ".bm-bot:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".bm-bot-avatar{font-size:17px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:50%;flex:none}",
      ".bm-bot-mid{min-width:0;flex:1}",
      ".bm-bot-row1{display:flex;align-items:center;gap:8px}",
      ".bm-bot-name{font-weight:600;font-size:13px;color:var(--dsw-alias-label-primary)}",
      ".bm-bot-status{margin-left:auto;color:var(--dsw-alias-label-secondary);font-size:10px;flex:none}",
      ".bm-bot-preview{color:var(--dsw-alias-label-secondary);font-size:11px;line-height:15px;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".bm-bot-del{margin-left:auto;border:none;background:none;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:14px;padding:4px 8px;border-radius:6px;flex:none}",
      ".bm-bot-del:hover{color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent)}",
      ".bm-bot-del.confirm{color:var(--dsw-alias-state-error-primary);font-size:12px;font-weight:600;border:1px solid color-mix(in srgb,var(--dsw-alias-state-error-primary) 45%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 14%,transparent)}",
      ".bm-empty{color:var(--dsw-alias-label-secondary);text-align:center;padding:18px 0;font-size:12px}",
      ".bm-btn{border:1px solid transparent;background:linear-gradient(135deg,#4d6bfe,#7b5cff);color:#fff;border-radius:10px;padding:8px 14px;font-size:12px;cursor:pointer;font-weight:600}",
      ".bm-btn:hover{filter:brightness(1.1)}",
      ".bm-btn:disabled{opacity:.5;cursor:default}",
      ".bm-btn-ghost{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary)}",
      ".bm-overlay-foot{padding:10px 12px;border-top:1px solid var(--dsw-alias-border-l1);display:flex;gap:8px}",
      ".bm-overlay-foot .bm-btn{flex:1}",
      /* modal */
      ".bm-modal{position:fixed;inset:0;background:rgba(2,6,20,.45);backdrop-filter:blur(3px);z-index:10001;display:flex;align-items:center;justify-content:center;pointer-events:auto}",
      ".bm-modal-card{width:420px;max-width:92vw;max-height:86vh;overflow-y:auto;display:flex;flex-direction:column;gap:10px;border:1px solid var(--dsw-alias-border-l2);border-radius:16px;background:var(--dsw-alias-bg-layer-2);box-shadow:0 24px 60px rgba(2,6,20,.5);padding:18px;font-size:13px;color:var(--dsw-alias-label-primary)}",
      ".bm-modal-title{font-weight:700;font-size:15px;display:flex;align-items:center;gap:8px}",
      ".bm-modal-sub{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
      ".bm-field{display:flex;flex-direction:column;gap:4px}",
      ".bm-field label{color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:600}",
      ".bm-avatar-pick{display:flex;gap:8px;align-items:center;flex-wrap:wrap}",
      ".bm-avatar-pick .bm-bot-avatar{cursor:pointer;border:2px solid transparent}",
      ".bm-avatar-pick .sel{border-color:var(--dsw-alias-brand-primary)}",
      ".bm-color-pick{display:flex;gap:6px;flex-wrap:wrap}",
      ".bm-color-pick button{width:22px;height:22px;border-radius:50%;border:2px solid transparent;cursor:pointer}",
      ".bm-color-pick button.sel{border-color:var(--dsw-alias-label-primary)}",
      ".bm-input{width:100%;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:10px;padding:8px 10px;color:var(--dsw-alias-label-primary);font-size:12px;outline:none}",
      ".bm-input:focus{border-color:var(--dsw-alias-brand-primary)}",
      ".bm-input::placeholder{color:var(--dsw-alias-label-secondary)}",
      ".bm-textarea{width:100%;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:10px;padding:8px 10px;color:var(--dsw-alias-label-primary);font-size:12px;outline:none;resize:vertical;min-height:72px;font-family:inherit}",
      ".bm-textarea::placeholder{color:var(--dsw-alias-label-secondary)}",
      ".bm-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:4px}",
      ".bm-advanced{border:1px solid var(--dsw-alias-border-l1);border-radius:10px;overflow:hidden}",
      ".bm-advanced-head{display:flex;align-items:center;justify-content:space-between;width:100%;border:none;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);cursor:pointer;padding:8px 10px;font-size:12px;font-weight:600}",
      ".bm-advanced-body{padding:10px;border-top:1px solid var(--dsw-alias-border-l1);display:flex;flex-direction:column;gap:8px}",
      /* chat view */
      ".bm-chat{display:flex;flex-direction:column;height:100%;min-height:280px}",
      ".bm-chat-head{display:flex;align-items:center;gap:8px;padding:10px 4px 8px;border-bottom:1px solid var(--dsw-alias-border-l1)}",
      ".bm-back{border:none;background:none;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:16px;padding:2px 6px;border-radius:6px}",
      ".bm-back:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}",
      ".bm-msgs{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:10px 0}",
      ".bm-msg{max-width:88%;padding:8px 12px;border-radius:12px;line-height:19px;white-space:pre-wrap;word-break:break-word;font-size:12.5px}",
      ".bm-msg-user{align-self:flex-end;background:linear-gradient(135deg,#4d6bfe,#7b5cff);color:#fff;border-bottom-right-radius:4px}",
      ".bm-msg-bot{align-self:flex-start;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-bottom-left-radius:4px}",
      ".bm-msg-sys{align-self:center;color:var(--dsw-alias-label-secondary);font-size:11px}",
      ".bm-composer{display:flex;gap:8px;padding-top:8px;border-top:1px solid var(--dsw-alias-border-l1)}",
      ".bm-composer .bm-input{flex:1}",
      /* settings card */
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

    /* ---------------- persisted roster (localStorage) ---------------- */
    const BOTS_KEY = "dsh-bot-mode.bots";
    const AVATAR_COLORS = ["#4d6bfe", "#7b5cff", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#64748b"];
    const DEFAULT_BOTS = [
      { id: "researcher", name: "研究员", emoji: "🔬", color: "#4d6bfe", persona: "你是一位严谨的研究助理：擅长检索资料、交叉验证多个来源，并输出带引用的结构化报告。", createdAt: Date.now() },
      { id: "reviewer", name: "代码评审", emoji: "🧐", color: "#22c55e", persona: "你是一位资深代码评审员：关注正确性、可读性与性能，每次给出可执行的具体建议。", createdAt: Date.now() },
    ];
    function loadBots() {
      try {
        const raw = localStorage.getItem(BOTS_KEY);
        const arr = raw ? JSON.parse(raw) : null;
        if (Array.isArray(arr) && arr.length) return arr;
      } catch {}
      return DEFAULT_BOTS;
    }
    function saveBots(bots) {
      try { localStorage.setItem(BOTS_KEY, JSON.stringify(bots)); } catch {}
    }

    /* ---------------- shared store ---------------- */
    const uiStore = defineStore({
      init: () => ({ overlayOpen: false, bots: loadBots(), revision: -1 }),
      actions: {
        toggleOverlay: (d, open) => { d.overlayOpen = open; },
        addBot: (d, bot) => { d.bots = d.bots.concat([bot]); saveBots(d.bots); },
        removeBot: (d, id) => { d.bots = d.bots.filter((b) => b.id !== id); saveBots(d.bots); },
        sync: (d, next, revision) => {
          if (revision <= d.revision) return;
          d.overlayOpen = next.overlayOpen;
          d.bots = next.bots;
          d.revision = revision;
        },
      },
    });

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
        h("div", { className: "bm-card-desc" }, h("strong", null, "点击侧边栏底部 🐋 或这里打开 Bot 名单。"))
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

    /* ————— docked BOTS panel ————— */
    function BotModeOverlay(props) {
      const { useStore, useSessions, addBot, removeBot, toggleOverlay } = props;
      const state = useStore((s) => s);
      const [activeBot, setActiveBot] = useState(null);
      const [creating, setCreating] = useState(false);
      const sessions = useSessions ? useSessions((s) => s) : null;
      const sessionId = sessions && sessions.current ? sessions.current : undefined;
      if (!state.overlayOpen) return null;
      return h("div", { className: "bm-overlay" },
        h("div", { className: "bm-overlay-head" },
          h("span", { className: "bm-overlay-title" }, "🐋 BOTS"),
          h("button", { className: "bm-back", onClick: () => toggleOverlay(false), title: "关闭" }, "✕")
        ),
        h("div", { className: "bm-overlay-body" },
          activeBot
            ? h(BotChat, { bot: activeBot, sessionId, onBack: () => setActiveBot(null) })
            : h(BotRoster, { bots: state.bots, onPick: (bot) => setActiveBot(bot), onNew: () => setCreating(true), onRemove: (id) => removeBot(id) })
        ),
        creating ? h(NewBotModal, {
          onClose: () => setCreating(false),
          onCreate: (bot) => { addBot(bot); setCreating(false); },
        }) : null
      );
    }

    function BotRoster(props) {
      const { bots, onPick, onNew, onRemove } = props;
      const [query, setQuery] = useState("");
      const [confirmId, setConfirmId] = useState(null);
      useEffect(() => {
        if (confirmId === null) return;
        const timer = setTimeout(() => setConfirmId(null), 3000);
        return () => clearTimeout(timer);
      }, [confirmId]);
      const q = query.trim().toLowerCase();
      const shown = q ? bots.filter((b) => (b.name || "").toLowerCase().includes(q) || (b.persona || "").toLowerCase().includes(q)) : bots;
      return h("div", { style: { display: "flex", flexDirection: "column", gap: 8, flex: 1 } },
        h("input", { className: "bm-search", placeholder: "搜索 Bot…", value: query, onChange: (e) => setQuery(e.target.value) }),
        shown.length === 0
          ? h("div", { className: "bm-empty" }, q ? "没有匹配的 Bot" : "还没有 Bot，点下方新建一个吧 ✨")
          : shown.map((bot) =>
              h("div", { key: bot.id, className: "bm-bot", onClick: () => onPick(bot) },
                h("span", { className: "bm-bot-avatar", style: { background: avatarBg(bot.color) } }, bot.emoji),
                h("div", { className: "bm-bot-mid" },
                  h("div", { className: "bm-bot-row1" },
                    h("span", { className: "bm-bot-name" }, bot.name),
                    h("span", { className: "bm-bot-status" }, "刚刚")
                  ),
                  h("div", { className: "bm-bot-preview" }, bot.persona)
                ),
                h("button", {
                  className: "bm-bot-del" + (confirmId === bot.id ? " confirm" : ""),
                  onClick: (e) => {
                    e.stopPropagation();
                    if (confirmId === bot.id) { onRemove(bot.id); setConfirmId(null); }
                    else { setConfirmId(bot.id); }
                  },
                }, confirmId === bot.id ? "确认？" : "🗑")
              )
            ),
        h("div", { className: "bm-overlay-foot" },
          h("button", { className: "bm-btn", onClick: onNew }, "＋ New Agent")
        )
      );
    }

    function avatarBg(color) {
      return color ? "linear-gradient(135deg," + color + "," + color + "33)" : "linear-gradient(135deg,#4d6bfe,#7b5cff)";
    }

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
              EMOTIONS.map((e) => h("span", { key: e, className: "bm-bot-avatar" + (e === emoji ? " sel" : ""), style: { background: avatarBg(color) }, onClick: () => setEmoji(e) }, e))
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
            h("textarea", { className: "bm-textarea", placeholder: "如：你是精通 SQL 的数据分析师，输出简洁可执行的结论…", value: persona, onChange: (e) => setPersona(e.target.value) })
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

    /* ————— chat view ————— */
    function BotChat(props) {
      const { bot, sessionId, onBack } = props;
      const [messages, setMessages] = useState([]);
      const [input, setInput] = useState("");
      const [sending, setSending] = useState(false);
      const [thinkMs, setThinkMs] = useState(0);
      const listRef = useRef(null);
      const startRef = useRef(0);
      useEffect(() => {
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      }, [messages, sending]);

      const send = async () => {
        const text = input.trim();
        if (!text || sending) return;
        setMessages((m) => m.concat([{ role: "user", text }]));
        setInput("");
        setSending(true);
        startRef.current = Date.now();
        try {
          const res = await fetch("/bot-mode/chat", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ sessionId, bot, message: text }),
          });
          const data = await res.json();
          const reply = data && data.ok ? data.reply : (data && data.error ? "⚠️ " + data.error : "（无回复）");
          setThinkMs(Date.now() - startRef.current);
          setMessages((m) => m.concat([{ role: "bot", text: reply, thinkMs: Date.now() - startRef.current }]));
        } catch (err) {
          setThinkMs(Date.now() - startRef.current);
          setMessages((m) => m.concat([{ role: "bot", text: "请求失败: " + (err.message || err), thinkMs: Date.now() - startRef.current }]));
        }
        setSending(false);
      };

      return h("div", { className: "bm-chat" },
        h("div", { className: "bm-chat-head" },
          h("button", { className: "bm-back", onClick: onBack }, "←"),
          h("span", { className: "bm-bot-avatar", style: { background: avatarBg(bot.color), fontSize: 15, width: 26, height: 26 } }, bot.emoji),
          h("span", { className: "bm-bot-name" }, bot.name)
        ),
        h("div", { className: "bm-msgs", ref: listRef },
          messages.length === 0
            ? h("div", { className: "bm-msg-sys" }, "与 " + bot.name + " 打个招呼吧 👋")
            : messages.map((m, i) =>
                h("div", { key: i, className: m.role === "user" ? "bm-msg bm-msg-user" : "bm-msg bm-msg-bot" },
                  m.role === "bot" && m.thinkMs ? h("div", { style: { fontSize: 10, color: "var(--dsw-alias-label-secondary)", marginBottom: 3 } }, "思考了 " + Math.round(m.thinkMs / 1000) + "s") : null,
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
      toggleOverlay: (open) => actions.toggleOverlay(open),
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
