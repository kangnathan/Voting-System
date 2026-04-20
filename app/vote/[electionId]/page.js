import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { VotingInterface } from '@/components/VotingInterface'
import { getElectionStatus, formatDate } from '@/lib/utils'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import HowToVoteOutlinedIcon from '@mui/icons-material/HowToVoteOutlined'

const statusConfig = {
  live:     { color: 'success', label: 'Live' },
  upcoming: { color: 'warning', label: 'Upcoming' },
  ended:    { color: 'default', label: 'Ended' },
}

export default async function VotePage({ params }) {
  const { electionId } = await params

  const election = await prisma.election.findUnique({
    where: { id: electionId },
    include: { options: true },
  })

  if (!election) notFound()

  const status = getElectionStatus(election)
  const cfg = statusConfig[status] || statusConfig.ended

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fb', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box component="header" sx={{ bgcolor: '#fff', borderBottom: '1px solid #e5e7eb', px: 3, height: 52 }}>
        <Container maxWidth="sm" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 26, height: 26, borderRadius: 1, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HowToVoteOutlinedIcon sx={{ fontSize: 14, color: '#fff' }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827' }}>VoteSecure</Typography>
          </Box>
          <Chip label={cfg.label} color={cfg.color} size="small" variant={status === 'live' ? 'filled' : 'outlined'} />
        </Container>
      </Box>

      {/* Main */}
      <Box component="main" sx={{ flex: 1, py: 6, px: 2 }}>
        <Container maxWidth="sm">
          {/* Election info */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
              {election.title}
            </Typography>
            {election.description && (
              <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.7 }}>
                {election.description}
              </Typography>
            )}
            {(election.start_time || election.end_time) && (
              <Box sx={{ display: 'flex', gap: 3, mt: 1.5 }}>
                {election.start_time && (
                  <Typography variant="caption" sx={{ color: '#9ca3af' }}>Opens: {formatDate(election.start_time)}</Typography>
                )}
                {election.end_time && (
                  <Typography variant="caption" sx={{ color: '#9ca3af' }}>Closes: {formatDate(election.end_time)}</Typography>
                )}
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 3, borderColor: '#e5e7eb' }} />

          <VotingInterface election={election} />

          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#9ca3af', mt: 4 }}>
            Your vote is anonymous and cannot be traced back to you.
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}
