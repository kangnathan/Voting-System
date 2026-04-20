'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ElectionCard } from '@/components/admin/ElectionCard'
import { QRModal } from '@/components/admin/QRModal'
import { useToast } from '@/components/ToastProvider'
import { formatDate, getElectionStatus, getPublicVoteUrl } from '@/lib/utils'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import GridViewIcon from '@mui/icons-material/GridView'
import TableRowsIcon from '@mui/icons-material/TableRows'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import BarChartIcon from '@mui/icons-material/BarChart'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'

const statusConfig = {
  live:     { color: 'success', label: 'Live' },
  upcoming: { color: 'warning', label: 'Upcoming' },
  ended:    { color: 'default', label: 'Ended' },
}

export function ElectionList({ elections: initialElections }) {
  const router = useRouter()
  const toast = useToast()
  const [view, setView] = useState('grid')
  const [elections, setElections] = useState(initialElections)
  const [qrModal, setQrModal] = useState(null) // { url, title }
  const [deleting, setDeleting] = useState(null)

  function handleViewChange(_, next) {
    if (next) setView(next)
  }

  function handleCardDeleted(id) {
    setElections((prev) => prev.filter((e) => e.id !== id))
  }

  async function handleDelete(election) {
    if (!confirm(`Delete "${election.title}"? This cannot be undone.`)) return
    setDeleting(election.id)
    const res = await fetch(`/api/admin/elections/${election.id}`, { method: 'DELETE' })
    setDeleting(null)
    if (res.ok) {
      toast.success('Election deleted')
      setElections((prev) => prev.filter((e) => e.id !== election.id))
    } else {
      toast.error('Failed to delete election')
    }
  }

  return (
    <Box>
      {/* Header row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          All Elections ({elections.length})
        </Typography>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          size="small"
          sx={{ '& .MuiToggleButton-root': { px: 1, py: 0.5, border: '1px solid #e5e7eb' } }}
        >
          <ToggleButton value="grid" aria-label="grid view">
            <Tooltip title="Grid view">
              <GridViewIcon sx={{ fontSize: 18 }} />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="table" aria-label="table view">
            <Tooltip title="Table view">
              <TableRowsIcon sx={{ fontSize: 18 }} />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Divider sx={{ mb: 2.5, borderColor: '#f3f4f6' }} />

      {view === 'grid' ? (
        <Grid container spacing={2}>
          {elections.map((election) => (
            <Grid key={election.id} size={{ xs: 12, md: 6, xl: 4 }}>
              <ElectionCard election={election} onDeleted={handleCardDeleted} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: '#f9fafb', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#6b7280', py: 1.25 } }}>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Votes</TableCell>
                <TableCell align="center">Options</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {elections.map((election) => {
                const status = getElectionStatus(election)
                const cfg = statusConfig[status] || statusConfig.ended
                const voteCount = election._count?.votes ?? 0
                const publicUrl = getPublicVoteUrl(election.id)
                return (
                  <TableRow key={election.id} hover sx={{ '& td': { py: 1 } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {election.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={cfg.label}
                        color={cfg.color}
                        size="small"
                        variant={status === 'live' ? 'filled' : 'outlined'}
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">{voteCount}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">{election.options?.length ?? 0}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{formatDate(election.start_time)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{formatDate(election.end_time)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.25 }}>
                        <Tooltip title="QR Code">
                          <IconButton size="small" onClick={() => setQrModal({ url: publicUrl, title: election.title, description: election.description })} sx={{ color: '#6b7280' }}>
                            <QrCode2Icon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Link href={`/results/${election.id}`}>
                          <Tooltip title="Results">
                            <IconButton size="small" sx={{ color: '#6b7280' }}>
                              <BarChartIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Link>
                        <Link href={`/admin/elections/edit/${election.id}`}>
                          <Tooltip title="Edit">
                            <IconButton size="small" sx={{ color: '#6b7280' }}>
                              <EditOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Link>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            disabled={deleting === election.id}
                            onClick={() => handleDelete(election)}
                            sx={{ color: '#9ca3af', '&:hover': { bgcolor: '#fef2f2', color: '#dc2626' } }}
                          >
                            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {qrModal && (
        <QRModal
          open={!!qrModal}
          onClose={() => setQrModal(null)}
          url={qrModal.url}
          title={qrModal.title}
          description={qrModal.description}
        />
      )}
    </Box>
  )
}
