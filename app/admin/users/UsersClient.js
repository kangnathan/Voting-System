'use client'

import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close'
import { formatDate } from '@/lib/utils'

export function UsersClient({ users: initialUsers, currentUserId }) {
  const [users, setUsers] = useState(initialUsers)
  const [showAdd, setShowAdd] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('admin')
  const [addError, setAddError] = useState('')
  const [addLoading, setAddLoading] = useState(false)

  async function handleAdd(e) {
    e.preventDefault()
    setAddError('')
    setAddLoading(true)

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, password: newPassword, role: newRole }),
    })
    const data = await res.json()
    setAddLoading(false)

    if (res.ok) {
      setUsers([...users, data.user])
      setShowAdd(false)
      setNewEmail('')
      setNewPassword('')
      setNewRole('admin')
    } else {
      setAddError(data.error || 'Failed to create user')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this user?')) return
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setUsers(users.filter((u) => u.id !== id))
    } else {
      const data = await res.json()
      alert(data.error || 'Failed to delete user')
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Users</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Manage admin accounts.</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAdd(true)}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Add User
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Joined</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {user.email}
                    {user.id === currentUserId && (
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>(you)</Typography>
                    )}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    color={user.role === 'super_admin' ? 'primary' : 'default'}
                    size="small"
                    sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">{formatDate(user.created_at)}</Typography>
                </TableCell>
                <TableCell align="right">
                  {user.id !== currentUserId && (
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      startIcon={<DeleteIcon fontSize="small" />}
                      onClick={() => handleDelete(user.id)}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      Delete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add user dialog */}
      <Dialog open={showAdd} onClose={() => setShowAdd(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Add Admin User
          <IconButton size="small" onClick={() => setShowAdd(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleAdd}>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                size="small"
                label="Email"
                type="email"
                placeholder="admin@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
              <TextField
                fullWidth
                size="small"
                label="Password"
                type="password"
                placeholder="Min 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                inputProps={{ minLength: 8 }}
              />
              <TextField
                select
                fullWidth
                size="small"
                label="Role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="super_admin">Super Admin</MenuItem>
              </TextField>

              {addError && <Alert severity="error">{addError}</Alert>}

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  variant="text"
                  onClick={() => setShowAdd(false)}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={addLoading}
                  startIcon={addLoading ? <CircularProgress size={14} color="inherit" /> : undefined}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  Create User
                </Button>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
