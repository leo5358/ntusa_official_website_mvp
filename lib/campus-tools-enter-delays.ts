import type { GroupedCampusTools } from "./campus-tools";

/** Ms from hero “slot” to featured block (matches test contract when hasFeatured). */
const GAP_AFTER_HERO_MS = 78;
/** Ms after featured before first category section. */
const GAP_AFTER_FEATURED_MS = 78;
/** Ms from category header to first card in that section. */
const HEADER_TO_FIRST_CARD_MS = 52;
/** Ms between consecutive tool cards in the same section. */
const CARD_STAGGER_MS = 52;
/** Ms between category sections (after last card). */
const GAP_BETWEEN_SECTIONS_MS = 40;
/** Ms before the submit CTA after all sections. */
const GAP_BEFORE_SUBMIT_MS = 100;

export type CampusToolsEnterDelays = {
  hero: number;
  featured: number | null;
  /** Stagger delay for each category block header, in `grouped` order. */
  sectionHeaders: number[];
  /** Per-tool enter delay by tool id. */
  cards: Map<string, number>;
  submit: number;
};

/**
 * Computes CSS animation stagger delays for the campus-tools page so sections
 * appear in a consistent top-to-bottom order.
 */
export function buildCampusToolsEnterDelays(
  grouped: GroupedCampusTools[],
  hasFeatured: boolean,
): CampusToolsEnterDelays {
  const cards = new Map<string, number>();
  const sectionHeaders: number[] = [];

  let t = 0;
  const hero = t;
  t += GAP_AFTER_HERO_MS;

  let featured: number | null;
  if (hasFeatured) {
    featured = t;
    t += GAP_AFTER_FEATURED_MS;
  } else {
    featured = null;
  }

  for (const group of grouped) {
    sectionHeaders.push(t);
    t += HEADER_TO_FIRST_CARD_MS;
    for (const tool of group.tools) {
      cards.set(tool.id, t);
      t += CARD_STAGGER_MS;
    }
    t += GAP_BETWEEN_SECTIONS_MS;
  }

  const submit = t + GAP_BEFORE_SUBMIT_MS;

  return {
    hero,
    featured,
    sectionHeaders,
    cards,
    submit,
  };
}
