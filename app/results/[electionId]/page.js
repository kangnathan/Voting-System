import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getElectionStatus, formatDate } from '@/lib/utils'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import HowToVoteOutlinedIcon from '@mui/icons-material/HowToVoteOutlined'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

const statusConfig = {
  live:     { color: 'success', label: 'Live' },
  upcoming: { color: 'warning', label: 'Upcoming' },
  ended:    { color: 'default', label: 'Ended' },
}

export default async function ResultsPage({ params }) {
  const user = await getAuthUser()
  if (!user) redirect('/admin/login')

  const { electionId } = await params

  const election = await prisma.election.findUnique({
    where: { id: electionId },
    include: {
      options: { include: { _count: { select: { votes: true } } } },
      _count: { select: { votes: true } },
    },
  })

  if (!election) notFound()

  const status = getElectionStatus(election)
  const cfg = statusConfig[status] || statusConfig.ended
  const totalVotes = election._count.votes

  const results = election.options
    .map((opt) => ({
      id: opt.id,
      text: opt.option_text,
      votes: opt._count.votes,
      pct: totalVotes > 0 ? Math.round((opt._count.votes / totalVotes) * 100) : 0,
    }))
    .sort((a, b) => b.votes - a.votes)

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fb' }}>
      {/* Header */}
      <Box component="header" sx={{ bgcolor: '#fff', borderBottom: '1px solid #e5e7eb', px: 3, height: 52 }}>
        <Container maxWidth="md" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 26, height: 26, borderRadius: 1, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HowToVoteOutlinedIcon sx={{ fontSize: 14, color: '#fff' }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827' }}>VoteSecure</Typography>
          </Box>
          <Link href="/admin/dashboard">
            <Button size="small" startIcon={<ArrowBackIcon fontSize="small" />} sx={{ color: '#6b7280', '&:hover': { bgcolor: '#f3f4f6' } }}>
              Dashboard
            </Button>
          </Link>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 5 }}>
        {/* Election info */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>{election.title}</Typography>
            {election.description && (
              <Typography variant="body2" sx={{ color: '#6b7280' }}>{election.description}</Typography>
            )}
            {(election.start_time || election.end_time) && (
              <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
                {election.start_time && (
                  <Typography variant="caption" sx={{ color: '#9ca3af' }}>Start: {formatDate(election.start_time)}</Typography>
                )}
                {election.end_time && (
                  <Typography variant="caption" sx={{ color: '#9ca3af' }}>End: {formatDate(election.end_time)}</Typography>
                )}
              </Box>
            )}
          </Box>
          <Chip label={cfg.label} color={cfg.color} size="small" variant={status === 'live' ? 'filled' : 'outlined'} />
        </Box>

        {/* Summary bar */}
        <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, px: 3, py: 2, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>Total votes cast</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>{totalVotes}</Typography>
        </Paper>

        <Divider sx={{ mb: 3, borderColor: '#e5e7eb' }} />

        {/* Results */}
        {results.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#6b7280', textAlign: 'center', py: 6 }}>
            No votes yet.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {results.map((result, idx) => (
              <Paper key={result.id} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {idx === 0 && totalVotes > 0 && (
                      <Typography sx={{ fontSize: '0.9rem' }}>🏆</Typography>
                    )}
                    <Typography sx={{ fontWeight: idx === 0 && totalVotes > 0 ? 600 : 400, color: '#111827', fontSize: '0.9rem' }}>
                      {result.text}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>{result.votes} votes</Typography>
                    <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem', minWidth: 36, textAlign: 'right' }}>
                      {result.pct}%
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={result.pct}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: '#f3f4f6',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      bgcolor: idx === 0 && totalVotes > 0 ? 'primary.main' : '#94a3b8',
                    },
                  }}
                />
              </Paper>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  )
}
