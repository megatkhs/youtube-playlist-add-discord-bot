import { describe, it, expect } from "vitest";
import authApp from "../auth";

describe("auth routes", () => {
  it("GET / should redirect to Google OAuth URL", async () => {
    // 依存性をモックしたHonoEnvを用意
    const mockEnv = {
      YOUTUBE_CLIENT_ID: "mock-client-id",
      YOUTUBE_REDIRECT_URL: "http://localhost/callback",
    };

    // authAppはHono<HonoEnv>なので、envを渡してリクエストできる
    const req = new Request("http://localhost/");
    const res = await authApp.fetch(req, mockEnv as any);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toContain("accounts.google.com");
    expect(res.headers.get("location")).toContain("client_id=mock-client-id");
  });

  it("GET /callback without code should return 400", async () => {
    const req = new Request("http://localhost/callback");
    const res = await authApp.request(req);

    expect(res.status).toBe(400);
    expect(await res.text()).toBe("Authorization code not found");
  });
});
