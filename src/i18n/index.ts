export type Language = "pt-BR" | "en";

export const LANGUAGE_STORAGE_KEY = "focusquest.language";

export const DEFAULT_LANGUAGE: Language = "pt-BR";

import { messages } from "./messages";

export function translate(
  source: string,
  language: Language,
  values?: Record<string, string | number>,
) {
  const message = language === "en" ? (messages[source] ?? source) : source;
  return message.replace(/\{(\w+)\}/g, (match, name: string) =>
    values?.[name] === undefined ? match : String(values[name]),
  );
}
