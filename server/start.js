import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

// Set default values if not provided
process.env.PORT = process.env.PORT || '3005';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/whatsapp_clone';

console.log('Starting WhatsApp Clone Server...');
console.log('Port:', process.env.PORT);
console.log('Database URL:', process.env.DATABASE_URL);

// Test database connection
const prisma = new PrismaClient();

async function testDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test basic query
    const userCount = await prisma.user.count();
    console.log(`✅ Database is working. Users count: ${userCount}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 To fix this:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Create a database named "whatsapp_clone"');
    console.log('3. Set DATABASE_URL in .env file');
    console.log('4. Run: npx prisma db push');
    process.exit(1);
  }
}

// Test database before starting server
testDatabase().then(() => {
  console.log('🚀 Starting server...');
  import('./index.js');
}).catch(console.error);
