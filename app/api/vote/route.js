import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getElectionStatus } from '@/lib/utils'

export async function POST(request) {
  try {
    const { electionId, optionId, fingerprintHash } = await request.json()

    if (!electionId || !optionId || !fingerprintHash || fingerprintHash === 'anonymous') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: { options: true },
    })

    if (!election) {
      return NextResponse.json({ error: 'Election not found' }, { status: 404 })
    }

    const status = getElectionStatus(election)
    if (status !== 'live') {
      return NextResponse.json(
        { error: status === 'upcoming' ? 'Election has not started yet' : 'Election has ended' },
        { status: 400 }
      )
    }

    const validOption = election.options.some((o) => o.id === optionId)
    if (!validOption) {
      return NextResponse.json({ error: 'Invalid option' }, { status: 400 })
    }

    await prisma.vote.create({
      data: {
        election_id: electionId,
        option_id: optionId,
        fingerprint_hash: fingerprintHash,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'already_voted' }, { status: 409 })
    }
    console.error('Vote error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
