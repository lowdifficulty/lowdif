import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { submitProofOfListen } from "@/lib/blockchain/mock-mining";

const MIN_LISTEN_RATIO = 0.8;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Sign in to earn LOWDIF tokens." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { trackId, durationMs } = body as {
      trackId?: string;
      durationMs?: number;
    };

    if (!trackId || !durationMs || durationMs < 1000) {
      return NextResponse.json(
        { error: "Valid trackId and durationMs are required." },
        { status: 400 }
      );
    }

    const track = await prisma.track.findUnique({ where: { id: trackId } });
    if (!track) {
      return NextResponse.json({ error: "Track not found." }, { status: 404 });
    }

    const requiredMs =
      track.durationSec > 0
        ? track.durationSec * 1000 * MIN_LISTEN_RATIO
        : durationMs;

    const completed = durationMs >= requiredMs;

    const listenEvent = await prisma.listenEvent.create({
      data: {
        userId: session.id,
        trackId,
        durationMs,
        completed,
      },
    });

    if (!completed) {
      return NextResponse.json({
        mined: false,
        message: "Listen at least 80% of the track to mine LOWDIF.",
        listenEventId: listenEvent.id,
      });
    }

    const existingMining = await prisma.miningRecord.findFirst({
      where: {
        userId: session.id,
        listenEvent: { trackId },
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });

    if (existingMining) {
      return NextResponse.json({
        mined: false,
        message: "You already mined this track recently.",
        listenEventId: listenEvent.id,
      });
    }

    const miningResult = await submitProofOfListen({
      userId: session.id,
      trackId,
      listenDurationMs: durationMs,
      walletAddress: session.walletAddress,
    });

    const miningRecord = await prisma.miningRecord.create({
      data: {
        userId: session.id,
        listenEventId: listenEvent.id,
        txHash: miningResult.txHash,
        tokens: miningResult.tokens,
        status: miningResult.status === "CONFIRMED" ? "CONFIRMED" : "PENDING",
      },
    });

    await prisma.track.update({
      where: { id: trackId },
      data: { playCount: { increment: 1 } },
    });

    return NextResponse.json({
      mined: true,
      tokens: miningResult.tokens,
      tokenSymbol: miningResult.tokenSymbol,
      txHash: miningResult.txHash,
      miningRecordId: miningRecord.id,
      listenEventId: listenEvent.id,
    });
  } catch {
    return NextResponse.json(
      { error: "Proof of listen failed." },
      { status: 500 }
    );
  }
}
