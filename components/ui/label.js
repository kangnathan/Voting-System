import FormLabel from '@mui/material/FormLabel'

export function Label({ children, htmlFor, ...props }) {
  return (
    <FormLabel htmlFor={htmlFor} {...props}>
      {children}
    </FormLabel>
  )
}
