import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import Settings from '@/app/models/Settings';

export async function GET() {
  try {
    await connectToDatabase();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ applyEnabled: true });
    }
    return NextResponse.json({ applyEnabled: settings.applyEnabled });
  } catch (error) {
    console.error('Error getting settings:', error);
    // في حالة الخطأ، نعيد القيمة الافتراضية
    return NextResponse.json({ applyEnabled: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { applyEnabled } = await request.json();
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ applyEnabled });
    } else {
      settings.applyEnabled = applyEnabled;
    }
    await settings.save();
    
    console.log("📌 حالة التقديم تغيرت إلى:", applyEnabled ? "مفعل" : "معطل");
    return NextResponse.json({ success: true, applyEnabled });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ success: false, error: 'فشل في حفظ الإعدادات' }, { status: 500 });
  }
}