import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Save a completed job + shortlist to DB
export async function POST(req: NextRequest) {
  try {
    const { title, rawJd, parsedJd, candidates } = await req.json();

    const job = await db.job.create({
      data: {
        title,
        rawJd,
        parsedJd: JSON.stringify(parsedJd),
        shortlist: {
          create: candidates.map((c: any) => ({
            candidateId: c.candidate.id,
            candidateName: c.candidate.name,
            currentRole: c.candidate.current_role,
            currentCompany: c.candidate.current_company,
            matchScore: c.match_score,
            matchExplanation: c.match_explanation,
            matchBreakdown: JSON.stringify(c.match_breakdown),
            interestScore: c.interest_score,
            blendedScore: c.blended_score,
            outreachStatus: c.outreach_status,
          })),
        },
      },
      include: { shortlist: true },
    });

    return NextResponse.json({ success: true, jobId: job.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Get all past jobs
export async function GET() {
  try {
    const jobs = await db.job.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        shortlist: { orderBy: { matchScore: "desc" } },
        _count: { select: { sessions: true } },
      },
    });
    return NextResponse.json(jobs);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
