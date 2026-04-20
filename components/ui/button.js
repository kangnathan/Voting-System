'use client'

import MuiButton from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

const variantMap = {
  default: { variant: 'contained', color: 'primary' },
  ghost: { variant: 'text', color: 'inherit' },
  danger: { variant: 'outlined', color: 'error' },
  outline: { variant: 'outlined', color: 'inherit' },
  secondary: { variant: 'outlined', color: 'inherit' },
}

const sizeMap = {
  sm: 'small',
  md: 'medium',
  lg: 'large',
}

export function Button({
  children,
  variant = 'default',
  size = 'md',
  loading,
  disabled,
  sx,
  ...props
}) {
  const { variant: muiVariant, color } = variantMap[variant] || variantMap.default
  return (
    <MuiButton
      variant={muiVariant}
      color={color}
      size={sizeMap[size] || 'medium'}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={14} color="inherit" /> : undefined}
      sx={{ borderRadius: 2, textTransform: 'none', ...sx }}
      {...props}
    >
      {children}
    </MuiButton>
  )
}
