import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ElectionForm } from '@/components/admin/ElectionForm'

export default async function EditElectionPage({ params }) {
  const { id } = await params

  const election = await prisma.election.findUnique({
    where: { id },
    include: { options: true },
  })

  if (!election) notFound()

  return <ElectionForm election={election} />
}
