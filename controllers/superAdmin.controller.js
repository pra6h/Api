// backend/controllers/superAdmin.controller.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { Job } from '../models/job.model.js';
import { Application } from '../models/application.model.js';

export const superAdminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const superAdmin = await User.findOne({ email, role: 'superadmin' });

    if (!superAdmin) {
      return res.status(404).json({ success: false, message: 'Super Admin not found!' });
    }

    const isMatch = await bcrypt.compare(password, superAdmin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials!' });
    }

    const token = jwt.sign(
      { id: superAdmin._id, role: superAdmin.role },
      process.env.SECRET_KEY,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }).status(200).json({
      success: true,
      message: 'Super Admin logged in successfully!',
      user: {
        id: superAdmin._id,
        fullName: superAdmin.fullName,
        email: superAdmin.email,
        role: superAdmin.role,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getSuperAdminStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalApplications = await Application.countDocuments();
    const totalRecruiter = await User.countDocuments({role: 'recruiter'})

    res.status(200).json({
      success: true,
      stats: {
        totalJobs,
        totalStudents,
        totalApplications,
        totalRecruiter
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};
// Get all unapproved recruiters
export const getPendingRecruiters = async (req, res) => {
  try {
    const pendingRecruiters = await User.find({ role: 'recruiter', isApproved: false }).select('-password');
    res.status(200).json({ success: true, recruiters: pendingRecruiters });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch pending recruiters' });
  }
};

// Approve recruiter
export const approveRecruiter = async (req, res) => {
  const { id } = req.params;
  try {
    const recruiter = await User.findById(id);

    if (!recruiter || recruiter.role !== 'recruiter') {
      return res.status(404).json({ success: false, message: 'Recruiter not found' });
    }

    recruiter.isApproved = true;
    await recruiter.save();

    res.status(200).json({ success: true, message: 'Recruiter approved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to approve recruiter' });
  }
};

// (Optional) Reject recruiter (delete user)
export const rejectRecruiter = async (req, res) => {
  const { id } = req.params;
  try {
    const recruiter = await User.findById(id);

    if (!recruiter || recruiter.role !== 'recruiter') {
      return res.status(404).json({ success: false, message: 'Recruiter not found' });
    }

    await recruiter.deleteOne();
    res.status(200).json({ success: true, message: 'Recruiter rejected and deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to reject recruiter' });
  }
};

