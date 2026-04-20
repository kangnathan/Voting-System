import MuiCard from '@mui/material/Card'
import MuiCardContent from '@mui/material/CardContent'
import MuiCardHeader from '@mui/material/CardHeader'
import MuiCardActions from '@mui/material/CardActions'

export function Card({ children, sx, ...props }) {
  return (
    <MuiCard sx={{ borderRadius: 3, ...sx }} {...props}>
      {children}
    </MuiCard>
  )
}

export function CardHeader({ children, sx, ...props }) {
  return (
    <MuiCardContent sx={{ pb: 0, ...sx }} {...props}>
      {children}
    </MuiCardContent>
  )
}

export function CardContent({ children, sx, ...props }) {
  return (
    <MuiCardContent sx={sx} {...props}>
      {children}
    </MuiCardContent>
  )
}

export function CardFooter({ children, sx, ...props }) {
  return (
    <MuiCardActions sx={{ px: 2, pb: 2, ...sx }} {...props}>
      {children}
    </MuiCardActions>
  )
}
