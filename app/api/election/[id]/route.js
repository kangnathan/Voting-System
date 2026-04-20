import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const election = await prisma.election.findUnique({
      where: { id },
      include: {
        options: true,
        _count: { select: { votes: true } },
      },
    })

    if (!election) {
      return NextResponse.json({ error: 'Election not found' }, { status: 404 })
    }

    return NextResponse.json({ election })
  } catch (error) {
    console.error('Get election error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
