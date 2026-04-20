import Link from 'next/link'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ElectionCard } from '@/components/admin/ElectionCard'
import { getElectionStatus } from '@/lib/utils'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import AddIcon from '@mui/icons-material/Add'
import HowToVoteOutlinedIcon from '@mui/icons-material/HowToVoteOutlined'

export default async function DashboardPage() {
  const user = await getAuthUser()

  const elections = await prisma.election.findMany({
    include: {
      options: true,
      _count: { select: { votes: true } },
    },
    orderBy: { created_at: 'desc' },
  })

  const totalVotes = elections.reduce((sum, e) => sum + e._count.votes, 0)
  const liveElections = elections.filter((e) => getElectionStatus(e) === 'live').length
  const totalElections = elections.length

  const stats = [
    { label: 'Total Elections', value: totalElections },
    { label: 'Live Now', value: liveElections, highlight: true },
    { label: 'Total Votes', value: totalVotes },
  ]

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h5" sx={{ color: '#111827' }}>Dashboard</Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.25 }}>
            Welcome back, {user?.email?.split('@')[0]}
          </Typography>
        </Box>
        <Link href="/admin/elections/new">
          <Button variant="contained" startIcon={<AddIcon />}>
            New Election
          </Button>
        </Link>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {stats.map(({ label, value, highlight }) => (
          <Grid key={label} size={4}>
            <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                {label}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: highlight ? 'success.main' : '#111827' }}>
                {value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Elections */}
      {elections.length === 0 ? (
        <Paper
          elevation={0}
          sx={{ border: '2px dashed #e5e7eb', borderRadius: 2, py: 10, textAlign: 'center' }}
        >
          <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#eef2ff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <HowToVoteOutlinedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
          </Box>
          <Typography sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}>No elections yet</Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
            Create your first election to get started.
          </Typography>
          <Link href="/admin/elections/new">
            <Button variant="contained" size="small">Create Election</Button>
          </Link>
        </Paper>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              All Elections ({totalElections})
            </Typography>
          </Box>
          <Divider sx={{ mb: 2.5, borderColor: '#f3f4f6' }} />
          <Grid container spacing={2}>
            {elections.map((election) => (
              <Grid key={election.id} size={{ xs: 12, md: 6, xl: 4 }}>
                <ElectionCard election={election} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  )
}
