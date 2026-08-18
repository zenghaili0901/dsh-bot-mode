/* dsh-bot-mode — client bundle (web).
 * Hand-authored __ModuleLoader__ format: the browser half of the plugin,
 * discovered through package.json's dsh.client declaration (exports ./client).
 * M3 scope: roster UI + per-bot chat view. Chat turns POST to the host route
 * /bot-mode/chat (see lib/index.js); history is client-owned per view.
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

    /* ---------------- styles (DeepSeek blue-violet glass) ---------------- */
    const css = [
      ".bm-overlay{position:fixed;right:20px;bottom:20px;width:420px;max-height:72vh;display:flex;flex-direction:column;border:1px solid rgba(77,107,254,.25);border-radius:16px;background:rgba(16,20,34,.88);backdrop-filter:blur(20px);box-shadow:0 12px 40px rgba(2,6,20,.5);z-index:9999;overflow:hidden;pointer-events:auto;font-size:13px;color:#e8ecf8}",
      ".bm-overlay-head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid rgba(77,107,254,.18);background:linear-gradient(120deg,rgba(77,107,254,.16),rgba(123,92,255,.10))}",
      ".bm-overlay-title{font-weight:600;font-size:14px;display:flex;align-items:center;gap:8px}",
      ".bm-overlay-body{padding:12px 14px;overflow-y:auto;display:flex;flex-direction:column;gap:10px}",
      ".bm-bot{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid rgba(77,107,254,.16);border-radius:12px;background:rgba(255,255,255,.03);cursor:pointer;transition:background .15s}",
      ".bm-bot:hover{background:rgba(77,107,254,.12)}",
      ".bm-bot-emoji{font-size:22px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:linear-gradient(135deg,rgba(77,107,254,.35),rgba(123,92,255,.35));flex:none}",
      ".bm-bot-name{font-weight:600;font-size:13px}",
      ".bm-bot-persona{color:#9aa4c0;font-size:11px;line-height:16px;margin-top:2px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}",
      ".bm-bot-del{margin-left:auto;border:none;background:none;color:#9aa4c0;cursor:pointer;font-size:14px;padding:4px;border-radius:6px;flex:none}",
      ".bm-bot-del:hover{color:#ff6b81;background:rgba(255,107,129,.12)}",
      ".bm-empty{color:#9aa4c0;text-align:center;padding:18px 0;font-size:12px}",
      ".bm-btn{border:1px solid rgba(77,107,254,.4);background:linear-gradient(135deg,#4d6bfe,#7b5cff);color:#fff;border-radius:10px;padding:7px 14px;font-size:12px;cursor:pointer;font-weight:600}",
      ".bm-btn:hover{filter:brightness(1.1)}",
      ".bm-btn:disabled{opacity:.5;cursor:default}",
      ".bm-input{width:100%;box-sizing:border-box;border:1px solid rgba(77,107,254,.3);background:rgba(255,255,255,.05);border-radius:10px;padding:8px 10px;color:#e8ecf8;font-size:12px;outline:none}",
      ".bm-input:focus{border-color:#7b5cff}",
      ".bm-textarea{width:100%;box-sizing:border-box;border:1px solid rgba(77,107,254,.3);background:rgba(255,255,255,.05);border-radius:10px;padding:8px 10px;color:#e8ecf8;font-size:12px;outline:none;resize:vertical;min-height:64px;font-family:inherit}",
      ".bm-form{display:flex;flex-direction:column;gap:8px}",
      ".bm-form-row{display:flex;gap:8px}",
      ".bm-form-row .bm-input{flex:1}",
      ".bm-emoji-pick{display:flex;gap:4px;flex-wrap:wrap}",
      ".bm-emoji-pick button{border:1px solid rgba(77,107,254,.25);background:rgba(255,255,255,.04);border-radius:8px;font-size:16px;padding:3px 7px;cursor:pointer}",
      ".bm-emoji-pick button.sel{background:linear-gradient(135deg,#4d6bfe,#7b5cff);border-color:transparent}",
      ".bm-entry-btn{display:flex;align-items:center;gap:8px;width:100%;border:none;background:none;color:#9aa4c0;cursor:pointer;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:600}",
      ".bm-entry-btn:hover{color:#e8ecf8;background:rgba(77,107,254,.14)}",
      ".bm-card{border:1px solid rgba(77,107,254,.25);background:linear-gradient(120deg,rgba(77,107,254,.10),rgba(123,92,255,.06));border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:4px}",
      ".bm-card-title{color:#e8ecf8;font-size:14px;font-weight:600;display:flex;align-items:center;gap:8px}",
      ".bm-card-desc{color:#9aa4c0;font-size:12px;line-height:18px}",
      ".bm-toggle{margin-left:auto;border:1px solid rgba(77,107,254,.4);height:28px;color:#e8ecf8;cursor:pointer;background:rgba(255,255,255,.04);border-radius:14px;flex:none;align-items:center;gap:6px;padding:0 10px 0 6px;font-size:12px;display:inline-flex}",
      ".bm-toggle[aria-pressed=true]{background:linear-gradient(135deg,#4d6bfe,#7b5cff);color:#fff;border-color:transparent}",
      /* chat view */
      ".bm-chat{display:flex;flex-direction:column;height:100%;min-height:280px}",
      ".bm-chat-head{display:flex;align-items:center;gap:8px;padding:10px 4px 8px;border-bottom:1px solid rgba(77,107,254,.14)}",
      ".bm-back{border:none;background:none;color:#9aa4c0;cursor:pointer;font-size:16px;padding:2px 6px;border-radius:6px}",
      ".bm-back:hover{color:#e8ecf8;background:rgba(77,107,254,.14)}",
      ".bm-msgs{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:10px 0}",
      ".bm-msg{max-width:88%;padding:8px 12px;border-radius:12px;line-height:19px;white-space:pre-wrap;word-break:break-word}",
      ".bm-msg-user{align-self:flex-end;background:linear-gradient(135deg,#4d6bfe,#7b5cff);color:#fff;border-bottom-right-radius:4px}",
      ".bm-msg-bot{align-self:flex-start;background:rgba(77,107,254,.14);border:1px solid rgba(77,107,254,.18);border-bottom-left-radius:4px}",
      ".bm-msg-sys{align-self:center;color:#9aa4c0;font-size:11px}",
      ".bm-composer{display:flex;gap:8px;padding-top:8px;border-top:1px solid rgba(77,107,254,.14)}",
      ".bm-composer .bm-input{flex:1}",
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
    const DEFAULT_BOTS = [
      { id: "researcher", name: "研究员", emoji: "🔬", persona: "你是一位严谨的研究助理：擅长检索资料、交叉验证多个来源，并输出带引用的结构化报告。" },
      { id: "reviewer", name: "代码评审", emoji: "🧐", persona: "你是一位资深代码评审员：关注正确性、可读性与性能，每次给出可执行的具体建议。" },
    ];
    function loadBots() {
      try {
        const raw = localStorage.getItem(BOTS_KEY);
        const arr = raw ? JSON.parse(raw) : null;
        return Array.isArray(arr) && arr.length ? arr : DEFAULT_BOTS;
      } catch { return DEFAULT_BOTS; }
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
        h("div", { className: "bm-card-desc", style: { color: "#7b5cff" } }, "也可以点击侧边栏底部的 🐋 入口打开 Bot 名单。")
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

    function BotChat(props) {
      const { bot, sessionId, onBack } = props;
      const [messages, setMessages] = useState([]);
      const [input, setInput] = useState("");
      const [sending, setSending] = useState(false);
      const listRef = useRef(null);
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
        try {
          const res = await fetch("/bot-mode/chat", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ sessionId, bot, message: text }),
          });
          const data = await res.json();
          const reply = data && data.ok ? data.reply : (data && data.error ? "⚠️ " + data.error : "（无回复）");
          setMessages((m) => m.concat([{ role: "bot", text: reply }]));
        } catch (err) {
          setMessages((m) => m.concat([{ role: "bot", text: "请求失败: " + (err.message || err) }]));
        }
        setSending(false);
      };

      return h("div", { className: "bm-chat" },
        h("div", { className: "bm-chat-head" },
          h("button", { className: "bm-back", onClick: onBack }, "←"),
          h("span", { style: { fontSize: 16 } }, bot.emoji),
          h("span", { className: "bm-bot-name" }, bot.name),
          h("span", { style: { marginLeft: "auto", color: "#9aa4c0", fontSize: 11 } }, "会话#" + (sessionId || "?").slice(0, 8))
        ),
        h("div", { className: "bm-msgs", ref: listRef },
          messages.length === 0
            ? h("div", { className: "bm-msg-sys" }, "与 " + bot.name + " 打个招呼吧 👋")
            : messages.map((m, i) =>
                h("div", { key: i, className: m.role === "user" ? "bm-msg bm-msg-user" : "bm-msg bm-msg-bot" }, m.text)
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

    function BotModeOverlay(props) {
      const { useStore, useSessions, addBot, removeBot, toggleOverlay } = props;
      const state = useStore((s) => s);
      const [activeBot, setActiveBot] = useState(null);
      const sessions = useSessions ? useSessions((s) => s) : null;
      const sessionId = sessions && sessions.current ? sessions.current : undefined;
      if (!state.overlayOpen) return null;
      return h("div", { className: "bm-overlay" },
        h("div", { className: "bm-overlay-head" },
          h("span", { className: "bm-overlay-title" }, activeBot ? botLabel(activeBot) : "🐋 Bot Mode"),
          h("button", { className: "bm-bot-del", onClick: () => toggleOverlay(false) }, "✕")
        ),
        h("div", { className: "bm-overlay-body" },
          activeBot
            ? h(BotChat, { bot: activeBot, sessionId, onBack: () => setActiveBot(null) })
            : h(BotRoster, { bots: state.bots, onPick: (bot) => setActiveBot(bot), onAdd: (bot) => addBot(bot), onRemove: (id) => removeBot(id) })
        )
      );
    }

    function botLabel(bot) {
      return bot.emoji + " " + bot.name;
    }

    function BotRoster(props) {
      const { bots, onPick, onAdd, onRemove } = props;
      return h("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
        h(BotForm, { onAdd }),
        bots.length === 0
          ? h("div", { className: "bm-empty" }, "还没有 Bot，先新建一个吧 ✨")
          : bots.map((bot) =>
              h("div", { key: bot.id, className: "bm-bot", onClick: () => onPick(bot) },
                h("span", { className: "bm-bot-emoji" }, bot.emoji),
                h("div", { style: { minWidth: 0 } },
                  h("div", { className: "bm-bot-name" }, bot.name),
                  h("div", { className: "bm-bot-persona" }, bot.persona)
                ),
                h("button", { className: "bm-bot-del", onClick: (e) => { e.stopPropagation(); onRemove(bot.id); } }, "🗑")
              )
            )
      );
    }

    function BotForm(props) {
      const [name, setName] = useState("");
      const [persona, setPersona] = useState("");
      const [emoji, setEmoji] = useState("🤖");
      const EMOTIONS = ["🤖", "🐋", "🔬", "🧐", "🎨", "📈", "🛡️", "🧠"];
      const submit = () => {
        const n = name.trim();
        if (!n) return;
        props.onAdd({ id: "bot-" + Date.now(), name: n, emoji, persona: persona.trim() || "你是一位乐于助人的助手。" });
        setName(""); setPersona(""); setEmoji("🤖");
      };
      return h("div", { className: "bm-form" },
        h("div", { className: "bm-form-row" },
          h("input", { className: "bm-input", placeholder: "Bot 名字（如：数据分析师）", value: name, onChange: (e) => setName(e.target.value) })
        ),
        h("div", { className: "bm-emoji-pick" },
          EMOTIONS.map((e) => h("button", { key: e, className: e === emoji ? "sel" : "", onClick: () => setEmoji(e) }, e))
        ),
        h("textarea", { className: "bm-textarea", placeholder: "人格设定（system prompt）：例如「你是精通 SQL 的数据分析师……」", value: persona, onChange: (e) => setPersona(e.target.value) }),
        h("button", { className: "bm-btn", onClick: submit }, "＋ 新建 Bot")
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
