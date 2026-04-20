import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const { electionId, fingerprintHash } = await request.json()

    if (!electionId || !fingerprintHash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const vote = await prisma.vote.findUnique({
      where: {
        election_id_fingerprint_hash: {
          election_id: electionId,
          fingerprint_hash: fingerprintHash,
        },
      },
    })

    return NextResponse.json({ hasVoted: !!vote })
  } catch (error) {
    console.error('Check vote error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
