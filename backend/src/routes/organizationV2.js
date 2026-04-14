import crypto from 'crypto';
import express from 'express';
import Organization from '../models/Organization.js';
import OrganizationMember from '../models/OrganizationMember.js';
import OrganizationInvite from '../models/OrganizationInvite.js';
import OrganizationPolicy from '../models/OrganizationPolicy.js';
import User from '../models/User.js';
import File from '../models/File.js';
import { protect } from '../middleware/auth.js';
import { sendEmail } from '../utils/sendEmail.js';

const router = express.Router();

// Middleware to check org membership and role
const checkOrgAccess = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    const member = await OrganizationMember.findOne({
      organization: orgId,
      user: req.userId,
      status: 'active',
    });

    if (!member) {
      return res.status(403).json({ message: 'You do not have access to this organization' });
    }

    req.member = member;
    req.orgId = orgId;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error checking org access' });
  }
};

const checkOrgRole = (allowedRoles) => async (req, res, next) => {
  if (!allowedRoles.includes(req.member.role)) {
    return res.status(403).json({ message: `This action requires ${allowedRoles.join(' or ')} role` });
  }
  next();
};

// Get all organizations for current user
router.get('/', protect, async (req, res) => {
  try {
    const members = await OrganizationMember.find({
      user: req.userId,
      status: { $in: ['active', 'suspended'] },
    }).populate('organization');

    const organizations = members.map((m) => ({
      ...m.organization.toObject(),
      role: m.role,
      status: m.status,
    }));

    res.status(200).json({ success: true, organizations });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ message: 'Server error fetching organizations' });
  }
});

// Get organization details
router.get('/:orgId', protect, checkOrgAccess, async (req, res) => {
  try {
    const org = await Organization.findById(req.orgId).populate('owner');
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.status(200).json({ success: true, organization: org });
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ message: 'Server error fetching organization' });
  }
});

// Create organization
router.post('/', protect, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Organization name is required' });
    }

    const organization = await Organization.create({
      name,
      description: description || '',
      owner: req.userId,
    });

    // Create organization member record for owner
    await OrganizationMember.create({
      organization: organization._id,
      user: req.userId,
      role: 'owner',
      status: 'active',
    });

    // Create organization policy
    await OrganizationPolicy.create({
      organization: organization._id,
    });

    // Add to user's organizations list
    await User.findByIdAndUpdate(req.userId, {
      $push: { organizations: organization._id },
      currentOrganization: organization._id,
    });

    res.status(201).json({ success: true, organization });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ message: 'Server error creating organization' });
  }
});

// Update organization profile (Name, Description, Logo)
router.put('/:orgId', protect, checkOrgAccess, checkOrgRole(['owner', 'admin']), async (req, res) => {
  try {
    const { name, description, logo } = req.body;
    const updated = {};

    if (name) updated.name = name;
    if (description !== undefined) updated.description = description;
    if (logo) updated.logo = logo;

    const org = await Organization.findByIdAndUpdate(req.orgId, updated, { new: true });

    res.status(200).json({ success: true, organization: org });
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ message: 'Server error updating organization' });
  }
});

// Get organization members
router.get('/:orgId/members', protect, checkOrgAccess, async (req, res) => {
  try {
    const members = await OrganizationMember.find({
      organization: req.orgId,
    }).populate('user', 'name email');

    res.status(200).json({ success: true, members });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ message: 'Server error fetching members' });
  }
});

