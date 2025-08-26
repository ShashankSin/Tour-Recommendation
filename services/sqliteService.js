import * as SQLite from 'expo-sqlite';

let db;

// Initialize database
export const initDb = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('app.db');
  }

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('user','company','admin')) DEFAULT 'user',
      isVerified INTEGER DEFAULT 0,
      verifyOtp TEXT DEFAULT '',
      verifyOtpExpiry INTEGER DEFAULT 0,
      resetOtp TEXT DEFAULT '',
      resetOtpExpiry INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

// -------------------- CRUD FUNCTIONS --------------------

// Insert user with duplicate email check
export const insertUser = async (user) => {
  const existing = await getUserByEmail(user.email);
  if (existing) {
    throw new Error('Email already exists');
  }

  const statement = await db.prepareAsync(
    `INSERT INTO users 
      (name, email, password, role, isVerified, verifyOtp, verifyOtpExpiry, resetOtp, resetOtpExpiry) 
      VALUES ($name, $email, $password, $role, $isVerified, $verifyOtp, $verifyOtpExpiry, $resetOtp, $resetOtpExpiry)`
  );

  try {
    const result = await statement.executeAsync({
      $name: user.name,
      $email: user.email,
      $password: user.password,
      $role: user.role ?? 'user',
      $isVerified: user.isVerified ? 1 : 0,
      $verifyOtp: user.verifyOtp ?? '',
      $verifyOtpExpiry: user.verifyOtpExpiry ?? 0,
      $resetOtp: user.resetOtp ?? '',
      $resetOtpExpiry: user.resetOtpExpiry ?? 0,
    });
    return result.lastInsertRowId;
  } finally {
    await statement.finalizeAsync();
  }
};

// Get all users
export const getUsers = async () => {
  return await db.getAllAsync('SELECT * FROM users');
};

// Get user by email
export const getUserByEmail = async (email) => {
  return await db.getFirstAsync(
    'SELECT * FROM users WHERE email = $email',
    { $email: email }
  );
};

// Update user by ID
export const updateUser = async (id, updates) => {
  const statement = await db.prepareAsync(`
    UPDATE users 
    SET name = $name, email = $email, password = $password, role = $role, 
        isVerified = $isVerified, verifyOtp = $verifyOtp, verifyOtpExpiry = $verifyOtpExpiry,
        resetOtp = $resetOtp, resetOtpExpiry = $resetOtpExpiry, updatedAt = CURRENT_TIMESTAMP
    WHERE id = $id
  `);

  try {
    const result = await statement.executeAsync({
      $id: id,
      $name: updates.name,
      $email: updates.email,
      $password: updates.password,
      $role: updates.role ?? 'user',
      $isVerified: updates.isVerified ? 1 : 0,
      $verifyOtp: updates.verifyOtp ?? '',
      $verifyOtpExpiry: updates.verifyOtpExpiry ?? 0,
      $resetOtp: updates.resetOtp ?? '',
      $resetOtpExpiry: updates.resetOtpExpiry ?? 0,
    });
    return result.changes;
  } finally {
    await statement.finalizeAsync();
  }
};

// Delete user by ID
export const deleteUser = async (id) => {
  const statement = await db.prepareAsync('DELETE FROM users WHERE id = $id');
  try {
    const result = await statement.executeAsync({ $id: id });
    return result.changes;
  } finally {
    await statement.finalizeAsync();
  }
};


// Verify user by ID (mark as verified)
export const verifyUserLocal = async (id) => {
  const statement = await db.prepareAsync(`
    UPDATE users 
    SET isVerified = 1, updatedAt = CURRENT_TIMESTAMP 
    WHERE id = $id
  `);

  try {
    const result = await statement.executeAsync({ $id: id });
    return result.changes > 0;
  } finally {
    await statement.finalizeAsync();
  }
};

// Update OTP for a user
export const updateOtp = async (id, otp) => {
  const statement = await db.prepareAsync(`
    UPDATE users 
    SET verifyOtp = $otp, updatedAt = CURRENT_TIMESTAMP 
    WHERE id = $id
  `);

  try {
    const result = await statement.executeAsync({ $id: id, $otp: otp });
    return result.changes > 0;
  } finally {
    await statement.finalizeAsync();
  }
};