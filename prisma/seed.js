require('dotenv/config')
const { PrismaClient } = require('../app/generated')
const { PrismaPg } = require('@prisma/adapter-pg')
const bcrypt = require('bcryptjs')

async function main() {
  const adapter = new PrismaPg(process.env.DATABASE_URL)
  const prisma = new PrismaClient({ adapter })

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@votesecure.app'
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@123!'

  try {
    const existing = await prisma.profile.findUnique({ where: { email } })
    if (existing) {
      console.log(`Super admin already exists: ${email}`)
      return
    }

    const password_hash = await bcrypt.hash(password, 12)
    const profile = await prisma.profile.create({
      data: {
        email,
        password_hash,
        role: 'super_admin',
      },
    })

    console.log(`Created super admin: ${profile.email}`)
    console.log(`Password: ${password}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
