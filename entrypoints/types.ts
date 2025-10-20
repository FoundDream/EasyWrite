export interface Settings {
  apiProvider: "mymemory" | "custom";
  customApiUrl?: string;
  customApiKey?: string;
}

export interface TranslateRequest {
  text: string;
}

export interface TranslateResponse {
  translatedText: string;
  success: boolean;
  error?: string;
}

export default defineUnlistedScript;
