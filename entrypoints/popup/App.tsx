import { ReactNode, useEffect, useMemo, useState } from "react";

type WritingStyle = "formal" | "concise" | "friendly";
type TranslateStatus = "idle" | "translating" | "done";
type ActiveView = "translate" | "settings";

interface Settings {
  apiKey: string;
  writingStyle: WritingStyle;
  enableAutoDetect: boolean;
  enableShortcut: boolean;
}

const defaultSettings: Settings = {
  apiKey: "",
  writingStyle: "formal",
  enableAutoDetect: true,
  enableShortcut: true,
};

const styleLabels: Record<WritingStyle, string> = {
  formal: "正式风格",
  concise: "简洁风格",
  friendly: "友好风格",
};

const statusMeta: Record<
  TranslateStatus,
  {
    tone: string;
    getLabel: (autoDetectEnabled: boolean) => string;
    helper: string;
  }
> = {
  idle: {
    tone: "bg-gray-100 text-gray-600 border border-gray-200",
    getLabel: (autoDetectEnabled) =>
      autoDetectEnabled ? "已检测到中文，准备翻译" : "待翻译",
    helper: "选中文本后点击翻译按钮即可开始。",
  },
  translating: {
    tone: "bg-blue-100 text-blue-600 border border-blue-200",
    getLabel: () => "正在翻译…",
    helper: "完成后可选择替换原文或复制英文稿。",
  },
  done: {
    tone: "bg-green-100 text-green-700 border border-green-200",
    getLabel: () => "翻译完成",
    helper: "请检查润色建议后再替换原文。",
  },
};

interface StatusBadgeProps {
  status: TranslateStatus;
  enableAutoDetect: boolean;
}

function StatusBadge({ status, enableAutoDetect }: StatusBadgeProps) {
  const meta = statusMeta[status];
  return (
    <div className="flex flex-col gap-1 text-right">
      <span
        className={`inline-flex items-center justify-end gap-1 rounded-full px-3 py-1 text-xs font-medium ${meta.tone}`}
      >
        {meta.getLabel(enableAutoDetect)}
      </span>
      <span className="text-[10px] font-medium text-gray-400">
        {meta.helper}
      </span>
    </div>
  );
}

interface CardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

