const fs = require('fs');
const path = require('path');
const { pool } = require('../server/config/database');

async function runMigrations() {
  console.log('🚀 Starting database migrations...');
  
  try {
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure files are executed in order
    
    if (migrationFiles.length === 0) {
      console.log('📝 No migration files found');
      return;
    }
    
    console.log(`📁 Found ${migrationFiles.length} migration file(s)`);
    
    for (const file of migrationFiles) {
      console.log(`\n⚡ Running migration: ${file}`);
      
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        await pool.query(sql);
        console.log(`✅ Migration ${file} completed successfully`);
      } catch (error) {
        console.error(`❌ Migration ${file} failed:`, error.message);
        throw error;
      }
    }
    
    console.log('\n🎉 All migrations completed successfully!');
    
    // Test the setup by checking if tables exist
    console.log('\n🔍 Verifying database structure...');
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📊 Created tables:', result.rows.map(row => row.table_name));
    
  } catch (error) {
    console.error('🔥 Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if called directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('\n✨ Migration process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration process failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigrations };