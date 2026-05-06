import { describe, it, expect, vi } from "vitest";
import authApp from "../auth";

describe("auth routes", () => {
  it("GET / should redirect to Google OAuth URL with state and channelId", async () => {
    const mockKv = {
      put: vi.fn().mockResolvedValue(undefined),
    };
    const mockEnv = {
      YOUTUBE_CLIENT_ID: "mock-client-id",
      YOUTUBE_REDIRECT_URL: "http://localhost/callback",
      STATE_KV: mockKv,
    };

    const req = new Request("http://localhost/?channelId=12345");
    const res = await authApp.fetch(req, mockEnv as any);

    expect(res.status).toBe(302);
    const location = res.headers.get("location") || "";
    expect(location).toContain("accounts.google.com");
    expect(location).toContain("client_id=mock-client-id");
    expect(location).toContain("state=");
    
    // KVに保存されたことを確認
    expect(mockKv.put).toHaveBeenCalled();
  });

  it("GET /callback without code or state should return 400", async () => {
    const req = new Request("http://localhost/callback");
    const res = await authApp.fetch(req, {} as any);

    expect(res.status).toBe(400);
    expect(await res.text()).toBe("Authorization code or state not found");
  });
});
