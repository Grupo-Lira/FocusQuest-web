"use client";

import { useEffect, useSyncExternalStore } from "react";
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, Language, translate } from "./index";

const CHANGE_EVENT = "focusquest-language-change";
let memoryLanguage: Language = DEFAULT_LANGUAGE;

function getLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === "en" || stored === "pt-BR" ? stored : DEFAULT_LANGUAGE;
  } catch {
    return memoryLanguage;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

export function useLanguage() {
  const language = useSyncExternalStore(subscribe, getLanguage, () => DEFAULT_LANGUAGE);

  const setLanguage = (next: Language) => {
    memoryLanguage = next;
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // Keep the selection for the current page when storage is unavailable.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return { language, setLanguage };
}

export function useT() {
  const { language } = useLanguage();
  return (source: string, values?: Record<string, string | number>) =>
    translate(source, language, values);
}

export function T({ text, values }: { text: string; values?: Record<string, string | number> }) {
  const t = useT();
  return t(text, values);
}

export function LanguageSync() {
  const { language } = useLanguage();
  useEffect(() => {
    document.documentElement.lang = language;
    const description = document.querySelector<HTMLMetaElement>("meta[name=\"description\"]");
    if (description) {
      description.content = translate(
        "Desafie a sua mente com o Focus Quest, um jogo de perguntas e respostas que testa seus conhecimentos em diversas áreas. Aprenda enquanto se diverte!",
        language,
      );
    }
  }, [language]);
  return null;
}
