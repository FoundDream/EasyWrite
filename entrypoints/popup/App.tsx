import { useState, useEffect } from "react";
import "./App.css";

interface Settings {
  apiProvider: "mymemory" | "custom";
  customApiUrl?: string;
  customApiKey?: string;
}

function App() {
  const [settings, setSettings] = useState<Settings>({
    apiProvider: "mymemory",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // 从storage加载设置
    browser.storage.local.get("settings").then((result) => {
      if (result.settings) {
        setSettings(result.settings);
      }
    });
  }, []);

  const handleSave = async () => {
    await browser.storage.local.set({ settings });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="popup-container">
      <div className="header">
        <h1>✍️ 写作助手</h1>
        <p className="subtitle">让你的中文写作轻松变成优质英文</p>
      </div>

      <div className="content">
        <div className="section">
          <h2>🎯 使用说明</h2>
          <ul className="instructions">
            <li>在GitHub的Issue或PR页面打开文本框</li>
            <li>输入中文内容</li>
            <li>点击"🌐 中文转英文"按钮</li>
            <li>内容将自动翻译并替换</li>
          </ul>
        </div>

        <div className="section">
          <h2>⚙️ 翻译设置</h2>
          <div className="form-group">
            <label>
              <input
                type="radio"
                name="apiProvider"
                value="mymemory"
                checked={settings.apiProvider === "mymemory"}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    apiProvider: e.target.value as any,
                  })
                }
              />
              <span>MyMemory API（免费，无需配置）</span>
            </label>
          </div>

          <div className="form-group">
            <label>
              <input
                type="radio"
                name="apiProvider"
                value="custom"
                checked={settings.apiProvider === "custom"}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    apiProvider: e.target.value as any,
                  })
                }
              />
              <span>自定义API（支持OpenAI等）</span>
            </label>
          </div>

          {settings.apiProvider === "custom" && (
            <div className="custom-api-settings">
              <div className="form-group">
                <label htmlFor="apiUrl">API地址：</label>
                <input
                  type="text"
                  id="apiUrl"
                  className="input-field"
                  placeholder="https://api.openai.com/v1/chat/completions"
                  value={settings.customApiUrl || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, customApiUrl: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="apiKey">API密钥：</label>
                <input
                  type="password"
                  id="apiKey"
                  className="input-field"
                  placeholder="sk-..."
                  value={settings.customApiKey || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, customApiKey: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <button
            className={`save-btn ${saved ? "saved" : ""}`}
            onClick={handleSave}
          >
            {saved ? "✓ 已保存" : "保存设置"}
          </button>
        </div>

        <div className="section">
          <h2>💡 提示</h2>
          <p className="tip">
            未来版本将支持更多AI服务和上下文收集功能，敬请期待！
          </p>
        </div>
      </div>

      <div className="footer">
        <p>Made with ❤️ for better writing</p>
      </div>
    </div>
  );
}

export default App;
