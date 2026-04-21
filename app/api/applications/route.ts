import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import Application from '@/app/models/Application';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { applicationNumber: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const applications = await Application.find(query).sort({ submittedAt: -1 });
    
    const formattedApplications = applications.map((app: any) => {
      // بناء روابط الملفات
      const files = [];
      
      if (app.cvFile) {
        files.push({ 
          name: 'السيرة الذاتية', 
          url: app.cvFile.startsWith('/') ? app.cvFile : `/uploads/${path.basename(app.cvFile)}`
        });
      }
      if (app.degreeFile) {
        files.push({ 
          name: 'المؤهل الدراسي', 
          url: app.degreeFile.startsWith('/') ? app.degreeFile : `/uploads/${path.basename(app.degreeFile)}`
        });
      }
      if (app.idFile) {
        files.push({ 
          name: 'البطاقة الشخصية', 
          url: app.idFile.startsWith('/') ? app.idFile : `/uploads/${path.basename(app.idFile)}`
        });
      }
      
      console.log('Files for app:', app.applicationNumber, files); // للتشخيص
      
      return {
        _id: app._id,
        appNumber: app.applicationNumber || `APP-${app._id}`,
        personal: {
          name: app.name || '',
          gender: app.gender || '',
          age: app.age || '',
          birthPlace: app.birthPlace || '',
          birthDate: app.birthDate || '',
          relativeName: app.relativeName || '',
          phone: app.phone || '',
          email: app.email || '',
          idType: app.idType || '',
          idNumber: app.idNumber || '',
          currentAddress: app.currentAddress || '',
          nonRelativeName: app.nonRelativeName || '',
          nonRelativePhone: app.nonRelativePhone || '',
        },
        qualifications: app.qualifications || [],
        courses: app.courses || [],
        computerSkills: app.computerSkills || [],
        languages: app.languages || [],
        experiences: app.experiences || [],
        files: files,
        submittedAt: app.submittedAt,
      };
    });
    
    return NextResponse.json(formattedApplications);
    
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'فشل في جلب البيانات' },
      { status: 500 }
    );
  }
}