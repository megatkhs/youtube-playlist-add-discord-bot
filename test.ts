import { createYoutubeClient } from "./src/youtube";

const youtube = createYoutubeClient();

const result = await youtube.checkVideoAlreadyExistsInPlaylist(
  "PLHEbFjNzOVCeb1EzLajbdGQ584K1dNGFV",
  "Ygl_YiI6Sp4"
);
console.log(result);
