import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Save outreach session messages
export async function POST(req: NextRequest) {
  try {
    const { jobId, candidateId, candidateName, mode, messages, interestScore, evaluation } =
      await req.json();

    const session = await db.outreachSession.create({
      data: {
        jobId,
        candidateId,
        candidateName,
        mode,
        interestScore,
        evaluation: evaluation ? JSON.stringify(evaluation) : null,
        status: interestScore ? "completed" : "active",
        messages: {
          create: messages.map((m: any) => ({
            role: m.role,
            content: m.content,
          })),
        },
      },
      include: { messages: true },
    });

    return NextResponse.json({ success: true, sessionId: session.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
