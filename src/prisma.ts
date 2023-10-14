/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { PrismaClient as Client } from "@prisma/client";
import { dayjs } from "./dayjs";

export function createPrismaClient() {
  const client = new Client();

  /** トークンを取得する */
  const findAuthToken = async () => {
    const result = await client.auth.findFirst({
      select: {
        accessToken: true,
        refreshToken: true,
      },
    });

    return result!;
  };

  /** トークンを保存する */
  const saveAuthToken = async (accessToken: string, refreshToken: string) => {
    const result = await client.auth.findFirst();

    if (result) {
      return client.auth.update({
        where: { id: result.id },
        data: { accessToken, refreshToken },
      });
    }

    return client.auth.create({
      data: { accessToken, refreshToken },
    });
  };

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

  /** DBとの接続を切断する */
  const disconnect = client.$disconnect;

  return {
    findAuthToken,
    saveAuthToken,
    savePlaylistId,
    findPlaylistIdByDate,
    findAllInPlaylistId,
    disconnect,
    client,
  };
}

export type PrismaClient = ReturnType<typeof createPrismaClient>;
