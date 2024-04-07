type Playlist = {
  targetMonth: string;
  playlistId: string;
};

type Credential = {
  accessToken: string;
  refreshToken: string;
};

export interface Endpoints {
  list: {
    playlist: Playlist;
  };
  object: {
    credential: Credential;
  };
}