// Invite member to organization
router.post('/:orgId/invite', protect, checkOrgAccess, checkOrgRole(['owner', 'admin']), async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const validRoles = ['admin', 'member', 'viewer'];
    if (!validRoles.includes(role || 'member')) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if user already exists in org
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const existingMember = await OrganizationMember.findOne({
        organization: req.orgId,
        user: existingUser._id,
      });

      if (existingMember) {
        return res.status(400).json({ message: 'User is already a member of this organization' });
      }
    }

    // Check if invite already exists
    const existingInvite = await OrganizationInvite.findOne({
      organization: req.orgId,
      email,
      status: 'pending',
    });

    if (existingInvite) {
      return res.status(400).json({ message: 'An invite has already been sent to this email' });
    }

    const inviteToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await OrganizationInvite.create({
      organization: req.orgId,
      email,
      role: role || 'member',
      invitedBy: req.userId,
      token: inviteToken,
      expiresAt,
    });

    // Send invite email
    const org = await Organization.findById(req.orgId);
    const inviteUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/accept-invite/${inviteToken}`;
    const message = `You have been invited to join the organization "${org.name}" on D's Cloud Space.\n\nClick the link below to accept the invite:\n${inviteUrl}\n\nThis link expires in 7 days.`;

    try {
      await sendEmail({
        email,
        subject: `Invite to join ${org.name} on D's Cloud Space`,
        message,
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
    }

    res.status(201).json({ success: true, invite });
  } catch (error) {
    console.error('Error inviting member:', error);
    res.status(500).json({ message: 'Server error inviting member' });
  }
});

// Accept organization invite
router.post('/invite/:token/accept', protect, async (req, res) => {
  try {
    const invite = await OrganizationInvite.findOne({
      token: req.params.token,
      status: 'pending',
      expiresAt: { $gt: Date.now() },
    });

    if (!invite) {
      return res.status(400).json({ message: 'Invalid or expired invite' });
    }

    const user = await User.findById(req.userId);
    if (user.email !== invite.email) {
      return res.status(403).json({ message: 'This invite is for a different email address' });
    }

    // Create member record
    const member = await OrganizationMember.create({
      organization: invite.organization,
      user: req.userId,
      role: invite.role,
      status: 'active',
    });

    // Add org to user's list
    await User.findByIdAndUpdate(req.userId, {
      $push: { organizations: invite.organization },
    });

    // Mark invite as accepted
    invite.status = 'accepted';
    await invite.save();

    res.status(200).json({ success: true, message: 'Invite accepted', member });
  } catch (error) {
    console.error('Error accepting invite:', error);
    res.status(500).json({ message: 'Server error accepting invite' });
  }
});

// Update member role
router.put('/:orgId/members/:memberId/role', protect, checkOrgAccess, checkOrgRole(['owner', 'admin']), async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['admin', 'member', 'viewer'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const member = await OrganizationMember.findByIdAndUpdate(
      req.params.memberId,
      { role },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.status(200).json({ success: true, member });
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ message: 'Server error updating member role' });
  }
});

// Suspend member
router.post('/:orgId/members/:memberId/suspend', protect, checkOrgAccess, checkOrgRole(['owner', 'admin']), async (req, res) => {
  try {
    const member = await OrganizationMember.findByIdAndUpdate(
      req.params.memberId,
      { status: 'suspended' },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.status(200).json({ success: true, member });
  } catch (error) {
    console.error('Error suspending member:', error);
    res.status(500).json({ message: 'Server error suspending member' });
  }
});

// Remove member
router.delete('/:orgId/members/:memberId', protect, checkOrgAccess, checkOrgRole(['owner', 'admin']), async (req, res) => {
  try {
    const member = await OrganizationMember.findById(req.params.memberId);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (member.role === 'owner') {
      return res.status(403).json({ message: 'Cannot remove organization owner' });
    }

    await OrganizationMember.findByIdAndDelete(req.params.memberId);

    // Remove org from user's list
    await User.findByIdAndUpdate(member.user, {
      $pull: { organizations: req.orgId },
    });

    res.status(200).json({ success: true, message: 'Member removed' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ message: 'Server error removing member' });
  }
});

// Transfer ownership
router.post('/:orgId/transfer-ownership', protect, checkOrgAccess, checkOrgRole(['owner']), async (req, res) => {
  try {
    const { newOwnerId } = req.body;

    if (!newOwnerId) {
      return res.status(400).json({ message: 'New owner ID is required' });
    }

    // Check if new owner is a member
    const newOwnerMember = await OrganizationMember.findOne({
      organization: req.orgId,
      user: newOwnerId,
    });

    if (!newOwnerMember) {
      return res.status(400).json({ message: 'New owner must be a member of the organization' });
    }

    // Update old owner role to admin
    const oldOwnerMember = req.member;
    oldOwnerMember.role = 'admin';
    await oldOwnerMember.save();

    // Update new owner role to owner
    newOwnerMember.role = 'owner';
    await newOwnerMember.save();

    // Update org owner
    const org = await Organization.findByIdAndUpdate(
      req.orgId,
      { owner: newOwnerId },
      { new: true }
    );

    res.status(200).json({ success: true, organization: org });
  } catch (error) {
    console.error('Error transferring ownership:', error);
    res.status(500).json({ message: 'Server error transferring ownership' });
  }
});

// Get organization storage usage
router.get('/:orgId/storage', protect, checkOrgAccess, async (req, res) => {
  try {
    const org = await Organization.findById(req.orgId);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Calculate storage used
    const files = await File.find({ organizationId: req.orgId });
    const storageUsed = files.reduce((acc, file) => acc + file.size, 0);

    res.status(200).json({
      success: true,
      storage: {
        used: storageUsed,
        quota: org.storageQuota,
        percentage: ((storageUsed / org.storageQuota) * 100).toFixed(2),
      },
    });
  } catch (error) {
    console.error('Error fetching storage:', error);
    res.status(500).json({ message: 'Server error fetching storage' });
  }
});

// Switch current organization
router.post('/:orgId/switch', protect, checkOrgAccess, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, {
      currentOrganization: req.orgId,
    });

    res.status(200).json({ success: true, message: 'Organization switched' });
  } catch (error) {
    console.error('Error switching organization:', error);
    res.status(500).json({ message: 'Server error switching organization' });
  }
});