function Card({ title, description, action, footer, children }: CardProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white/95 p-5 shadow-sm backdrop-blur">
      {(title || action) && (
        <header className="flex items-start justify-between gap-3">
          <div>
            {title && (
              <p className="text-sm font-semibold text-gray-800">{title}</p>
            )}
            {description && (
              <p className="mt-1 text-xs text-gray-500">{description}</p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className={title ? "mt-4" : undefined}>{children}</div>
      {footer && <div className="mt-4">{footer}</div>}
    </section>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-blue-500 text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-100"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

interface TranslateViewProps {
  draft: string;
  translation: string;
  status: TranslateStatus;
  showSuggestions: boolean;
  copied: boolean;
  settings: Settings;
  onDraftChange: (value: string) => void;
  onTranslate: () => void;
  onToggleSuggestions: () => void;
  onReplaceOriginal: () => void;
  onCopy: () => void;
}

function TranslateView({
  draft,
  translation,
  status,
  showSuggestions,
  copied,
  settings,
  onDraftChange,
  onTranslate,
  onToggleSuggestions,
  onReplaceOriginal,
  onCopy,
}: TranslateViewProps) {
  const translationCard = useMemo(() => {
    if (status === "idle") {
      return null;
    }

    if (status === "translating") {
      return (
        <Card
          title="翻译与润色结果"
          description="生成完成后会自动展示英文稿。"
          action={
            <button
              className="text-xs text-blue-600 hover:text-blue-500 transition"
              onClick={onToggleSuggestions}
              disabled
            >
              显示提示
            </button>
          }
        >
          <p className="text-sm text-gray-500">
            正在生成英文润色稿，请稍候…
          </p>
        </Card>
      );
    }

    return (
      <Card
        title="翻译与润色结果"
        description="可直接替换原文，或复制英文到剪贴板。"
        action={
          <button
            className="text-xs text-blue-600 hover:text-blue-500 transition"
            onClick={onToggleSuggestions}
          >
            {showSuggestions ? "隐藏提示" : "显示提示"}
          </button>
        }
        footer={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <button
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-blue-200 hover:text-blue-600"
                onClick={onReplaceOriginal}
              >
                替换原文
              </button>
              <button
                className="rounded-lg border border-blue-500 px-3 py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-500 hover:text-white"
                onClick={onCopy}
              >
                复制英文
              </button>
            </div>
            {copied && (
              <span className="text-xs text-green-600">已复制到剪贴板</span>
            )}
          </div>
        }
      >
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase text-green-600">
            Translation
          </p>
          <div className="whitespace-pre-wrap rounded-lg bg-gray-100/80 p-3 text-sm text-gray-800">
            {translation}
          </div>
        </div>
        {showSuggestions && (
          <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700">
            建议：检查技术术语是否准确；如需更正式语气，可在设置中切换到“正式风格”。
          </div>
        )}
      </Card>
    );
  }, [
    copied,
    onCopy,
    onReplaceOriginal,
    onToggleSuggestions,
    showSuggestions,
    status,
    translation,
  ]);

  return (
    <div className="space-y-4">
      <Card
        title="翻译输入"
        description="在任意网页的输入框或文本域中输入中文，翻译后可直接替换原文。"
        action={
          <StatusBadge
            status={status}
            enableAutoDetect={settings.enableAutoDetect}
          />
        }
        footer={
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span>
              {settings.enableShortcut
                ? "快捷键：Ctrl + Enter / ⌘ + Enter"
                : "快捷键未启用，可在设置中打开"}
            </span>
            <button
              className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
              onClick={onTranslate}
            >
              {settings.enableShortcut ? "翻译 (Ctrl + Enter)" : "翻译"}
            </button>
          </div>
        }
      >
        <textarea
          className="h-28 w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          placeholder="示例：大家好，这是我的功能说明，请帮我翻译并润色。"
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
        />
      </Card>

      {translationCard}

      <Card title="使用小贴士">
        <ul className="space-y-2 text-xs text-gray-500">
          <li>
            · 支持 textarea 与单行文本框，已读写状态下才会显示翻译按钮。
          </li>
          <li>
            · {settings.enableAutoDetect
              ? "自动检测中文已开启，可在设置中关闭。"
              : "自动检测中文未开启，可在设置中启用。"}
          </li>
          <li>
            · 翻译完成后仍保留原始选区，方便再次编辑。
          </li>
        </ul>
      </Card>
    </div>
  );
}

interface SettingsViewProps {
  settings: Settings;
  saved: boolean;
  onChange: (next: Settings) => void;
  onSave: () => void;
}

function SettingsView({ settings, saved, onChange, onSave }: SettingsViewProps) {
  return (
    <div className="space-y-4">
      <Card title="API 设置" description="保存 OpenAI API Key 用于翻译调用。">
        <label className="text-xs font-medium text-gray-500">
          OpenAI API Key
        </label>
        <input
          type="password"
          className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          placeholder="sk-..."
          value={settings.apiKey}
          onChange={(event) =>
            onChange({ ...settings, apiKey: event.target.value })
          }
        />
        {saved && (
          <p className="mt-2 text-xs text-green-600">保存成功</p>
        )}
      </Card>

      <Card title="翻译风格" description="选择合适的表达方式。">
        <div className="grid grid-cols-1 gap-2">
          {(Object.keys(styleLabels) as WritingStyle[]).map((style) => {
            const active = settings.writingStyle === style;
            return (
              <button
                key={style}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-sm transition ${
                  active
                    ? "border-blue-400 bg-blue-50 text-blue-600"
                    : "border-gray-200 text-gray-600 hover:border-blue-200"
                }`}
                onClick={() =>
                  onChange({ ...settings, writingStyle: style })
                }
              >
                <span>{styleLabels[style]}</span>
                <span
                  className={`h-3 w-3 rounded-full border ${
                    active
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="偏好设置">
        <div className="space-y-3 text-sm text-gray-600">
          <label className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 transition hover:border-blue-200">
            <span>自动检测中文内容</span>
            <input
              type="checkbox"
              checked={settings.enableAutoDetect}
              onChange={(event) =>
                onChange({ ...settings, enableAutoDetect: event.target.checked })
              }
            />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 transition hover:border-blue-200">
            <span>启用快捷键 Ctrl + Enter</span>
            <input
              type="checkbox"
              checked={settings.enableShortcut}
              onChange={(event) =>
                onChange({ ...settings, enableShortcut: event.target.checked })
              }
            />
          </label>
        </div>
      </Card>

      <button
        className="w-full rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
        onClick={onSave}
      >
        {saved ? "✓ 保存成功" : "保存设置"}
      </button>
    </div>
  );
}

function createMockTranslation(source: string, style: WritingStyle) {
  if (!source.trim()) {
    return "";
  }
  const prefixMap: Record<WritingStyle, string> = {
    formal: "Formally polished English:",
    concise: "Clear and concise English:",
    friendly: "Friendly conversational English:",
  };
  return `${prefixMap[style]}\n${source
    .trim()
    .replace(/\s+/g, " ")
    .replace(/。/g, ".")}`;
}

function App() {
  const [activeView, setActiveView] = useState<ActiveView>("translate");
  const [draft, setDraft] = useState("");
  const [translation, setTranslation] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [status, setStatus] = useState<TranslateStatus>("idle");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    browser.storage.local.get("settings").then((result) => {
      if (result.settings) {
        setSettings({ ...defaultSettings, ...result.settings });
      }
    });
  }, []);

  const handleTranslate = () => {
    if (!draft.trim()) {
      setStatus("idle");
      setTranslation("");
      return;
    }
    setStatus("translating");
    setShowSuggestions(true);
    setCopied(false);
    setTimeout(() => {
      setTranslation(createMockTranslation(draft, settings.writingStyle));
      setStatus("done");
    }, 600);
  };

  const handleReplaceOriginal = () => {
    if (translation) {
      setDraft(translation);
    }
  };

  const handleCopy = async () => {
    if (!translation) {
      return;
    }
    try {
      await navigator.clipboard.writeText(translation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.warn("clipboard copy not available", error);
    }
  };

  const handleSave = async () => {
    await browser.storage.local.set({ settings });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="w-[360px] min-h-[480px] bg-slate-50/95 text-slate-900">
      <header className="px-5 pt-5">
        <div className="rounded-2xl border border-blue-100 bg-white/95 px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-semibold text-gray-900">EasyWrite</p>
              <p className="text-xs text-gray-500">
                中文写作翻译 · 任意网站可用
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-600">
              Beta
            </span>
          </div>
        </div>
      </header>

      <nav className="px-5 pt-4">
        <div className="flex gap-2 rounded-2xl border border-gray-200 bg-white/95 p-2 shadow-sm">
          <TabButton
            active={activeView === "translate"}
            onClick={() => setActiveView("translate")}
          >
            翻译助手
          </TabButton>
          <TabButton
            active={activeView === "settings"}
            onClick={() => setActiveView("settings")}
          >
            设置
          </TabButton>
        </div>
      </nav>

      <main className="px-5 py-4">
        {activeView === "translate" ? (
          <TranslateView
            draft={draft}
            translation={translation}
            status={status}
            showSuggestions={showSuggestions}
            copied={copied}
            settings={settings}
            onDraftChange={setDraft}
            onTranslate={handleTranslate}
            onToggleSuggestions={() =>
              setShowSuggestions((previous) => !previous)
            }
            onReplaceOriginal={handleReplaceOriginal}
            onCopy={handleCopy}
          />
        ) : (
          <SettingsView
            settings={settings}
            saved={saved}
            onChange={setSettings}
            onSave={handleSave}
          />
        )}
      </main>
    </div>
  );
}

export default App;
