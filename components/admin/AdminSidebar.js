'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import ButtonBase from '@mui/material/ButtonBase'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import HowToVoteOutlinedIcon from '@mui/icons-material/HowToVoteOutlined'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: DashboardOutlinedIcon },
  { href: '/admin/elections/new', label: 'New Election', icon: AddCircleOutlineIcon },
  { href: '/admin/users', label: 'Users', icon: PeopleOutlineIcon, superAdminOnly: true },
]

export function AdminSidebar({ user }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const visibleNavItems = navItems.filter(
    (item) => !item.superAdminOnly || user?.role === 'super_admin'
  )

  return (
    <Box
      component="aside"
      sx={{
        width: 240,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        bgcolor: '#fff',
        borderRight: '1px solid #e5e7eb',
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 3, height: 60, display: 'flex', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
        <Link href="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <HowToVoteOutlinedIcon sx={{ fontSize: 18, color: '#fff' }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827', letterSpacing: '-0.01em' }}>
            VoteSecure
          </Typography>
        </Link>
      </Box>

      {/* Nav */}
      <Box sx={{ flex: 1, px: 2, py: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', px: 1, mb: 0.5, display: 'block' }}>
          Menu
        </Typography>
        {visibleNavItems.map((item) => {
          const isActive =
            item.href === '/admin/dashboard'
              ? pathname === item.href
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <ButtonBase
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1,
                  borderRadius: 1.5,
                  justifyContent: 'flex-start',
                  bgcolor: isActive ? '#eef2ff' : 'transparent',
                  color: isActive ? '#4f46e5' : '#374151',
                  '&:hover': { bgcolor: isActive ? '#eef2ff' : '#f3f4f6' },
                  transition: 'background 0.15s',
                  position: 'relative',
                }}
              >
                {isActive && (
                  <Box sx={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, borderRadius: '0 3px 3px 0', bgcolor: 'primary.main' }} />
                )}
                <Icon sx={{ fontSize: 18, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 500 }}>
                  {item.label}
                </Typography>
              </ButtonBase>
            </Link>
          )
        })}
      </Box>

      <Divider />

      {/* User */}
      <Box sx={{ px: 2, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1, borderRadius: 1.5, bgcolor: '#f8f9fb', mb: 1 }}>
          <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: '0.8rem', fontWeight: 700 }}>
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#111827' }} noWrap>
              {user?.email}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#6b7280', textTransform: 'capitalize' }}>
              {user?.role?.replace('_', ' ')}
            </Typography>
          </Box>
        </Box>
        <Tooltip title={loggingOut ? 'Logging out…' : 'Log out'} placement="right">
          <ButtonBase
            onClick={handleLogout}
            disabled={loggingOut}
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1.5,
              py: 1,
              borderRadius: 1.5,
              justifyContent: 'flex-start',
              color: '#6b7280',
              '&:hover': { bgcolor: '#fef2f2', color: '#dc2626' },
              transition: 'all 0.15s',
              opacity: loggingOut ? 0.5 : 1,
            }}
          >
            <LogoutIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
              {loggingOut ? 'Logging out…' : 'Log out'}
            </Typography>
          </ButtonBase>
        </Tooltip>
      </Box>
    </Box>
  )
}
