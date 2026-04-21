import { describe, expect, it } from "vitest";
import { buildCampusToolsEnterDelays } from "./campus-tools-enter-delays";
import type { GroupedCampusTools } from "./campus-tools";

const emptyGroup = (id: "academics"): GroupedCampusTools => ({
  categoryId: id,
  label: "課業與學習",
  tools: [],
});

describe("buildCampusToolsEnterDelays", () => {
  it("orders hero before featured and submit last when featured exists", () => {
    const grouped: GroupedCampusTools[] = [emptyGroup("academics")];
    const d = buildCampusToolsEnterDelays(grouped, true);
    expect(d.hero).toBe(0);
    expect(d.featured).toBe(78);
    expect(d.sectionHeaders).toHaveLength(1);
    expect(d.submit).toBeGreaterThan(d.sectionHeaders[0]!);
  });

  it("assigns monotonically increasing card delays within a section", () => {
    const grouped: GroupedCampusTools[] = [
      {
        categoryId: "academics",
        label: "課業與學習",
        tools: [
          {
            id: "a",
            categoryId: "academics",
            name: "A",
            tagline: "t",
            description: "d",
            href: "#",
          },
          {
            id: "b",
            categoryId: "academics",
            name: "B",
            tagline: "t",
            description: "d",
            href: "#",
          },
        ],
      },
    ];
    const d = buildCampusToolsEnterDelays(grouped, false);
    expect(d.cards.get("a")!).toBeLessThan(d.cards.get("b")!);
  });
});
