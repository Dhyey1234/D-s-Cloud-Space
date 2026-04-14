import mongoose from 'mongoose';

const organizationPolicySchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      unique: true,
    },
    twoFactorRequired: {
      type: Boolean,
      default: false,
    },
    allowPublicSharing: {
      type: Boolean,
      default: true,
    },
    allowDownloads: {
      type: Boolean,
      default: true,
    },
    maxFileSize: {
      type: Number,
      default: 10 * 1024 * 1024, // 10MB
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const OrganizationPolicy = mongoose.model('OrganizationPolicy', organizationPolicySchema);

export default OrganizationPolicy;
