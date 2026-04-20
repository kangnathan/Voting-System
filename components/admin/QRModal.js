'use client'

import { useState, useRef } from 'react'
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
import DownloadIcon from '@mui/icons-material/Download'

export function QRModal({ open, onClose, url, title, description }) {
  const [copied, setCopied] = useState(false)
  const svgRef = useRef(null)

  function copyUrl() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadPng() {
    const svg = svgRef.current?.querySelector('svg') ?? svgRef.current
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const blobUrl = URL.createObjectURL(blob)

    const img = new Image()
    img.onload = () => {
      // Layout constants
      const pad = 48
      const qrSize = 220
      const cardW = qrSize + pad * 2

      // Measure text heights with a throwaway canvas first
      const tmp = document.createElement('canvas')
      tmp.width = cardW
      const tc = tmp.getContext('2d')

      const titleFontSize = 18
      const descFontSize = 13
      const labelFontSize = 11
      const lineHeight = (size, mult = 1.4) => size * mult

      // Word-wrap helper — returns array of lines
      function wrapText(ctx, text, maxWidth) {
        const words = text.split(' ')
        const lines = []
        let line = ''
        for (const word of words) {
          const test = line ? `${line} ${word}` : word
          if (ctx.measureText(test).width > maxWidth && line) {
            lines.push(line)
            line = word
          } else {
            line = test
          }
        }
        if (line) lines.push(line)
        return lines
      }

      tc.font = `700 ${titleFontSize}px Inter, system-ui, sans-serif`
      const titleLines = wrapText(tc, title || '', cardW - pad * 2)
      const titleBlockH = titleLines.length * lineHeight(titleFontSize)

      let descBlockH = 0
      let descLines = []
      if (description) {
        tc.font = `400 ${descFontSize}px Inter, system-ui, sans-serif`
        descLines = wrapText(tc, description, cardW - pad * 2)
        descBlockH = descLines.length * lineHeight(descFontSize) + 10 // gap above
      }

      const labelH = lineHeight(labelFontSize) + 8 // "Scan to vote" label + gap
      const cardH = pad + titleBlockH + descBlockH + 24 + qrSize + 16 + labelH + pad

      const canvas = document.createElement('canvas')
      const scale = 2 // retina
      canvas.width = cardW * scale
      canvas.height = cardH * scale
      const ctx = canvas.getContext('2d')
      ctx.scale(scale, scale)

      // White background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, cardW, cardH)

      // Border with rounded corners
      const radius = 16
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(radius, 0)
      ctx.lineTo(cardW - radius, 0)
      ctx.arcTo(cardW, 0, cardW, radius, radius)
      ctx.lineTo(cardW, cardH - radius)
      ctx.arcTo(cardW, cardH, cardW - radius, cardH, radius)
      ctx.lineTo(radius, cardH)
      ctx.arcTo(0, cardH, 0, cardH - radius, radius)
      ctx.lineTo(0, radius)
      ctx.arcTo(0, 0, radius, 0, radius)
      ctx.closePath()
      ctx.stroke()

      let y = pad

      // Title
      ctx.fillStyle = '#111827'
      ctx.font = `700 ${titleFontSize}px Inter, system-ui, sans-serif`
      ctx.textAlign = 'center'
      for (const line of titleLines) {
        ctx.fillText(line, cardW / 2, y + titleFontSize)
        y += lineHeight(titleFontSize)
      }

      // Description
      if (descLines.length) {
        y += 10
        ctx.fillStyle = '#6b7280'
        ctx.font = `400 ${descFontSize}px Inter, system-ui, sans-serif`
        for (const line of descLines) {
          ctx.fillText(line, cardW / 2, y + descFontSize)
          y += lineHeight(descFontSize)
        }
      }

      y += 24

      // QR code image
      ctx.drawImage(img, pad, y, qrSize, qrSize)
      y += qrSize + 16

      // "Scan to vote" label
      ctx.fillStyle = '#9ca3af'
      ctx.font = `400 ${labelFontSize}px Inter, system-ui, sans-serif`
      ctx.fillText('Scan to vote', cardW / 2, y + labelFontSize)

      URL.revokeObjectURL(blobUrl)

      const pngUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = pngUrl
      a.download = 'election-qr.png'
      a.click()
    }
    img.src = blobUrl
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
          <Box
            ref={svgRef}
            sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 2 }}
          >
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
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon fontSize="small" />}
                onClick={downloadPng}
                sx={{ whiteSpace: 'nowrap', borderColor: '#e5e7eb', color: '#374151', minWidth: 80 }}
              >
                PNG
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
