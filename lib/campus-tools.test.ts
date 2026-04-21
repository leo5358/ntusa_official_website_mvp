import { describe, expect, it } from "vitest";
import {
  campusTools,
  getFeaturedTool,
  groupToolsByCategory,
  type CampusTool,
} from "./campus-tools";

const base = {
  name: "N",
  tagline: "T",
  description: "D",
  href: "#",
};

describe("groupToolsByCategory", () => {
  it("orders sections by CATEGORY_ORDER and omits empty categories", () => {
    const tools: CampusTool[] = [
      { id: "b", categoryId: "campus-life", ...base },
      { id: "a", categoryId: "academics", ...base },
    ];
    const grouped = groupToolsByCategory(tools);
    expect(grouped.map((g) => g.categoryId)).toEqual(["academics", "campus-life"]);
    expect(grouped[0].tools.map((t) => t.id)).toEqual(["a"]);
    expect(grouped[1].tools.map((t) => t.id)).toEqual(["b"]);
  });

  it("preserves insertion order within a category", () => {
    const tools: CampusTool[] = [
      { id: "a1", categoryId: "academics", ...base },
      { id: "a2", categoryId: "academics", ...base },
    ];
    expect(groupToolsByCategory(tools)[0].tools.map((t) => t.id)).toEqual([
      "a1",
      "a2",
    ]);
  });

  it("returns empty array when no tools", () => {
    expect(groupToolsByCategory([])).toEqual([]);
  });
});

describe("getFeaturedTool", () => {
  it("returns the first featured tool", () => {
    const tools: CampusTool[] = [
      {
        id: "1",
        categoryId: "academics",
        ...base,
        featured: false,
      },
      {
        id: "2",
        categoryId: "academics",
        ...base,
        featured: true,
      },
    ];
    expect(getFeaturedTool(tools)?.id).toBe("2");
  });

  it("returns the first featured when multiple are featured", () => {
    const tools: CampusTool[] = [
      {
        id: "1",
        categoryId: "academics",
        ...base,
        featured: true,
      },
      {
        id: "2",
        categoryId: "academics",
        ...base,
        featured: true,
      },
    ];
    expect(getFeaturedTool(tools)?.id).toBe("1");
  });

  it("falls back to the first tool when none are featured", () => {
    const tools: CampusTool[] = [
      { id: "x", categoryId: "utilities", ...base },
    ];
    expect(getFeaturedTool(tools)?.id).toBe("x");
  });

  it("returns undefined for an empty list", () => {
    expect(getFeaturedTool([])).toBeUndefined();
  });
});

describe("campusTools", () => {
  it("includes at least one entry for the page to render", () => {
    expect(campusTools.length).toBeGreaterThan(0);
  });
});
