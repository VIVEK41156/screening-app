const db = require('./db');

async function migrate() {
    const alters = [
        `ALTER TABLE candidates ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Review'`,
        `ALTER TABLE candidates ADD COLUMN IF NOT EXISTS resume_text TEXT`,
        `ALTER TABLE candidates ADD COLUMN IF NOT EXISTS test_data JSONB`,
        `ALTER TABLE candidates ADD COLUMN IF NOT EXISTS test_score INTEGER`,
        `ALTER TABLE candidates ADD COLUMN IF NOT EXISTS test_completed BOOLEAN DEFAULT FALSE`,
        `ALTER TABLE candidates ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()`,
        `ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary_range VARCHAR(100)`,
    ];

    for (const sql of alters) {
        await db.query(sql);
        console.log('✅', sql.substring(0, 60));
    }

    // Show current columns
    const cols = await db.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'candidates' 
    ORDER BY ordinal_position
  `);
    console.log('\n📋 CANDIDATES table columns:');
    cols.rows.forEach(r => console.log(`   ${r.column_name.padEnd(20)} ${r.data_type}`));

    const cands = await db.query('SELECT id, name, status, test_score, test_completed FROM candidates');
    console.log(`\n👥 Total candidates: ${cands.rows.length}`);
    cands.rows.forEach(r => console.log(`   [${r.id}] ${r.name} | status:${r.status} | test:${r.test_completed ? r.test_score + '%' : 'pending'}`));

    process.exit(0);
}
migrate().catch(e => { console.error('❌', e.message); process.exit(1); });
