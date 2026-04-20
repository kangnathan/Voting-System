'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ToastProvider'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import dayjs from 'dayjs'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import Grid from '@mui/material/Grid'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import CircularProgress from '@mui/material/CircularProgress'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'

export function ElectionForm({ election }) {
  const router = useRouter()
  const toast = useToast()
  const isEdit = !!election

  const [title, setTitle] = useState(election?.title || '')
  const [description, setDescription] = useState(election?.description || '')
  const [startTime, setStartTime] = useState(
    election?.start_time ? dayjs(election.start_time) : null
  )
  const [endTime, setEndTime] = useState(
    election?.end_time ? dayjs(election.end_time) : null
  )
  const [options, setOptions] = useState(
    election?.options?.map((o) => o.option_text) || ['', '']
  )
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function addOption() { setOptions([...options, '']) }
  function removeOption(index) {
    if (options.length <= 2) return
    setOptions(options.filter((_, i) => i !== index))
  }
  function updateOption(index, value) {
    const updated = [...options]
    updated[index] = value
    setOptions(updated)
  }

  function validate() {
    const errs = {}
    if (!title.trim()) errs.title = 'Title is required'
    const validOptions = options.filter((o) => o.trim())
    if (validOptions.length < 2) errs.options = 'At least 2 non-empty options required'
    if (startTime && endTime && !startTime.isBefore(endTime)) {
      errs.endTime = 'End time must be after start time'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      start_time: startTime ? startTime.toISOString() : null,
      end_time: endTime ? endTime.toISOString() : null,
      options: options.filter((o) => o.trim()),
    }

    const url = isEdit ? `/api/admin/elections/${election.id}` : '/api/admin/elections'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      toast.error(data.error || 'Something went wrong')
      return
    }

    toast.success(isEdit ? 'Election saved' : 'Election created')
    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 680, mx: 'auto' }}>
        {/* Page header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ color: '#111827' }}>
            {isEdit ? 'Edit Election' : 'Create Election'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
            {isEdit ? 'Update election details and options.' : 'Configure a new election for your voters.'}
          </Typography>
        </Box>

        <Stack spacing={2}>
          {/* Details card */}
          <Paper elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #e5e7eb' }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>
                Details
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Title"
                  placeholder="e.g. Board Member Election 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  error={!!errors.title}
                  helperText={errors.title}
                  autoFocus
                />
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  placeholder="Describe the purpose of this election (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <DateTimePicker
                      label="Start Time (optional)"
                      value={startTime}
                      onChange={setStartTime}
                      slotProps={{
                        textField: { fullWidth: true },
                        actionBar: { actions: ['clear', 'accept'] },
                      }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <DateTimePicker
                      label="End Time (optional)"
                      value={endTime}
                      onChange={setEndTime}
                      minDateTime={startTime ?? undefined}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.endTime,
                          helperText: errors.endTime,
                        },
                        actionBar: { actions: ['clear', 'accept'] },
                      }}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Box>
          </Paper>

          {/* Options card */}
          <Paper elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>
                  Voting Options
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  Minimum 2 options required
                </Typography>
              </Box>
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={addOption}
                sx={{ borderColor: '#e5e7eb', color: '#374151', '&:hover': { borderColor: '#d1d5db', bgcolor: '#f9fafb' } }}
              >
                Add Option
              </Button>
            </Box>
            <Box sx={{ p: 3 }}>
              <Stack spacing={1.5}>
                {options.map((option, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <DragIndicatorIcon sx={{ color: '#d1d5db', fontSize: 20, flexShrink: 0 }} />
                    <TextField
                      fullWidth
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      size="small"
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeOption(index)}
                      disabled={options.length <= 2}
                      sx={{ color: '#9ca3af', '&:hover': { color: '#dc2626', bgcolor: '#fef2f2' }, '&.Mui-disabled': { opacity: 0.3 } }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                {errors.options && (
                  <Typography variant="caption" sx={{ color: '#dc2626' }}>{errors.options}</Typography>
                )}
              </Stack>
            </Box>
          </Paper>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', pt: 1 }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => router.back()}
              sx={{ borderColor: '#e5e7eb', color: '#374151', '&:hover': { borderColor: '#d1d5db', bgcolor: '#f9fafb' } }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={14} color="inherit" /> : undefined}
            >
              {isEdit ? 'Save Changes' : 'Create Election'}
            </Button>
          </Box>
        </Stack>
      </Box>
    </LocalizationProvider>
  )
}
