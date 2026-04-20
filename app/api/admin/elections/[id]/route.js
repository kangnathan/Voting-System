import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    await requireRole('admin')
    const { id } = await params

    const election = await prisma.election.findUnique({
      where: { id },
      include: { options: true },
    })

    if (!election) {
      return NextResponse.json({ error: 'Election not found' }, { status: 404 })
    }

    return NextResponse.json({ election })
  } catch (error) {
    if (error.status === 401) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (error.status === 403) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    await requireRole('admin')
    const { id } = await params
    const { title, description, start_time, end_time, options } = await request.json()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!options || options.length < 2) {
      return NextResponse.json({ error: 'At least 2 options required' }, { status: 400 })
    }

    // Delete existing options and recreate
    await prisma.option.deleteMany({ where: { election_id: id } })

    const election = await prisma.election.update({
      where: { id },
      data: {
        title,
        description: description || null,
        start_time: start_time ? new Date(start_time) : null,
        end_time: end_time ? new Date(end_time) : null,
        options: {
          create: options.filter(Boolean).map((text) => ({ option_text: text })),
        },
      },
      include: { options: true },
    })

    return NextResponse.json({ election })
  } catch (error) {
    if (error.status === 401) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (error.status === 403) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Update election error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireRole('admin')
    const { id } = await params

    await prisma.election.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error.status === 401) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (error.status === 403) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Delete election error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
