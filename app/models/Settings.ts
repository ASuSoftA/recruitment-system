import mongoose, { Schema, models } from 'mongoose';

const SettingsSchema = new Schema({
  applyEnabled: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now },
});

export default models.Settings || mongoose.model('Settings', SettingsSchema);

