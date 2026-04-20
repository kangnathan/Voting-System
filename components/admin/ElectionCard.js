'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ToastProvider'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import BarChartIcon from '@mui/icons-material/BarChart'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import HowToVoteOutlinedIcon from '@mui/icons-material/HowToVoteOutlined'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { QRModal } from '@/components/admin/QRModal'
import { formatDate, getElectionStatus, getPublicVoteUrl } from '@/lib/utils'

const statusConfig = {
  live:     { color: 'success', label: 'Live' },
  upcoming: { color: 'warning', label: 'Upcoming' },
  ended:    { color: 'default', label: 'Ended' },
}

export function ElectionCard({ election, onDeleted }) {
  const router = useRouter()
  const toast = useToast()
  const [showQR, setShowQR] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const status = getElectionStatus(election)
  const cfg = statusConfig[status] || statusConfig.ended
  const voteCount = election._count?.votes ?? 0
  const publicUrl = getPublicVoteUrl(election.id)

  async function handleDelete() {
    if (!confirm(`Delete "${election.title}"? This cannot be undone.`)) return
    setDeleting(true)
    const res = await fetch(`/api/admin/elections/${election.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Election deleted')
      if (onDeleted) onDeleted(election.id)
      else router.refresh()
    } else {
      toast.error('Failed to delete election')
      setDeleting(false)
    }
  }

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          transition: 'box-shadow 0.15s',
          '&:hover': { boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)' },
        }}
      >
        {/* Card header */}
        <Box sx={{ p: 2.5, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#111827', lineHeight: 1.4, flex: 1 }}>
              {election.title}
            </Typography>
            <Chip
              label={cfg.label}
              color={cfg.color}
              size="small"
              variant={status === 'live' ? 'filled' : 'outlined'}
            />
          </Box>

          {election.description && (
            <Typography
              variant="body2"
              sx={{
                color: '#6b7280',
                display: '-webkit-box',
                overflow: 'hidden',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                lineHeight: 1.5,
                mb: 1.5,
              }}
            >
              {election.description}
            </Typography>
          )}

          {/* Stats row */}
          <Box sx={{ display: 'flex', gap: 2.5, mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <HowToVoteOutlinedIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                {voteCount} vote{voteCount !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                {election.options?.length ?? 0} options
              </Typography>
            </Box>
          </Box>

          {(election.start_time || election.end_time) && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              {election.start_time && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 12, color: '#9ca3af' }} />
                  <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                    Starts {formatDate(election.start_time)}
                  </Typography>
                </Box>
              )}
              {election.end_time && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 12, color: '#9ca3af' }} />
                  <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                    Ends {formatDate(election.end_time)}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>

        <Divider sx={{ borderColor: '#f3f4f6' }} />

        {/* Actions */}
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="QR Code">
            <IconButton size="small" onClick={() => setShowQR(true)} sx={{ color: '#6b7280', '&:hover': { bgcolor: '#f3f4f6' } }}>
              <QrCode2Icon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Link href={`/results/${election.id}`}>
            <Tooltip title="Results">
              <IconButton size="small" sx={{ color: '#6b7280', '&:hover': { bgcolor: '#f3f4f6' } }}>
                <BarChartIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Link>
          <Box sx={{ flex: 1 }} />
          <Link href={`/admin/elections/edit/${election.id}`}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditOutlinedIcon sx={{ fontSize: '14px !important' }} />}
              sx={{ borderColor: '#e5e7eb', color: '#374151', '&:hover': { borderColor: '#d1d5db', bgcolor: '#f9fafb' }, fontSize: '0.8rem' }}
            >
              Edit
            </Button>
          </Link>
          <Tooltip title="Delete election">
            <IconButton
              size="small"
              onClick={handleDelete}
              disabled={deleting}
              sx={{ color: '#9ca3af', '&:hover': { bgcolor: '#fef2f2', color: '#dc2626' } }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      <QRModal open={showQR} onClose={() => setShowQR(false)} url={publicUrl} title={election.title} description={election.description} />
    </>
  )
}
