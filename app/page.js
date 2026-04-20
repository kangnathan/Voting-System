import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAuthUser } from '@/lib/auth'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import HowToVoteOutlinedIcon from '@mui/icons-material/HowToVoteOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import FingerprintIcon from '@mui/icons-material/Fingerprint'
import BarChartIcon from '@mui/icons-material/BarChart'

const features = [
  { icon: ShieldOutlinedIcon, title: 'Anonymous', desc: 'Votes are cryptographically anonymised — no link to identity.' },
  { icon: FingerprintIcon, title: 'Deduplication', desc: 'Browser fingerprinting prevents double-voting without accounts.' },
  { icon: BarChartIcon, title: 'Real-time', desc: 'Results update live as votes come in.' },
]

export default async function HomePage() {
  const user = await getAuthUser()
  if (user) redirect('/admin/dashboard')

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <Box component="header" sx={{ borderBottom: '1px solid #e5e7eb', px: 4, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HowToVoteOutlinedIcon sx={{ fontSize: 16, color: '#fff' }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>VoteSecure</Typography>
        </Box>
        <Link href="/admin/login">
          <Button variant="outlined" size="small" sx={{ borderColor: '#e5e7eb', color: '#374151', '&:hover': { borderColor: '#d1d5db', bgcolor: '#f9fafb' } }}>
            Admin login
          </Button>
        </Link>
      </Box>

      {/* Hero */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 4,
          py: 10,
          bgcolor: '#f8f9fb',
        }}
      >
        <Box sx={{ maxWidth: 600, textAlign: 'center' }}>
          <Chip
            label="Open source · Free to use"
            size="small"
            sx={{ mb: 3, bgcolor: '#eef2ff', color: '#4f46e5', fontWeight: 600, border: 'none' }}
          />
          <Typography
            variant="h2"
            sx={{ fontWeight: 800, color: '#111827', letterSpacing: '-0.03em', lineHeight: 1.15, mb: 2.5, fontSize: { xs: '2.2rem', md: '3rem' } }}
          >
            Anonymous voting,{' '}
            <Box component="span" sx={{ color: 'primary.main' }}>done right.</Box>
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: '#6b7280', lineHeight: 1.75, mb: 4, maxWidth: 460, mx: 'auto' }}
          >
            Run secure, anonymous elections with real-time results, fingerprint-based
            deduplication, and shareable QR codes. No accounts needed for voters.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/admin/login">
              <Button variant="contained" size="large" endIcon={<ArrowForwardIcon />} sx={{ px: 3.5 }}>
                Get started
              </Button>
            </Link>
          </Box>
        </Box>
      </Box>

      {/* Features */}
      <Box sx={{ px: 4, py: 8, bgcolor: '#fff', borderTop: '1px solid #e5e7eb' }}>
        <Box sx={{ maxWidth: 800, mx: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <Box key={title}>
              <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
                <Icon sx={{ fontSize: 18, color: 'primary.main' }} />
              </Box>
              <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#111827', mb: 0.5 }}>{title}</Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.6 }}>{desc}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
