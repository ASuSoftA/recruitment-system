import mongoose, { Schema, models } from 'mongoose';

const ApplicationSchema = new Schema({
  name: { type: String, required: true },
  gender: { type: String, required: true },
  age: { type: Number, required: true },
  birthPlace: String,
  birthDate: String,
  relativeName: String,
  phone: { type: String, required: true },
  email: String,
  idType: String,
  idNumber: { type: String, required: true },
  currentAddress: { type: String, required: true },
  nonRelativeName: String,
  nonRelativePhone: String,
  qualifications: Array,
  courses: Array,
  computerSkills: Array,
  languages: Array,
  experiences: Array,
  cvFile: String,
  degreeFile: String,
  idFile: String,
  applicationNumber: { type: String, unique: true },
  status: { type: String, default: 'pending' },
  submittedAt: { type: Date, default: Date.now },
});

// IMPORTANT: استخدمي هذا الشكل بالضبط - بدون next()
ApplicationSchema.pre('save', async function() {
  if (!this.applicationNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.applicationNumber = `APP-${year}-${random}`;
  }
});

export default models.Application || mongoose.model('Application', ApplicationSchema);