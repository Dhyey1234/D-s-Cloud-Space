import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import fileRoutes from './routes/files.js';
import organizationRoutes from './routes/organizationV2.js';
import Organization from './models/Organization.js';
import OrganizationMember from './models/OrganizationMember.js';
import User from './models/User.js';

// Load env variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ds-cloudspace')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/orgs', organizationRoutes);

// Soft delete organizations deactivated for 90+ days
const softDeleteOldOrganizations = async () => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const oldOrgs = await Organization.find({
      status: 'suspended',
      deactivatedAt: { $lt: ninetyDaysAgo },
    });

    for (const org of oldOrgs) {
      console.log(`Soft deleting organization: ${org.name} (${org._id})`);

      // Remove all members
      await OrganizationMember.deleteMany({ organization: org._id });

      // Remove org from all users
      await User.updateMany(
        { organizations: org._id },
        { $pull: { organizations: org._id } }
      );

      // Soft delete the organization (mark as deleted)
      await Organization.findByIdAndUpdate(org._id, {
        status: 'deleted',
        deletedAt: new Date(),
      });
    }

    if (oldOrgs.length > 0) {
      console.log(`Soft deleted ${oldOrgs.length} organizations`);
    }
  } catch (error) {
    console.error('Error in soft delete job:', error);
  }
};

// Run soft delete job every 24 hours
setInterval(softDeleteOldOrganizations, 24 * 60 * 60 * 1000);

// Run once on startup
setTimeout(softDeleteOldOrganizations, 5000);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// ✅ DEV SERVER PORT MATCHING VITE PROXY
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});