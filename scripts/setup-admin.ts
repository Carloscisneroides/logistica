#!/usr/bin/env tsx
import { db } from '../server/db';
import { users, tenants } from '../shared/schema';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import readline from 'readline';
import { eq, and } from 'drizzle-orm';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

interface PromptOptions {
  hidden?: boolean;
}

function prompt(question: string, options: PromptOptions = {}): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  return new Promise((resolve) => {
    if (options.hidden && process.stdin.isTTY) {
      // Mask password input
      const stdin = process.stdin;
      (stdin as any).setRawMode(true);
      readline.emitKeypressEvents(stdin);

      let password = '';
      process.stdout.write(question);

      const onKeypress = (char: string, key: any) => {
        if (key && key.name === 'return') {
          stdin.removeListener('keypress', onKeypress);
          (stdin as any).setRawMode(false);
          process.stdout.write('\n');
          rl.close();
          resolve(password);
        } else if (key && key.name === 'backspace') {
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(question + '*'.repeat(password.length));
          }
        } else if (char) {
          password += char;
          process.stdout.write('*');
        }
      };

      stdin.on('keypress', onKeypress);
    } else {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    }
  });
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character' };
  }
  return { valid: true };
}

async function setupAdmin() {
  console.log('🔐 NYVRA Admin Setup Script\n');
  console.log('This script will create the first admin user for NYVRA platform.');
  console.log('WARNING: This should only be run once during initial setup.\n');

  try {
    // Check if system_creator already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.role, 'system_creator'))
      .limit(1);
    
    if (existingAdmin.length > 0) {
      console.error('❌ Admin user (system_creator) already exists.');
      console.error('   Username:', existingAdmin[0].username);
      console.error('   Email:', existingAdmin[0].email);
      console.error('\n   If you need to reset the admin, please do so through the database directly.');
      process.exit(1);
    }

    // Get user input with validation
    let username = '';
    while (!username || username.length < 3) {
      username = await prompt('Admin Username (min 3 chars): ');
      username = username.trim();
      if (!username || username.length < 3) {
        console.error('❌ Username must be at least 3 characters long\n');
      }
    }

    // Check if username already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    
    if (existingUser.length > 0) {
      console.error(`❌ Username "${username}" already exists. Please choose a different one.`);
      process.exit(1);
    }

    let email = '';
    while (!email || !validateEmail(email)) {
      email = await prompt('Admin Email: ');
      email = email.trim().toLowerCase();
      if (!validateEmail(email)) {
        console.error('❌ Invalid email format\n');
      }
    }

    // Check if email already exists
    const existingEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (existingEmail.length > 0) {
      console.error(`❌ Email "${email}" already exists. Please use a different one.`);
      process.exit(1);
    }

    let password = '';
    let passwordConfirm = '';
    let passwordValid = false;

    while (!passwordValid) {
      password = await prompt('Admin Password (min 8 chars, uppercase, lowercase, number, special char): ', { hidden: true });
      
      const validation = validatePassword(password);
      if (!validation.valid) {
        console.error(`❌ ${validation.error}\n`);
        continue;
      }

      passwordConfirm = await prompt('Confirm Password: ', { hidden: true });
      
      if (password !== passwordConfirm) {
        console.error('❌ Passwords do not match\n');
        continue;
      }

      passwordValid = true;
    }

    console.log('\n📊 Creating admin account...\n');

    // Transaction: create tenant and user atomically
    await db.transaction(async (tx) => {
      // Check if enterprise (master) tenant exists, create if not
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
        console.log('   ✅ Master tenant created (ID:', tenantId, ')');
      } else {
        tenantId = masterTenant[0].id;
        console.log('   ✅ Using existing master tenant (ID:', tenantId, ')');
      }

      // Hash password using scrypt (same as auth.ts)
      console.log('   Hashing password...');
      const hashedPassword = await hashPassword(password);

      // Create admin user
      console.log('   Creating admin user...');
      const [newUser] = await tx
        .insert(users)
        .values({
          username,
          email,
          password: hashedPassword,
          role: 'system_creator',
          tenantId
        })
        .returning();

      console.log('   ✅ Admin user created (ID:', newUser.id, ')');
    });

    console.log('\n✅ Admin setup completed successfully!\n');
    console.log('   Username:', username);
    console.log('   Email:', email);
    console.log('   Role: system_creator\n');
    console.log('🔐 You can now login with these credentials.\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

setupAdmin();
