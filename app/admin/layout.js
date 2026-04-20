import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { ToastProvider } from '@/components/ToastProvider'
import Box from '@mui/material/Box'

export default async function AdminLayout({ children }) {
  const user = await getAuthUser()
  if (!user) redirect('/admin/login')

  return (
    <ToastProvider>
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: '#f8f9fb' }}>
        <AdminSidebar user={user} />
        <Box component="main" sx={{ flex: 1, overflowY: 'auto' }}>
          <Box sx={{ maxWidth: 1200, mx: 'auto', px: 4, py: 4 }}>
            {children}
          </Box>
        </Box>
      </Box>
    </ToastProvider>
  )
}
