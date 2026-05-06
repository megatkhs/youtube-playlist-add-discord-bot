import { Events } from "discord.js";
import { defineEvent } from "./index";

export default defineEvent({
  name: Events.ClientReady,
  once(client) {
    console.log(client.user.tag, "が正常に起動しました。");
  },
});
