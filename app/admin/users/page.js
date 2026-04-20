import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UsersClient } from './UsersClient'

export default async function UsersPage() {
  const user = await getAuthUser()
  if (!user || user.role !== 'super_admin') redirect('/admin/dashboard')

  const users = await prisma.profile.findMany({
    select: { id: true, email: true, role: true, created_at: true },
    orderBy: { created_at: 'asc' },
  })

  return <UsersClient users={users} currentUserId={user.sub} />
}
