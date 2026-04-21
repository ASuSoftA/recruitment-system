import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import Application from '@/app/models/Application';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

// إعداد مجلد رفع الملفات
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function POST(request: NextRequest) {
  try {
    // الاتصال بقاعدة البيانات
    await connectToDatabase();
    
    // استقبال البيانات من النموذج
    const formData = await request.formData();
    
    // استخراج البيانات النصية
    const applicationData: any = {};
    
    for (const [key, value] of formData.entries()) {
      // تخطي الملفات حالياً
      if (key === 'cv' || key === 'degree' || key === 'id') continue;
      
      if (typeof value === 'string') {
        // معالجة الحقول التي تحتوي على أرقام
        if (key === 'age') {
          applicationData[key] = parseInt(value);
        } 
        // معالجة الجداول الديناميكية (التي تأتي كـ JSON string)
        else if (key === 'qualifications' || key === 'courses' || key === 'computerSkills' || key === 'languages' || key === 'experiences') {
          try {
            applicationData[key] = JSON.parse(value);
          } catch (e) {
            applicationData[key] = [];
          }
        }
        else {
          applicationData[key] = value;
        }
      }
    }
    
    // إنشاء مجلد رفع الملفات إذا لم يكن موجوداً
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }
    
    // رفع السيرة الذاتية
    const cvFile = formData.get('cv') as File;
    if (cvFile && cvFile.size > 0) {
      const cvBuffer = Buffer.from(await cvFile.arrayBuffer());
      const timestamp = Date.now();
      const cvFileName = `${timestamp}-cv-${cvFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const cvPath = path.join(UPLOAD_DIR, cvFileName);
      await writeFile(cvPath, cvBuffer);
      applicationData.cvFile = `/uploads/${cvFileName}`;
      console.log('CV saved:', applicationData.cvFile);
    }
    
    // رفع المؤهل الدراسي
    const degreeFile = formData.get('degree') as File;
    if (degreeFile && degreeFile.size > 0) {
      const degreeBuffer = Buffer.from(await degreeFile.arrayBuffer());
      const timestamp = Date.now();
      const degreeFileName = `${timestamp}-degree-${degreeFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const degreePath = path.join(UPLOAD_DIR, degreeFileName);
      await writeFile(degreePath, degreeBuffer);
      applicationData.degreeFile = `/uploads/${degreeFileName}`;
      console.log('Degree saved:', applicationData.degreeFile);
    }
    
    // رفع البطاقة الشخصية
    const idFile = formData.get('id') as File;
    if (idFile && idFile.size > 0) {
      const idBuffer = Buffer.from(await idFile.arrayBuffer());
      const timestamp = Date.now();
      const idFileName = `${timestamp}-id-${idFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const idPath = path.join(UPLOAD_DIR, idFileName);
      await writeFile(idPath, idBuffer);
      applicationData.idFile = `/uploads/${idFileName}`;
      console.log('ID saved:', applicationData.idFile);
    }
    
    console.log('Saving application with data:', {
      name: applicationData.name,
      hasCV: !!applicationData.cvFile,
      hasDegree: !!applicationData.degreeFile,
      hasID: !!applicationData.idFile
    });
    
    // حفظ البيانات في قاعدة البيانات
    const application = new Application(applicationData);
    await application.save();
    
    return NextResponse.json({
      success: true,
      message: 'تم إرسال طلبك بنجاح',
      applicationNumber: application.applicationNumber,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error saving application:', error);
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ في إرسال الطلب',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}