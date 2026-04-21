'use client';

import { useState, useEffect } from "react";

interface Application {
  _id: string;
  appNumber: string;
  personal: {
    name: string;
    phone: string;
    email: string;
    currentAddress: string;
    idNumber: string;
    gender?: string;
    age?: number;
    birthPlace?: string;
    birthDate?: string;
    relativeName?: string;
    idType?: string;
    nonRelativeName?: string;
    nonRelativePhone?: string;
  };
  qualifications?: any[];
  courses?: any[];
  computerSkills?: any[];
  languages?: any[];
  experiences?: any[];
  files: { name: string; url: string }[];
  submittedAt: string;
}

export default function AdminDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // تحميل البيانات أول مرة
  useEffect(() => {
    loadData();
  }, []);

  // تحديث البيانات كل 3 ثوانٍ
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // تطبيق البحث والفرز والفلتر
  useEffect(() => {
    filterAndSortApps();
  }, [search, sortBy, dateFilter, applications]);

  const loadData = async () => {
    try {
      const [appsRes, settingsRes] = await Promise.all([
        fetch("/api/applications"),
        fetch("/api/settings")
      ]);
      if (appsRes.ok) {
        const data = await appsRes.json();
        setApplications(data);
      }
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setIsEnabled(settings.applyEnabled || false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortApps = () => {
    let filtered = [...applications];
    
    // البحث
    if (search) {
      filtered = filtered.filter(app => 
        app.personal.name.toLowerCase().includes(search.toLowerCase()) ||
        app.personal.phone.includes(search) ||
        app.appNumber.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // فلتر التاريخ
    if (dateFilter) {
      filtered = filtered.filter(app => {
        const appDate = new Date(app.submittedAt);
        const filterDate = new Date(dateFilter);
        return (
          appDate.getFullYear() === filterDate.getFullYear() &&
          appDate.getMonth() === filterDate.getMonth() &&
          appDate.getDate() === filterDate.getDate()
        );
      });
    }
    
    // الفرز حسب التاريخ
    filtered.sort((a, b) => {
      const dateA = new Date(a.submittedAt);
      const dateB = new Date(b.submittedAt);
      return sortBy === "newest" ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });
    
    setFilteredApps(filtered);
  };

  const toggleApply = async () => {
    const newState = !isEnabled;
    console.log("🔄 تغيير حالة التقديم إلى:", newState ? "مفعل" : "معطل");
    
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applyEnabled: newState })
      });
      
      if (response.ok) {
        setIsEnabled(newState);
        console.log("✅ تم تغيير الحالة بنجاح");
        alert(newState ? "✅ تم تفعيل رابط التقديم" : "🔴 تم تعطيل رابط التقديم");
      } else {
        console.error("❌ فشل تغيير الحالة");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const printFullApplication = (app: Application) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    const formatValue = (value: any) => {
      if (!value || value === "") return "<span style='color: #999; font-style: italic;'>لم يتم التعبئة</span>";
      return value;
    };
    
    const renderArrayTable = (title: string, data: any[], headers: string[], fields: string[]) => {
      if (!data || data.length === 0 || (data.length === 1 && !data[0][fields[0]])) {
        return `<div style="margin-top: 20px;"><h3 style="background: #e0e0e0; padding: 8px;">${title}</h3><p style="color: #999;">لا توجد بيانات</p></div>`;
      }
      return `
        <div style="margin-top: 20px; page-break-inside: avoid;">
          <h3 style="background: #e0e0e0; padding: 8px;">${title}</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 11pt;">
            <thead>
              <tr style="background: #f0f0f0;">
                ${headers.map(h => `<th style="border: 1px solid black; padding: 6px;">${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(item => `
                <tr>
                  ${fields.map(f => `<td style="border: 1px solid black; padding: 6px;">${formatValue(item[f])}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    };
    
    const html = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>استمارة التوظيف - ${app.appNumber}</title>
        <meta charset="UTF-8">
        <style>
          @page { size: A4; margin: 1cm; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.4; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          th, td { border: 1px solid black; padding: 5px; vertical-align: top; }
          th { background: #e0e0e0; font-weight: bold; }
          h1 { text-align: center; font-size: 18pt; margin-bottom: 5px; }
          h2 { text-align: center; font-size: 13pt; color: #555; margin-bottom: 15px; }
          h3 { font-size: 12pt; margin-top: 15px; margin-bottom: 8px; border-bottom: 1px solid #333; }
          .section { margin-bottom: 20px; page-break-inside: avoid; }
          .info-table td { padding: 4px 6px; }
        </style>
      </head>
      <body>
        <button class="no-print" onclick="window.print()" style="margin: 10px; padding: 8px 16px;">🖨️ طباعة</button>
        <button class="no-print" onclick="window.close()" style="margin: 10px; padding: 8px 16px;">✖ إغلاق</button>
        
        <h1>📋 استمارة التوظيف</h1>
        <h2>رقم الطلب: ${app.appNumber}</h2>
        
        <div class="section">
          <h3>👤 البيانات الشخصية</h3>
          <table class="info-table">
            <tr><th style="width: 35%;">الاسم الكامل</th><td>${formatValue(app.personal.name)}</td></tr>
            <tr><th>الجنس</th><td>${formatValue(app.personal.gender)}</td></tr>
            <tr><th>العمر</th><td>${formatValue(app.personal.age)}</td></tr>
            <tr><th>مكان الميلاد</th><td>${formatValue(app.personal.birthPlace)}</td></tr>
            <tr><th>تاريخ الميلاد</th><td>${formatValue(app.personal.birthDate)}</td></tr>
            <tr><th>اسم شخص قريب</th><td>${formatValue(app.personal.relativeName)}</td></tr>
            <tr><th>رقم الهاتف</th><td>${formatValue(app.personal.phone)}</td></tr>
            <tr><th>البريد الإلكتروني</th><td>${formatValue(app.personal.email)}</td></tr>
            <tr><th>نوع البطاقة</th><td>${formatValue(app.personal.idType)}</td></tr>
            <tr><th>رقم البطاقة</th><td>${formatValue(app.personal.idNumber)}</td></tr>
            <tr><th>عنوان السكن</th><td>${formatValue(app.personal.currentAddress)}</td></tr>
            <tr><th>اسم شخص غير قريب</th><td>${formatValue(app.personal.nonRelativeName)}</td></tr>
            <tr><th>هاتف الشخص غير القريب</th><td>${formatValue(app.personal.nonRelativePhone)}</td></tr>
          </table>
        </div>
        
        ${renderArrayTable("🎓 المؤهلات الدراسية", app.qualifications || [], ["الجامعة", "سنة التخرج", "التخصص", "الشهادة", "من", "إلى"], ["university", "graduationYear", "major", "degree", "from", "to"])}
        ${renderArrayTable("📚 الدورات التدريبية", app.courses || [], ["مكان الدورة", "سنة الدورة", "موضوع الدورة", "المدة"], ["place", "year", "subject", "duration"])}
        ${renderArrayTable("💻 مهارات الكمبيوتر", app.computerSkills || [], ["المهارة", "المستوى"], ["skill", "level"])}
        ${renderArrayTable("🌐 اللغات", app.languages || [], ["اللغة", "المستوى"], ["language", "level"])}
        ${renderArrayTable("💼 الخبرات العملية", app.experiences || [], ["الوظيفة", "جهة العمل", "عدد السنوات", "من", "إلى", "أسباب الترك"], ["jobTitle", "company", "years", "from", "to", "reason"])}
        
        <div class="section">
          <h3>📎 المرفقات</h3>
          <table>
            <tr><th>السيرة الذاتية</th><td>${app.files.find(f => f.name === 'السيرة الذاتية') ? '✅ مرفق' : '❌ غير مرفق'}</td></tr>
            <tr><th>المؤهل الدراسي</th><td>${app.files.find(f => f.name === 'المؤهل الدراسي') ? '✅ مرفق' : '❌ غير مرفق'}</td></tr>
            <tr><th>البطاقة الشخصية</th><td>${app.files.find(f => f.name === 'البطاقة الشخصية') ? '✅ مرفق' : '❌ غير مرفق'}</td></tr>
          </table>
        </div>
        
        <p style="text-align: center; margin-top: 30px; font-size: 9pt; color: #999;">
          تاريخ التقديم: ${new Date(app.submittedAt).toLocaleString("ar-SA")}
        </p>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (loading) return <div className="p-10 text-center text-lg">جاري التحميل...</div>;

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto space-y-3">
        
        {/* رأس الصفحة */}
        <div className="bg-white rounded-xl p-3 shadow">
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">📊 لوحة التحكم</h1>
            <button 
              onClick={toggleApply}
              className={`px-3 py-1.5 rounded-lg font-bold text-sm shadow transition-all ${
                isEnabled ? "bg-red-500 hover:bg-red-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"
              }`}
            >
              {isEnabled ? "🔴 تعطيل التقديم" : "🟢 تفعيل التقديم"}
            </button>
          </div>
        </div>
        
        {/* البحث والفرز والفلتر */}
        <div className="bg-white rounded-xl p-3 shadow">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="🔍 بحث بالاسم أو رقم الهاتف أو رقم الطلب..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 p-2 border rounded-lg text-sm"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
              className="px-3 py-2 border rounded-lg bg-white text-sm"
            >
              <option value="newest">📅 الأحدث أولاً</option>
              <option value="oldest">📅 الأقدم أولاً</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter("")}
                className="px-3 py-2 bg-gray-200 rounded-lg text-sm hover:bg-gray-300 transition-all"
              >
                ✖ إلغاء الفلتر
              </button>
            )}
          </div>
        </div>
        
        {/* إحصائيات سريعة */}
        <div className="bg-white rounded-xl p-3 shadow">
          <div className="flex justify-between items-center text-sm">
            <span>📊 إجمالي الطلبات: <strong>{filteredApps.length}</strong></span>
            <span>📅 آخر تحديث: {new Date().toLocaleTimeString("ar-SA")}</span>
          </div>
        </div>
        
        {/* قائمة الطلبات - بطاقات للهواتف */}
        <div className="space-y-2">
          {filteredApps.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-500">
              {search || dateFilter ? "لا توجد نتائج مطابقة" : "لا توجد طلبات حتى الآن"}
            </div>
          ) : (
            filteredApps.map((app) => (
              <div key={app._id} className="bg-white rounded-xl p-3 shadow border-r-4 border-blue-500">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <span className="text-xs text-gray-500">رقم الطلب</span>
                    <div className="font-bold text-blue-600 text-sm">{app.appNumber}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">التاريخ</span>
                    <div className="text-xs">{new Date(app.submittedAt).toLocaleDateString("ar-SA")}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="font-bold text-base">{app.personal.name}</div>
                  <div className="text-xs text-gray-500 dir-ltr">{app.personal.phone}</div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={() => setSelectedApp(app)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-1.5 rounded-lg text-sm font-bold transition-all"
                  >
                    👁️ عرض
                  </button>
                  <button 
                    onClick={() => printFullApplication(app)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1.5 rounded-lg text-sm font-bold transition-all"
                  >
                    🖨️ طباعة
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* نافذة عرض التفاصيل */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2" onClick={() => setSelectedApp(null)}>
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b p-3 flex justify-between items-center">
                <h2 className="text-base font-bold">تفاصيل الطلب - {selectedApp.appNumber}</h2>
                <button onClick={() => setSelectedApp(null)} className="text-gray-500 text-xl hover:text-gray-700">✖</button>
              </div>
              <div className="p-3 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-bold">الاسم:</span> {selectedApp.personal.name}</div>
                  <div><span className="font-bold">الجنس:</span> {selectedApp.personal.gender || "-"}</div>
                  <div><span className="font-bold">العمر:</span> {selectedApp.personal.age || "-"}</div>
                  <div><span className="font-bold">رقم الهاتف:</span> {selectedApp.personal.phone}</div>
                  <div><span className="font-bold">رقم البطاقة:</span> {selectedApp.personal.idNumber}</div>
                  <div><span className="font-bold">العنوان:</span> {selectedApp.personal.currentAddress?.substring(0, 30)}</div>
                </div>
                
                <div className="border-t pt-2">
                  <h3 className="font-bold text-sm mb-1">📎 المرفقات</h3>
                  {selectedApp.files.length > 0 ? (
                    selectedApp.files.map((file, i) => (
                      <a key={i} href={file.url} target="_blank" className="block bg-gray-100 p-2 rounded-lg text-blue-600 text-sm mb-1 hover:bg-gray-200">
                        📄 {file.name}
                      </a>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm">لا توجد مرفقات</div>
                  )}
                </div>
                
                <button 
                  onClick={() => printFullApplication(selectedApp)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-bold text-sm mt-2 transition-all"
                >
                  🖨️ طباعة الاستمارة كاملة
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}