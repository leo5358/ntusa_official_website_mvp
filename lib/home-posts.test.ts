import { describe, expect, it } from "vitest";
import { formatPostsForHome, stripHtml } from "./home-posts";

describe("stripHtml", () => {
  it("removes simple tags", () => {
    expect(stripHtml("<p>Hello</p>")).toBe("Hello");
  });

  it("handles empty string", () => {
    expect(stripHtml("")).toBe("");
  });
});

describe("formatPostsForHome", () => {
  it("builds excerpt from stripped content and formats date", () => {
    const posts = [
      {
        id: "a",
        title: "T",
        content: "<p>" + "x".repeat(100) + "</p>",
        coverImage: null as string | null,
        createdAt: new Date("2026-04-21T12:00:00.000Z"),
      },
    ];
    const out = formatPostsForHome(posts);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("a");
    expect(out[0].title).toBe("T");
    expect(out[0].excerpt.endsWith("...")).toBe(true);
    expect(out[0].excerpt.length).toBeLessThanOrEqual(83);
    expect(out[0].coverImage).toBeNull();
    expect(out[0].createdAt).toMatch(/2026/);
  });
});
