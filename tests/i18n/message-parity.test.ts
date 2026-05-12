import { describe, expect, it } from "vitest";
import zhTW from "../../messages/zh-TW.json";
import en from "../../messages/en.json";

type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

function collectKeyPaths(value: JsonValue, prefix = ""): string[] {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return [prefix];
  }
  const paths: string[] = [];
  for (const [key, child] of Object.entries(value)) {
    const next = prefix ? `${prefix}.${key}` : key;
    paths.push(...collectKeyPaths(child as JsonValue, next));
  }
  return paths.sort();
}

function getAtPath(obj: JsonValue, path: string): JsonValue {
  return path.split(".").reduce<JsonValue>((acc, segment) => {
    if (acc !== null && typeof acc === "object" && !Array.isArray(acc) && segment in acc) {
      return (acc as Record<string, JsonValue>)[segment];
    }
    return null;
  }, obj);
}

describe("message catalog parity", () => {
  const zhPaths = collectKeyPaths(zhTW as JsonValue);
  const enPaths = collectKeyPaths(en as JsonValue);

  it("zh-TW and en have identical key sets", () => {
    const missingFromEn = zhPaths.filter((p) => !enPaths.includes(p));
    const extraInEn = enPaths.filter((p) => !zhPaths.includes(p));
    expect(missingFromEn, "keys in zh-TW but missing in en").toEqual([]);
    expect(extraInEn, "keys in en but missing in zh-TW").toEqual([]);
  });

  it("arrays at matching paths have the same length in both locales", () => {
    function collectArrayPaths(value: JsonValue, prefix = ""): Array<{ path: string; len: number }> {
      const out: Array<{ path: string; len: number }> = [];
      if (Array.isArray(value)) {
        out.push({ path: prefix, len: value.length });
        return out;
      }
      if (value !== null && typeof value === "object") {
        for (const [key, child] of Object.entries(value)) {
          const next = prefix ? `${prefix}.${key}` : key;
          out.push(...collectArrayPaths(child as JsonValue, next));
        }
      }
      return out;
    }

    const zhArrays = collectArrayPaths(zhTW as JsonValue);
    for (const { path, len } of zhArrays) {
      const enValue = getAtPath(en as JsonValue, path);
      expect(Array.isArray(enValue), `${path} should be an array in en`).toBe(true);
      expect((enValue as JsonValue[]).length, `${path} length mismatch between zh-TW and en`).toBe(len);
    }
  });

  it("every leaf in both locales is a non-empty string", () => {
    function walkLeaves(value: JsonValue, prefix = ""): Array<{ path: string; value: JsonValue }> {
      if (value === null || typeof value !== "object") {
        return [{ path: prefix, value }];
      }
      if (Array.isArray(value)) {
        return value.flatMap((v, i) => walkLeaves(v, `${prefix}[${i}]`));
      }
      return Object.entries(value).flatMap(([k, v]) =>
        walkLeaves(v as JsonValue, prefix ? `${prefix}.${k}` : k),
      );
    }

    for (const locale of [
      { name: "zh-TW", data: zhTW as JsonValue },
      { name: "en", data: en as JsonValue },
    ]) {
      for (const { path, value } of walkLeaves(locale.data)) {
        expect(typeof value, `${locale.name}: ${path} should be a string`).toBe("string");
        expect((value as string).length, `${locale.name}: ${path} should be non-empty`).toBeGreaterThan(0);
      }
    }
  });
});
