import { describe, it, expect } from "vitest";
import { getVideoId } from "../youtube";

describe("youtube/getVideoId (API side)", () => {
  it("should extract videoId from standard youtube URL", () => {
    expect(getVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("should extract videoId from youtu.be URL", () => {
    expect(getVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("should return null for non-youtube URLs", () => {
    expect(getVideoId("https://example.com/watch?v=dQw4w9WgXcQ")).toBeNull();
  });

  it("should return null for invalid URLs", () => {
    expect(getVideoId("not a url")).toBeNull();
  });
});
