import { initializeDatabase, seedDatabase, testConnection } from '../lib/db'

async function main() {
  try {
    const connected = await testConnection()
    if (!connected) {
      console.error('فشل الاتصال بقاعدة البيانات')
      process.exit(1)
    }

    await initializeDatabase()
    await seedDatabase()

    console.log('تم تهيئة قاعدة البيانات بنجاح')
  } catch (error) {
    console.error('خطأ في تهيئة قاعدة البيانات:', error)
    process.exit(1)
  }
}

main()
