# Recruitment System TODO

## Approved Plan Steps (Next.js + MongoDB + Tailwind + Bilingual RTL)

- [x] 1. Create project structure and package.json with dependencies (Next.js 14, React, Mongoose, Zod, React Hook Form, Tailwind, jsPDF, html2canvas, multer, next-intl, etc.)

- [x] 3. DB setup: lib/mongoose.ts, models/Application.ts, models/Settings.ts
- [ ] 4. API routes: /api/upload, /api/applications (CRUD), /api/settings/toggle, /api/admin/auth
- [ ] 5. i18n: next-intl setup, public/locales/ar.json, en.json (all labels)
- [ ] 6. Pages: pages/index.tsx (/apply conditional), pages/admin/login.tsx, pages/admin/dashboard.tsx
- [ ] 7. Components: ApplicantForm.tsx (sections/tables/uploads/validation), LanguageSwitcher.tsx, AdminTable.tsx
- [ ] 8. PDF generation: PrintPDF component (jsPDF for A4 table matching form)
- [ ] 9. Styling: Table designs mimicking paper form, print CSS
- [ ] 10. Features: Auto-save, appNumber generation, search/filter, exports (CSV)
- [ ] 11. Seed data: Initial admin user and disabled settings
- [ ] 12. Install deps, run dev server
- [ ] 13. Test full flow

**Current Progress: Completed step 3. Next: Step 4 (API routes). Note: Please run `cd \"C:\\Users\\Elite\\Desktop\\recruitment-system\" && npm install` in PowerShell (enable && with `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` if needed) to install deps and fix TS errors. Update .env.local with your MongoDB Atlas URI. Confirm when ready.**

