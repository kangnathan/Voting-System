import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await requireRole('admin')

    const elections = await prisma.election.findMany({
      include: {
        options: true,
        _count: { select: { votes: true } },
      },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json({ elections })
  } catch (error) {
    if (error.status === 401) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (error.status === 403) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('List elections error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await requireRole('admin')
    const { title, description, start_time, end_time, options } = await request.json()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!options || options.length < 2) {
      return NextResponse.json({ error: 'At least 2 options required' }, { status: 400 })
    }

    const election = await prisma.election.create({
      data: {
        title,
        description: description || null,
        start_time: start_time ? new Date(start_time) : null,
        end_time: end_time ? new Date(end_time) : null,
        created_by: user.sub,
        options: {
          create: options.filter(Boolean).map((text) => ({ option_text: text })),
        },
      },
      include: { options: true },
    })

    return NextResponse.json({ election }, { status: 201 })
  } catch (error) {
    if (error.status === 401) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (error.status === 403) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Create election error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
