import { useState, useEffect } from "react";

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
    <div className="w-276px px-5 py-4">
      <div className="text-center text-black text-2xl font-bold">
        <h1>EasyWriter</h1>
      </div>

      <div className="bg-white rounded-lg mt-[-8px] p-5">
        <div className="section">
          <h2 className="text-base font-bold text-[#1f2937] mb-3">
            ⚙️ 翻译设置
          </h2>
          <div className="mb-3">
            <label className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer p-2 rounded-md transition-all duration-200">
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

          <div className="mb-3">
            <label className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer p-2 rounded-md transition-all duration-200">
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
              <div className="mb-3">
                <label
                  htmlFor="apiUrl"
                  className="block text-sm text-[#374151] mb-1"
                >
                  API地址：
                </label>
                <input
                  type="text"
                  id="apiUrl"
                  className="w-full p-2 border border-[#d1d5db] rounded-md text-sm text-[#6b7280] focus:outline-none focus:border-[#667eea] focus:ring-1 focus:ring-[#667eea]/20"
                  placeholder="https://api.openai.com/v1/chat/completions"
                  value={settings.customApiUrl || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, customApiUrl: e.target.value })
                  }
                />
              </div>

              <div className="mb-3">
                <label
                  htmlFor="apiKey"
                  className="block text-sm text-[#374151] mb-1"
                >
                  API密钥：
                </label>
                <input
                  type="password"
                  id="apiKey"
                  className="w-full p-2 border border-[#d1d5db] rounded-md text-sm text-[#6b7280] focus:outline-none focus:border-[#667eea] focus:ring-1 focus:ring-[#667eea]/20"
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
            className={`w-full py-2 bg-[#667eea] text-white rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-[#5363e6] ${
              saved ? "opacity-100" : "opacity-50"
            }`}
            onClick={handleSave}
          >
            {saved ? "✓ 已保存" : "保存设置"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
