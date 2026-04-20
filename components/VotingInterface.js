'use client'

import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import { hashFingerprint, getElectionStatus, formatDate } from '@/lib/utils'

export function VotingInterface({ election }) {
  const [selectedOption, setSelectedOption] = useState(null)
  const [state, setState] = useState('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [fingerprintHash, setFingerprintHash] = useState(null)

  const status = getElectionStatus(election)

  useEffect(() => {
    async function initFingerprint() {
      const lsKey = `voted:${election.id}`

      // Check localStorage first — no network needed
      if (localStorage.getItem(lsKey) === '1') {
        setState('already_voted')
        return
      }

      // Non-live elections: show status immediately
      if (status !== 'live') {
        setState(status === 'upcoming' ? 'upcoming' : 'closed')
        return
      }

      // Show voting UI immediately, then verify in background
      setState('voting')

      // Get or create a stable per-device token stored in localStorage
      const deviceKey = 'vs:device_id'
      let deviceId = localStorage.getItem(deviceKey)
      if (!deviceId) {
        deviceId = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ (Math.random() * 16 >> c / 4)).toString(16)
        )
        localStorage.setItem(deviceKey, deviceId)
      }

      let hash
      try {
        const FingerprintJS = (await import('@fingerprintjs/fingerprintjs')).default
        const fp = await FingerprintJS.load()
        const result = await fp.get()
        // Combine FingerprintJS visitorId with our stable device token for better uniqueness
        hash = await hashFingerprint(result.visitorId + deviceId)
      } catch {
        // FingerprintJS failed — fall back to device token alone
        hash = await hashFingerprint(deviceId)
      }

      setFingerprintHash(hash)

      try {
        const res = await fetch('/api/vote/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ electionId: election.id, fingerprintHash: hash }),
        })
        const data = await res.json()
        if (data.hasVoted) {
          localStorage.setItem(lsKey, '1')
          setState('already_voted')
        }
      } catch {
        // check failed — server will still deduplicate on submit
      }
    }
    initFingerprint()
  }, [election.id, status])

  async function handleVote() {
    if (!selectedOption) return
    setState('submitting')

    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        electionId: election.id,
        optionId: selectedOption,
        fingerprintHash: fingerprintHash,
      }),
    })

    const data = await res.json()
    if (data.success) {
      localStorage.setItem(`voted:${election.id}`, '1')
      setState('voted')
    } else if (data.error === 'already_voted') {
      localStorage.setItem(`voted:${election.id}`, '1')
      setState('already_voted')
    } else {
      setErrorMsg(data.error || 'Failed to submit vote')
      setState('error')
    }
  }

  if (state === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={32} />
      </Box>
    )
  }

  const StatusCard = ({ icon: Icon, iconColor, iconBg, title, message }) => (
    <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, p: 5, textAlign: 'center' }}>
      <Box sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: iconBg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
        <Icon sx={{ fontSize: 26, color: iconColor }} />
      </Box>
      <Typography sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}>{title}</Typography>
      <Typography variant="body2" sx={{ color: '#6b7280' }}>{message}</Typography>
    </Paper>
  )

  if (state === 'voted') {
    return <StatusCard icon={CheckCircleOutlineIcon} iconColor="#16a34a" iconBg="#f0fdf4" title="Vote submitted!" message="Your vote has been recorded anonymously. Thank you for participating." />
  }
  if (state === 'already_voted') {
    return <StatusCard icon={WarningAmberIcon} iconColor="#d97706" iconBg="#fffbeb" title="Already voted" message="You have already cast your vote in this election." />
  }
  if (state === 'upcoming') {
    return <StatusCard icon={AccessTimeOutlinedIcon} iconColor="#d97706" iconBg="#fffbeb" title="Not started yet" message={`This election starts on ${formatDate(election.start_time)}.`} />
  }
  if (state === 'closed') {
    return <StatusCard icon={CancelOutlinedIcon} iconColor="#dc2626" iconBg="#fef2f2" title="Election closed" message={`This election ended on ${formatDate(election.end_time)}.`} />
  }
  if (state === 'error') {
    return (
      <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, p: 5, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: '#dc2626', mb: 2 }}>{errorMsg}</Typography>
        <Button variant="outlined" onClick={() => setState('voting')}>Try Again</Button>
      </Paper>
    )
  }

  return (
    <Box>
      <FormControl fullWidth>
        <RadioGroup
          value={selectedOption ?? ''}
          onChange={(e) => setSelectedOption(e.target.value)}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {election.options.map((option) => {
              const isSelected = selectedOption === option.id
              return (
                <Paper
                  key={option.id}
                  elevation={0}
                  onClick={() => setSelectedOption(option.id)}
                  sx={{
                    border: '1.5px solid',
                    borderColor: isSelected ? 'primary.main' : '#e5e7eb',
                    borderRadius: 2,
                    cursor: 'pointer',
                    bgcolor: isSelected ? '#eef2ff' : '#fff',
                    transition: 'all 0.12s',
                    '&:hover': { borderColor: isSelected ? 'primary.main' : '#d1d5db', bgcolor: isSelected ? '#eef2ff' : '#f9fafb' },
                  }}
                >
                  <FormControlLabel
                    value={option.id}
                    control={<Radio size="small" />}
                    label={
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: isSelected ? 600 : 400, color: isSelected ? '#4f46e5' : '#374151' }}>
                        {option.option_text}
                      </Typography>
                    }
                    sx={{ m: 0, px: 2, py: 1.5, width: '100%' }}
                  />
                </Paper>
              )
            })}
          </Box>
        </RadioGroup>
      </FormControl>

      <Box sx={{ mt: 3 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleVote}
          disabled={!selectedOption || state === 'submitting'}
          startIcon={state === 'submitting' ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{ py: 1.3 }}
        >
          {state === 'submitting' ? 'Submitting…' : 'Submit Vote'}
        </Button>
      </Box>
    </Box>
  )
}
