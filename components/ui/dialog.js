'use client'

import MuiDialog from '@mui/material/Dialog'
import MuiDialogTitle from '@mui/material/DialogTitle'
import MuiDialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

export function Dialog({ open, onClose, children, ...props }) {
  return (
    <MuiDialog open={!!open} onClose={onClose} maxWidth="sm" fullWidth {...props}>
      {children}
    </MuiDialog>
  )
}

export function DialogHeader({ children, onClose }) {
  return (
    <MuiDialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <span>{children}</span>
      {onClose && (
        <IconButton onClick={onClose} size="small" sx={{ ml: 1 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </MuiDialogTitle>
  )
}

export function DialogContent({ children, ...props }) {
  return <MuiDialogContent {...props}>{children}</MuiDialogContent>
}
