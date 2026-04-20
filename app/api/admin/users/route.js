import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await requireRole('super_admin')

    const users = await prisma.profile.findMany({
      select: { id: true, email: true, role: true, created_at: true },
      orderBy: { created_at: 'asc' },
    })

    return NextResponse.json({ users })
  } catch (error) {
    if (error.status === 401) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (error.status === 403) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await requireRole('super_admin')
    const { email, password, role } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const existing = await prisma.profile.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }

    const password_hash = await bcrypt.hash(password, 12)
    const user = await prisma.profile.create({
      data: {
        email,
        password_hash,
        role: role === 'super_admin' ? 'super_admin' : 'admin',
      },
      select: { id: true, email: true, role: true, created_at: true },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (error.status === 401) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (error.status === 403) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
