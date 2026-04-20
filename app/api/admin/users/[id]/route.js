import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request, { params }) {
  try {
    const currentUser = await requireRole('super_admin')
    const { id } = await params
    const { role } = await request.json()

    if (!['admin', 'super_admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const user = await prisma.profile.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true, created_at: true },
    })

    return NextResponse.json({ user })
  } catch (error) {
    if (error.status === 401) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (error.status === 403) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const currentUser = await requireRole('super_admin')
    const { id } = await params

    if (id === currentUser.sub) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    await prisma.profile.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error.status === 401) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (error.status === 403) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