// Get organization policies
router.get('/:orgId/policies', protect, checkOrgAccess, async (req, res) => {
  try {
    const policies = await OrganizationPolicy.findOne({ organization: req.orgId });

    res.status(200).json({ success: true, policies });
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ message: 'Server error fetching policies' });
  }
});

// Update organization policies
router.put('/:orgId/policies', protect, checkOrgAccess, checkOrgRole(['owner', 'admin']), async (req, res) => {
  try {
    const { twoFactorRequired, allowPublicSharing, allowDownloads, maxFileSize } = req.body;

    const policies = await OrganizationPolicy.findOneAndUpdate(
      { organization: req.orgId },
      {
        ...(twoFactorRequired !== undefined && { twoFactorRequired }),
        ...(allowPublicSharing !== undefined && { allowPublicSharing }),
        ...(allowDownloads !== undefined && { allowDownloads }),
        ...(maxFileSize !== undefined && { maxFileSize }),
      },
      { new: true }
    );

    res.status(200).json({ success: true, policies });
  } catch (error) {
    console.error('Error updating policies:', error);
    res.status(500).json({ message: 'Server error updating policies' });
  }
});

// Deactivate organization
router.post('/:orgId/deactivate', protect, checkOrgAccess, checkOrgRole(['owner']), async (req, res) => {
  try {
    const org = await Organization.findByIdAndUpdate(
      req.orgId,
      {
        status: 'suspended',
        deactivatedAt: new Date(),
      },
      { new: true }
    );

    // Suspend all members except owner
    await OrganizationMember.updateMany(
      {
        organization: req.orgId,
        role: { $ne: 'owner' },
      },
      { status: 'suspended' }
    );

    res.status(200).json({ success: true, message: 'Organization deactivated', organization: org });
  } catch (error) {
    console.error('Error deactivating organization:', error);
    res.status(500).json({ message: 'Server error deactivating organization' });
  }
});

// Reactivate organization
router.post('/:orgId/reactivate', protect, checkOrgAccess, checkOrgRole(['owner']), async (req, res) => {
  try {
    const org = await Organization.findByIdAndUpdate(
      req.orgId,
      {
        status: 'active',
        deactivatedAt: null,
      },
      { new: true }
    );

    // Reactivate all members
    await OrganizationMember.updateMany(
      { organization: req.orgId },
      { status: 'active' }
    );

    res.status(200).json({ success: true, message: 'Organization reactivated', organization: org });
  } catch (error) {
    console.error('Error reactivating organization:', error);
    res.status(500).json({ message: 'Server error reactivating organization' });
  }
});

export default router;
