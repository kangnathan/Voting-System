'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import HowToVoteOutlinedIcon from '@mui/icons-material/HowToVoteOutlined'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      router.push('/admin/dashboard')
      router.refresh()
    } else {
      setError(data.error || 'Login failed')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8f9fb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: 'primary.main',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1.5,
            }}
          >
            <HowToVoteOutlinedIcon sx={{ fontSize: 22, color: '#fff' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
            VoteSecure
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.25 }}>
            Admin portal
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ px: 4, pt: 3.5, pb: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#111827', mb: 0.25 }}>
              Sign in
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              Enter your credentials to continue
            </Typography>
          </Box>
          <Divider sx={{ borderColor: '#f3f4f6' }} />
          <Box sx={{ px: 4, py: 3 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  size="small"
                />

                {error && (
                  <Alert severity="error" sx={{ py: 0.5 }}>{error}</Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={14} color="inherit" /> : undefined}
                  sx={{ py: 1 }}
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Paper>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#9ca3af', mt: 2.5 }}>
          Restricted access. Contact your super admin for access.
        </Typography>
      </Box>
    </Box>
  )
}
