const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../database/finance_tracker.db');
const dbDir = path.dirname(dbPath);

// Create database directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

const initDatabase = () => {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        initial_balance REAL DEFAULT 0,
        current_balance REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating users table:', err);
      else console.log('✓ Users table created');
    });

    // Categories table
    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        icon TEXT,
        color TEXT,
        is_default BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating categories table:', err);
      else console.log('✓ Categories table created');
    });

    // Budgets table
    db.run(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category_id INTEGER,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        period TEXT NOT NULL CHECK(period IN ('daily', 'weekly', 'monthly', 'yearly')),
        start_date DATE NOT NULL,
        end_date DATE,
        alert_threshold REAL DEFAULT 80,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `, (err) => {
      if (err) console.error('Error creating budgets table:', err);
      else console.log('✓ Budgets table created');
    });

    // Accounts table (for card and cash tracking)
    db.run(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('card', 'cash')),
        balance REAL DEFAULT 0,
        currency TEXT DEFAULT 'UZS',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating accounts table:', err);
      else console.log('✓ Accounts table created');
    });

    // Transactions table
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        account_id INTEGER,
        category_id INTEGER,
        budget_id INTEGER,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense', 'transfer')),
        amount REAL NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE SET NULL
      )
    `, (err) => {
      if (err) console.error('Error creating transactions table:', err);
      else console.log('✓ Transactions table created');
    });

    // Transfers table (for account-to-account transfers)
    db.run(`
      CREATE TABLE IF NOT EXISTS transfers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        from_account_id INTEGER NOT NULL,
        to_account_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (from_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
        FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating transfers table:', err);
      else console.log('✓ Transfers table created');
    });

    // Debts table
    db.run(`
      CREATE TABLE IF NOT EXISTS debts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('debt', 'loan')),
        person_name TEXT NOT NULL,
        amount REAL NOT NULL,
        remaining_amount REAL NOT NULL,
        description TEXT,
        due_date DATE,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'paid', 'partial')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating debts table:', err);
      else console.log('✓ Debts table created');
    });

    // Debt payments table
    db.run(`
      CREATE TABLE IF NOT EXISTS debt_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        debt_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        payment_date DATE NOT NULL,
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (debt_id) REFERENCES debts(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating debt_payments table:', err);
      else console.log('✓ Debt payments table created');
    });

    console.log('\n✅ Database initialized successfully!');
  });
};

initDatabase();

// Close database connection after initialization
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
  });
}, 1000);
