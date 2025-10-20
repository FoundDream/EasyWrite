export default defineBackground(() => {
  console.log("Writing Assistant background script loaded", {
    id: browser.runtime.id,
  });

  // 监听来自content script的翻译请求
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "TRANSLATE") {
      handleTranslate(message.text).then(sendResponse);
      return true; // 保持消息通道开放
    }
  });
});

async function handleTranslate(
  text: string
): Promise<{ success: boolean; result?: string; error?: string }> {
  // 获取设置
  const { settings } = await browser.storage.local.get("settings");

  if (!settings || settings.apiProvider === "mymemory") {
    return await translateWithMyMemory(text);
  }

  return { success: false, error: "未配置翻译API" };
}

async function translateWithMyMemory(text: string) {
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=zh|en`
    );

    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return { success: true, result: data.responseData.translatedText };
    }

    throw new Error("Translation API returned no result");
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
