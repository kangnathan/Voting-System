'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'

export function QRModal({ open, onClose, url, title }) {
  const [copied, setCopied] = useState(false)

  function copyUrl() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={!!open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5 }}>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#111827' }}>Share election</Typography>
          <Typography variant="caption" sx={{ color: '#6b7280' }}>{title}</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#6b7280' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider sx={{ borderColor: '#f3f4f6' }} />
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <Box sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 2 }}>
            <QRCodeSVG value={url} size={180} level="H" includeMargin={false} />
          </Box>
          <Box sx={{ width: '100%' }}>
            <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 1 }}>
              Voter link
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                value={url}
                slotProps={{ input: { readOnly: true, sx: { fontFamily: 'monospace', fontSize: '0.78rem' } } }}
              />
              <Button
                variant={copied ? 'contained' : 'outlined'}
                size="small"
                color={copied ? 'success' : 'inherit'}
                startIcon={copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                onClick={copyUrl}
                sx={{ whiteSpace: 'nowrap', borderColor: '#e5e7eb', color: copied ? undefined : '#374151', minWidth: 80 }}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
