import { describe, it, expect } from "vitest";
import { cn } from "../lib/utils";

describe("cn() utility", () => {
  it("merges multiple class strings", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("handles conditional classes via clsx syntax", () => {
    expect(cn("base", false && "hidden", "extra")).toBe("base extra");
  });

  it("deduplicates conflicting Tailwind classes", () => {
    const result = cn("px-2 py-1", "px-4");
    expect(result).toContain("px-4");
    expect(result).not.toContain("px-2");
  });

  it("handles undefined and null inputs gracefully", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });

  it("returns empty string when called with no arguments", () => {
    expect(cn()).toBe("");
  });
});
