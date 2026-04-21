import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../../../lib/env'; // Later

const adminEmail = process.env.ADMIN_EMAIL || 'admin@company.com';
const adminPassHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // admin123

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  if (email !== adminEmail || !bcrypt.compareSync(password, adminPassHash)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret');
  return NextResponse.json({ token });
}

