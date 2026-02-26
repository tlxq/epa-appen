import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

export const sql = neon(process.env.DATABASE_URL);

export const testDBConnection = async () => {
  try {
    await sql`SELECT 1`;
    console.log('✅ Connected to Neon DB');
  } catch (error) {
    console.error('❌ Failed to connect to Neon DB:', error);
    throw error;
  }
};
