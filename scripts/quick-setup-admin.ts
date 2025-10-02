#!/usr/bin/env tsx
import { db } from '../server/db';
import { users, tenants } from '../shared/schema';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { eq } from 'drizzle-orm';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

function generateSecurePassword(): string {
  const length = 16;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  const all = uppercase + lowercase + numbers + special;
  
  let password = '';
  // Garantisce almeno 1 carattere di ogni tipo
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Riempie il resto
  for (let i = 4; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  // Shuffle
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function quickSetupAdmin() {
  console.log('⚡ NYVRA Quick Admin Setup\n');

  try {
    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.role, 'system_creator'))
      .limit(1);
    
    if (existingAdmin.length > 0) {
      console.error('❌ Admin user already exists!');
      console.error('   Username:', existingAdmin[0].username);
      console.error('   Email:', existingAdmin[0].email);
      console.error('\n   Delete it first if you need to recreate it.\n');
      process.exit(1);
    }

    console.log('🔐 Generating secure credentials...\n');

    // Generate secure random credentials
    const username = 'admin';
    const email = 'admin@nyvra.local';
    const password = generateSecurePassword();

    console.log('📊 Creating admin account...\n');

    // Transaction: create tenant and user atomically
    await db.transaction(async (tx) => {
      // Check if enterprise tenant exists, create if not
      let masterTenant = await tx
        .select()
        .from(tenants)
        .where(eq(tenants.type, 'enterprise'))
        .limit(1);

      let tenantId: string;

      if (masterTenant.length === 0) {
        console.log('   Creating master tenant...');
        const [newTenant] = await tx
          .insert(tenants)
          .values({
            name: 'NYVRA Master',
            type: 'enterprise'
          })
          .returning();
        tenantId = newTenant.id;
        console.log('   ✅ Master tenant created');
      } else {
        tenantId = masterTenant[0].id;
        console.log('   ✅ Using existing master tenant');
      }

      // Hash password
      console.log('   Hashing password...');
      const hashedPassword = await hashPassword(password);

      // Create admin user
      console.log('   Creating admin user...');
      await tx
        .insert(users)
        .values({
          username,
          email,
          password: hashedPassword,
          role: 'system_creator',
          tenantId
        });

      console.log('   ✅ Admin user created');
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ QUICK SETUP COMPLETED!');
    console.log('='.repeat(60));
    console.log('\n🔑 TEMPORARY CREDENTIALS (SAVE THESE NOW!):\n');
    console.log('   Username: ' + username);
    console.log('   Email:    ' + email);
    console.log('   Password: ' + password);
    console.log('\n' + '='.repeat(60));
    console.log('\n⚠️  SECURITY NOTICE:');
    console.log('   1. These credentials are TEMPORARY');
    console.log('   2. Change your password immediately after first login');
    console.log('   3. This password will NOT be shown again');
    console.log('\n🚀 You can now login at: http://localhost:5000\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

quickSetupAdmin();
