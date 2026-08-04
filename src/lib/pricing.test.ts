import { describe, expect, test } from "vitest";
import { CENTS_PER_1000_REQUESTS, SPEND_LIMIT_PRESETS_CENTS, formatUsd } from "./pricing";

describe("formatUsd", () => {
  test("formats whole-dollar amounts with no decimals", () => {
    expect(formatUsd(1000)).toBe("$10");
    expect(formatUsd(2500)).toBe("$25");
    expect(formatUsd(0)).toBe("$0");
  });

  test("formats fractional amounts with two decimals", () => {
    expect(formatUsd(1999)).toBe("$19.99");
    expect(formatUsd(1)).toBe("$0.01");
  });

  // Regression: the dashboard used to build this string manually with
  // `(cents / 100).toFixed(0)`, which silently rounded custom caps like
  // $19.99 to "$20". formatUsd must be the single source of truth.
  test("does not round fractional amounts to the nearest dollar", () => {
    expect(formatUsd(1999)).not.toBe("$20");
  });
});

describe("pricing constants", () => {
  test("$5 per 1,000 requests matches the advertised rate", () => {
    expect(CENTS_PER_1000_REQUESTS).toBe(500);
  });

  test("spend limit presets are positive and sorted ascending", () => {
    expect(SPEND_LIMIT_PRESETS_CENTS.length).toBeGreaterThan(0);
    expect(SPEND_LIMIT_PRESETS_CENTS.every((c) => c > 0)).toBe(true);
    expect([...SPEND_LIMIT_PRESETS_CENTS].sort((a, b) => a - b)).toEqual(SPEND_LIMIT_PRESETS_CENTS);
  });
});
