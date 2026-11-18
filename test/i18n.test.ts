import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  GROOVEPACK_MESSAGES,
  getGroovepackLocale,
  normalizeSupportedLocale,
  readEnvLocale,
  resolveLocaleMessages,
} from "../src/i18n/index.js";

const ENV_KEYS = [
  "GROOVEPACK_LOCALE",
  "NEXT_PUBLIC_GROOVEPACK_LOCALE",
] as const;

describe("i18n", () => {
  afterEach(() => {
    for (const key of ENV_KEYS) {
      delete process.env[key];
    }
  });

  it("defaults to 'en' when no locale is configured", () => {
    assert.equal(getGroovepackLocale(), "en");
    assert.deepEqual(resolveLocaleMessages(), GROOVEPACK_MESSAGES.en);
  });

  it("normalizes region tags and rejects unsupported locales", () => {
    assert.equal(normalizeSupportedLocale("es-AR"), "es");
    assert.equal(normalizeSupportedLocale("PT_BR"), "pt");
    assert.equal(normalizeSupportedLocale("fr-FR"), "fr");
    assert.equal(normalizeSupportedLocale("it"), "it");
    assert.equal(normalizeSupportedLocale("de-DE"), undefined);
    assert.equal(normalizeSupportedLocale(123), undefined);
  });

  it("reads GROOVEPACK_LOCALE and NEXT_PUBLIC_GROOVEPACK_LOCALE env vars", () => {
    process.env.NEXT_PUBLIC_GROOVEPACK_LOCALE = "pt-BR";
    assert.equal(readEnvLocale(), "pt");
    assert.equal(getGroovepackLocale(), "pt");
    assert.deepEqual(resolveLocaleMessages(), GROOVEPACK_MESSAGES.pt);

    process.env.GROOVEPACK_LOCALE = "es";
    assert.equal(readEnvLocale(), "es");
    assert.equal(getGroovepackLocale(), "es");
    assert.deepEqual(resolveLocaleMessages(), GROOVEPACK_MESSAGES.es);
  });
});
