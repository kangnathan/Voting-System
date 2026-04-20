import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    await requireRole('admin')

    const { id } = await params
    const election = await prisma.election.findUnique({
      where: { id },
      include: {
        options: {
          include: {
            _count: { select: { votes: true } },
          },
        },
        _count: { select: { votes: true } },
      },
    })

    if (!election) {
      return NextResponse.json({ error: 'Election not found' }, { status: 404 })
    }

    const results = election.options.map((option) => ({
      id: option.id,
      option_text: option.option_text,
      votes: option._count.votes,
    }))

    return NextResponse.json({
      election: {
        id: election.id,
        title: election.title,
        description: election.description,
        start_time: election.start_time,
        end_time: election.end_time,
        total_votes: election._count.votes,
      },
      results,
    })
  } catch (error) {
    if (error.status === 401) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (error.status === 403) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Results error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
