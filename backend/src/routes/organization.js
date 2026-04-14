import express from 'express';
import Organization from '../models/Organization.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Create a new organization and attach it to the user
router.post('/', protect, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Organization name is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.organization) {
      return res.status(400).json({ message: 'User already belongs to an organization' });
    }

    const organization = await Organization.create({
      name,
      owner: req.userId,
      members: [req.userId],
    });

    user.organization = organization._id;
    await user.save();

    res.status(201).json({ success: true, organization });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ message: 'Server error creating organization' });
  }
});

// Get the current user's organization
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('organization');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ success: true, organization: user.organization || null });
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ message: 'Server error fetching organization' });
  }
});

export default router;
