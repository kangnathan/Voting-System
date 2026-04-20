import Chip from '@mui/material/Chip'

const colorMap = {
  live: 'success',
  upcoming: 'warning',
  ended: 'error',
  accent: 'primary',
  default: 'default',
}

export function Badge({ children, variant = 'default', ...props }) {
  const color = colorMap[variant] || 'default'
  return (
    <Chip
      label={children}
      color={color}
      size="small"
      sx={{ fontWeight: 600, fontSize: '0.7rem' }}
      {...props}
    />
  )
}
