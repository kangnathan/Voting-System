'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [state, setState] = useState({ open: false, message: '', severity: 'success' })

  const show = useCallback((message, severity) => {
    setState({ open: true, message, severity })
  }, [])

  const handleClose = useCallback((_, reason) => {
    if (reason === 'clickaway') return
    setState((s) => ({ ...s, open: false }))
  }, [])

  const toast = {
    success: (msg) => show(msg, 'success'),
    error: (msg) => show(msg, 'error'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={state.severity}
          variant="filled"
          sx={{ minWidth: 260 }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
