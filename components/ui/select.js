'use client'

import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'

export function Select({ label, error, helperText, children, value, onChange, ...props }) {
  // Convert <option> children to <MenuItem>
  const items = []
  if (children) {
    const arr = Array.isArray(children) ? children : [children]
    arr.forEach((child) => {
      if (child?.type === 'option') {
        items.push(
          <MenuItem key={child.props.value} value={child.props.value}>
            {child.props.children}
          </MenuItem>
        )
      }
    })
  }

  return (
    <TextField
      select
      fullWidth
      label={label}
      value={value}
      onChange={onChange}
      error={!!error}
      helperText={error || helperText}
      size="small"
      {...props}
    >
      {items}
    </TextField>
  )
}
