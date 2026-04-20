'use client'

import TextField from '@mui/material/TextField'

export function Input({ label, error, helperText, ...props }) {
  return (
    <TextField
      fullWidth
      label={label}
      error={!!error}
      helperText={error || helperText}
      size="small"
      {...props}
    />
  )
}
