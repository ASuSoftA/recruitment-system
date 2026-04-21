'use client';

import { useState, useEffect } from 'react';
import ApplicantForm from '@/components/ApplicantForm';

export default function ApplyPage() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setIsEnabled(data.applyEnabled);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-20 text-center">جاري التحميل...</div>;
  }

  if (!isEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">التقديم مغلق حالياً</h1>
          <p className="text-gray-600">الرجاء المحاولة لاحقاً. شكراً لاهتمامك</p>
        </div>
      </div>
    );
  }

  return <ApplicantForm />;
}