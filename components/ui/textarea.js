'use client'

import TextField from '@mui/material/TextField'

export function Textarea({ label, error, helperText, rows = 3, ...props }) {
  return (
    <TextField
      fullWidth
      multiline
      rows={rows}
      label={label}
      error={!!error}
      helperText={error || helperText}
      size="small"
      {...props}
    />
  )
}
