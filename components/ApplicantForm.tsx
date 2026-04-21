'use client';

import { useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 📋 Schema للتحقق من البيانات
const formSchema = z.object({
  name: z.string().min(3, 'الاسم مطلوب'),
  gender: z.string().min(1, 'الجنس مطلوب'),
  age: z.number().min(18, 'العمر يجب أن يكون 18 أو أكثر').max(100),
  birthPlace: z.string(),
  birthDate: z.string(),
  relativeName: z.string(),
  phone: z.string().min(10, 'رقم هاتف صحيح مطلوب'),
  email: z.string().email('بريد إلكتروني غير صحيح').optional(),
  idType: z.string(),
  idNumber: z.string().min(1, 'رقم البطاقة مطلوب'),
  currentAddress: z.string().min(1, 'العنوان مطلوب'),
  nonRelativeName: z.string(),
  nonRelativePhone: z.string(),
  
  qualifications: z.array(z.object({
    university: z.string(),
    graduationYear: z.string(),
    major: z.string(),
    degree: z.string(),
    from: z.string(),
    to: z.string(),
  })),
  
  courses: z.array(z.object({
    place: z.string(),
    year: z.string(),
    subject: z.string(),
    duration: z.string(),
  })),
  
  computerSkills: z.array(z.object({
    skill: z.enum(['Word', 'Excel', 'Access', 'محاسبة']),
    level: z.enum(['جيد', 'متوسط', 'ضعيف']),
  })),
  
  languages: z.array(z.object({
    language: z.string(),
    level: z.enum(['ممتاز', 'جيد جداً', 'جيد', 'متوسط', 'مبتدئ']),
  })),
  
  experiences: z.array(z.object({
    jobTitle: z.string(),
    company: z.string(),
    years: z.string(),
    from: z.string(),
    to: z.string(),
    reason: z.string(),
  })),
});

type FormData = z.infer<typeof formSchema>;

export default function ApplicantForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  
  // Refs للملفات
  const cvRef = useRef<HTMLInputElement>(null);
  const degreeRef = useRef<HTMLInputElement>(null);
  const idRef = useRef<HTMLInputElement>(null);
  
  const { register, control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      qualifications: [{ university: '', graduationYear: '', major: '', degree: '', from: '', to: '' }],
      courses: [{ place: '', year: '', subject: '', duration: '' }],
      computerSkills: [{ skill: 'Word', level: 'جيد' }],
      languages: [{ language: '', level: 'جيد' }],
      experiences: [{ jobTitle: '', company: '', years: '', from: '', to: '', reason: '' }],
    }
  });
  
  const { fields: qualFields, append: addQual, remove: removeQual } = useFieldArray({ control, name: 'qualifications' });
  const { fields: courseFields, append: addCourse, remove: removeCourse } = useFieldArray({ control, name: 'courses' });
  const { fields: skillFields, append: addSkill, remove: removeSkill } = useFieldArray({ control, name: 'computerSkills' });
  const { fields: langFields, append: addLang, remove: removeLang } = useFieldArray({ control, name: 'languages' });
  const { fields: expFields, append: addExp, remove: removeExp } = useFieldArray({ control, name: 'experiences' });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setShowSuccess(false);
    setShowError(false);
    
    // التحقق من الملفات
    const cvFile = cvRef.current?.files?.[0];
    const degreeFile = degreeRef.current?.files?.[0];
    const idFile = idRef.current?.files?.[0];
    
    console.log('📁 الملفات المرفوعة:');
    console.log('- السيرة الذاتية:', cvFile?.name || 'لا يوجد');
    console.log('- المؤهل الدراسي:', degreeFile?.name || 'لا يوجد');
    console.log('- البطاقة:', idFile?.name || 'لا يوجد');
    
    if (!cvFile || !degreeFile || !idFile) {
      alert('الرجاء رفع جميع الملفات المطلوبة (السيرة الذاتية، المؤهل، البطاقة)');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const formDataToSend = new FormData();
      
      // إضافة البيانات النصية
      Object.keys(data).forEach(key => {
        const value = data[key as keyof FormData];
        if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formDataToSend.append(key, String(value));
        }
      });
      
      // إضافة الملفات
      formDataToSend.append('cv', cvFile);
      formDataToSend.append('degree', degreeFile);
      formDataToSend.append('id', idFile);
      
      console.log('📤 جاري إرسال الطلب...');
      
      const response = await fetch('/api/apply', {
        method: 'POST',
        body: formDataToSend,
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
        reset(); // إعادة تعيين النموذج
        if (cvRef.current) cvRef.current.value = '';
        if (degreeRef.current) degreeRef.current.value = '';
        if (idRef.current) idRef.current.value = '';
      } else {
        throw new Error(result.message || 'فشل الإرسال');
      }
      
    } catch (error) {
      console.error('Error:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-2xl p-6 mb-6 shadow-lg">
          <h1 className="text-2xl font-bold text-center">📋 استمارة التوظيف</h1>
          <p className="text-center text-blue-100 text-sm mt-2">نظام تقديم إلكتروني متكامل</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* البيانات الشخصية */}
          <div className="bg-white rounded-2xl p-5 shadow-md border-r-4 border-blue-600">
            <h2 className="text-xl font-bold text-gray-800 mb-5">👤 البيانات الشخصية</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">الاسم الكامل <span className="text-red-500">*</span></label>
                <input {...register('name')} className="w-full p-3 border rounded-xl" />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-2">الجنس <span className="text-red-500">*</span></label>
                  <select {...register('gender')} className="w-full p-3 border rounded-xl">
                    <option value="">اختر</option>
                    <option>ذكر</option>
                    <option>أنثى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">العمر <span className="text-red-500">*</span></label>
                  <input type="number" {...register('age', { valueAsNumber: true })} className="w-full p-3 border rounded-xl" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-2">مكان الميلاد</label>
                  <input {...register('birthPlace')} className="w-full p-3 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">تاريخ الميلاد</label>
                  <input type="date" {...register('birthDate')} className="w-full p-3 border rounded-xl" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">اسم شخص قريب</label>
                <input {...register('relativeName')} className="w-full p-3 border rounded-xl" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-2">رقم الهاتف <span className="text-red-500">*</span></label>
                  <input type="tel" {...register('phone')} className="w-full p-3 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">البريد الإلكتروني</label>
                  <input type="email" {...register('email')} className="w-full p-3 border rounded-xl" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-2">نوع البطاقة</label>
                  <select {...register('idType')} className="w-full p-3 border rounded-xl">
                    <option>هوية وطنية</option>
                    <option>إقامة</option>
                    <option>جواز سفر</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">رقم البطاقة <span className="text-red-500">*</span></label>
                  <input {...register('idNumber')} className="w-full p-3 border rounded-xl" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">عنوان السكن <span className="text-red-500">*</span></label>
                <textarea {...register('currentAddress')} rows={3} className="w-full p-3 border rounded-xl" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-2">اسم شخص غير قريب</label>
                  <input {...register('nonRelativeName')} className="w-full p-3 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">هاتف الشخص</label>
                  <input {...register('nonRelativePhone')} className="w-full p-3 border rounded-xl" />
                </div>
              </div>
            </div>
          </div>
          
          {/* المؤهلات الدراسية */}
          <div className="bg-white rounded-2xl p-5 shadow-md border-r-4 border-green-600">
            <h2 className="text-xl font-bold text-gray-800 mb-5">🎓 المؤهلات الدراسية</h2>
            {qualFields.map((field, idx) => (
              <div key={field.id} className="bg-gray-50 rounded-xl p-4 mb-4 relative">
                <button type="button" onClick={() => removeQual(idx)} className="absolute top-2 left-2 text-red-500">✖</button>
                <div className="space-y-3">
                  <input {...register(`qualifications.${idx}.university`)} placeholder="الجامعة" className="w-full p-3 border rounded-xl" />
                  <div className="grid grid-cols-2 gap-3">
                    <input {...register(`qualifications.${idx}.graduationYear`)} placeholder="سنة التخرج" className="p-3 border rounded-xl" />
                    <input {...register(`qualifications.${idx}.major`)} placeholder="التخصص" className="p-3 border rounded-xl" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <select {...register(`qualifications.${idx}.degree`)} className="p-3 border rounded-xl">
                      <option>بكالوريوس</option><option>ماجستير</option><option>دكتوراه</option><option>دبلوم</option>
                    </select>
                    <input {...register(`qualifications.${idx}.from`)} placeholder="من" className="p-3 border rounded-xl" />
                    <input {...register(`qualifications.${idx}.to`)} placeholder="إلى" className="p-3 border rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => addQual({})} className="w-full py-3 bg-green-100 text-green-700 rounded-xl font-bold">+ إضافة مؤهل</button>
          </div>
          
          {/* الدورات التدريبية */}
          <div className="bg-white rounded-2xl p-5 shadow-md border-r-4 border-yellow-600">
            <h2 className="text-xl font-bold text-gray-800 mb-5">📚 الدورات التدريبية</h2>
            {courseFields.map((field, idx) => (
              <div key={field.id} className="bg-gray-50 rounded-xl p-4 mb-4 relative">
                <button type="button" onClick={() => removeCourse(idx)} className="absolute top-2 left-2 text-red-500">✖</button>
                <div className="grid grid-cols-2 gap-3">
                  <input {...register(`courses.${idx}.place`)} placeholder="مكان الدورة" className="p-3 border rounded-xl" />
                  <input {...register(`courses.${idx}.year`)} placeholder="سنة الدورة" className="p-3 border rounded-xl" />
                  <input {...register(`courses.${idx}.subject`)} placeholder="موضوع الدورة" className="p-3 border rounded-xl" />
                  <input {...register(`courses.${idx}.duration`)} placeholder="المدة" className="p-3 border rounded-xl" />
                </div>
              </div>
            ))}
            <button type="button" onClick={() => addCourse({})} className="w-full py-3 bg-yellow-100 text-yellow-700 rounded-xl font-bold">+ إضافة دورة</button>
          </div>
          
          {/* مهارات الكمبيوتر */}
          <div className="bg-white rounded-2xl p-5 shadow-md border-r-4 border-purple-600">
            <h2 className="text-xl font-bold text-gray-800 mb-5">💻 مهارات الكمبيوتر</h2>
            {skillFields.map((field, idx) => (
              <div key={field.id} className="bg-gray-50 rounded-xl p-4 mb-3 flex gap-3">
                <select {...register(`computerSkills.${idx}.skill`)} className="flex-1 p-3 border rounded-xl">
                  <option>Word</option><option>Excel</option><option>Access</option><option>محاسبة</option>
                </select>
                <select {...register(`computerSkills.${idx}.level`)} className="flex-1 p-3 border rounded-xl">
                  <option>جيد</option><option>متوسط</option><option>ضعيف</option>
                </select>
                <button type="button" onClick={() => removeSkill(idx)} className="text-red-500">✖</button>
              </div>
            ))}
            <button type="button" onClick={() => addSkill({})} className="w-full py-3 bg-purple-100 text-purple-700 rounded-xl font-bold">+ إضافة مهارة</button>
          </div>
          
          {/* اللغات */}
          <div className="bg-white rounded-2xl p-5 shadow-md border-r-4 border-indigo-600">
            <h2 className="text-xl font-bold text-gray-800 mb-5">🌐 اللغات</h2>
            {langFields.map((field, idx) => (
              <div key={field.id} className="bg-gray-50 rounded-xl p-4 mb-3 flex gap-3">
                <input {...register(`languages.${idx}.language`)} placeholder="اللغة" className="flex-1 p-3 border rounded-xl" />
                <select {...register(`languages.${idx}.level`)} className="flex-1 p-3 border rounded-xl">
                  <option>ممتاز</option><option>جيد جداً</option><option>جيد</option><option>متوسط</option><option>مبتدئ</option>
                </select>
                <button type="button" onClick={() => removeLang(idx)} className="text-red-500">✖</button>
              </div>
            ))}
            <button type="button" onClick={() => addLang({})} className="w-full py-3 bg-indigo-100 text-indigo-700 rounded-xl font-bold">+ إضافة لغة</button>
          </div>
          
          {/* الخبرات العملية */}
          <div className="bg-white rounded-2xl p-5 shadow-md border-r-4 border-red-600">
            <h2 className="text-xl font-bold text-gray-800 mb-5">💼 الخبرات العملية</h2>
            {expFields.map((field, idx) => (
              <div key={field.id} className="bg-gray-50 rounded-xl p-4 mb-4 relative">
                <button type="button" onClick={() => removeExp(idx)} className="absolute top-2 left-2 text-red-500">✖</button>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input {...register(`experiences.${idx}.jobTitle`)} placeholder="اسم الوظيفة" className="p-3 border rounded-xl" />
                    <input {...register(`experiences.${idx}.company`)} placeholder="جهة العمل" className="p-3 border rounded-xl" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input {...register(`experiences.${idx}.years`)} placeholder="عدد السنوات" className="p-3 border rounded-xl" />
                    <input {...register(`experiences.${idx}.from`)} placeholder="من" className="p-3 border rounded-xl" />
                    <input {...register(`experiences.${idx}.to`)} placeholder="إلى" className="p-3 border rounded-xl" />
                  </div>
                  <textarea {...register(`experiences.${idx}.reason`)} placeholder="أسباب ترك العمل" rows={2} className="w-full p-3 border rounded-xl" />
                </div>
              </div>
            ))}
            <button type="button" onClick={() => addExp({})} className="w-full py-3 bg-red-100 text-red-700 rounded-xl font-bold">+ إضافة خبرة</button>
          </div>
          
          {/* المرفقات */}
          <div className="bg-white rounded-2xl p-5 shadow-md border-r-4 border-pink-600">
            <h2 className="text-xl font-bold text-gray-800 mb-5">📎 المرفقات <span className="text-red-500">*</span></h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-pink-300 rounded-xl p-4 text-center">
                <p className="font-bold mb-2">📄 السيرة الذاتية (PDF)</p>
                <input ref={cvRef} type="file" accept=".pdf" required className="w-full text-sm" />
              </div>
              <div className="border-2 border-dashed border-pink-300 rounded-xl p-4 text-center">
                <p className="font-bold mb-2">🎓 المؤهل الدراسي (PDF)</p>
                <input ref={degreeRef} type="file" accept=".pdf" required className="w-full text-sm" />
              </div>
              <div className="border-2 border-dashed border-pink-300 rounded-xl p-4 text-center">
                <p className="font-bold mb-2">🆔 البطاقة الشخصية (PDF)</p>
                <input ref={idRef} type="file" accept=".pdf" required className="w-full text-sm" />
              </div>
            </div>
          </div>
          
          <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 rounded-xl text-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
            {isSubmitting ? 'جاري الإرسال...' : '📤 إرسال الطلب'}
          </button>
          
          {showSuccess && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50">
              ✅ تم إرسال طلبك بنجاح! شكراً لتقديمك
            </div>
          )}
          
          {showError && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50">
              ❌ حدث خطأ، الرجاء المحاولة مرة أخرى
            </div>
          )}
        </form>
      </div>
    </div>
  );
}