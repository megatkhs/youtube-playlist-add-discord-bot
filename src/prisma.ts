import { PrismaClient } from "@prisma/client";
import { dayjs } from "./dayjs";

export function createPrismaClient() {
  const client = new PrismaClient();

  /** プレイリストIDをDBに保存する */
  const savePlaylistId = async (playlistId: string, date: Date) => {
    const result = await client.playlist.create({
      data: {
        playlistId,
        targetMonth: dayjs(date).format("YYYY-MM-01"),
      },
    });

    return result;
  };

  /** プレイリストIDをDBから取得する */
  const findPlaylistIdByDate = async (date: Date) => {
    try {
      const result = await client.playlist.findFirst({
        select: {
          playlistId: true,
        },
        where: {
          targetMonth: dayjs(date).format("YYYY-MM-01"),
        },
      });
      return result?.playlistId;
    } catch (error) {
      return undefined;
    }
  };

  /** 全部入りプレイリストのIDをDBから取得する */
  const findAllInPlaylistId = async () => {
    const result = await client.playlist.findFirst({
      select: {
        playlistId: true,
      },
      where: {
        targetMonth: "ALL_IN",
      },
    });
    return result?.playlistId!;
  };

  return {
    savePlaylistId,
    findPlaylistIdByDate,
    findAllInPlaylistId,
    client,
  };
}
