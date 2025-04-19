import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      password,
      role,
      college,
      degree,
      graduationYear,
      skills,
      
    } = req.body;
    console.log("✅ req.body:", req.body);

    if (!fullName || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      });
    }

    if (role !== "recruiter" && role !== "student") {
      return res.status(400).json({
        message: "Invalid role provided",
        success: false,
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists with this email.",
        success: false,
      });
    }
    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const profileFile = req.files?.profilePicture?.[0];
    if (!profileFile) {
      return res.status(400).json({
        message: "Profile picture is required.",
        success: false,
      });
    }
    const profileUri = getDataUri(profileFile);
    const profileCloud = await cloudinary.uploader.upload(profileUri.content);

    // Resume (optional)
    let resumeUrl = "";
    if (role === "student" && req.files?.resume?.[0]) {
      const resumeFile = req.files.resume[0];
      const resumeUri = getDataUri(resumeFile);
      const resumeCloud = await cloudinary.uploader.upload(resumeUri.content);
      resumeUrl = resumeCloud.secure_url;
    } 
    // 🟢 Define base fields
const commonFields = {
  fullName,
  email,
  phoneNumber,
  password: hashedPassword,
  role,
  profile: {
    profilePhoto: profileCloud.secure_url,
  },
};

// 🟢 Add student-only fields
if (role === "student") {
  commonFields.college = college;
  commonFields.degree = degree;
  commonFields.graduationYear = graduationYear;
  commonFields.profile.resume = resumeUrl;
  commonFields.profile.skills = skills?.split(",").map((s) => s.trim());
}
  
    const newUser = await User.create(commonFields);   
    

    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      });
    }
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Incorrect email or password.",
        success: false,
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Incorrect email or password.",
        success: false,
      });
    }

    if (user.role === "recruiter" && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your account is pending approval by Super Admin.",
      });
    }

    // check role is correct or not
    if (role !== user.role) {
      return res.status(400).json({
        message: "Account doesn't exist with current role.",
        success: false,
      });
    }

    const tokenData = {
      userId: user._id,
      role: user.role,
    };

    const token = await jwt.sign(tokenData, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    user = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      college: user.college,
      degree: user.degree,
      graduationYear: user.graduationYear,
      profile: user.profile,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
      })
      .json({
        message: `Welcome back ${user.fullName}`,
        user,
        success: true,
      });
  } catch (error) {
    console.log(error);
  }
};
export const logout = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      bio,
      skills,
      college,
      degree,
      graduationYear,
    } = req.body;

    const resumeFile = req.files?.resume?.[0];
    // cloudinary ayega idhar
    let cloudResponse;
    if (resumeFile) {
      const fileUri = getDataUri(resumeFile);
      cloudResponse = await cloudinary.uploader.upload(fileUri.content);
    }

    let skillsArray;
    if (skills) {
      skillsArray = skills.split(",");
    }
    const userId = req.id; // middleware authentication

    let user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        message: "User not found.",
        success: false,
      });
    }
    // updating data
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skills) user.profile.skills = skillsArray;
    // Update student-specific fields
    if (college) user.college = college;
    if (degree) user.degree = degree;
    if (graduationYear) user.graduationYear = graduationYear;

    // resume comes later here...
    if (cloudResponse) {
      user.profile.resume = cloudResponse.secure_url; // save the cloudinary url
      user.profile.resumeOriginalName = resumeFile.originalname; // save the original file name
    }

    await user.save();

    user = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      college: user.college,
      degree: user.degree,
      graduationYear: user.graduationYear,
      profile: user.profile,
    };

    return res.status(200).json({
      message: "Profile updated successfully.",
      user,
      success: true,
    });
  } catch (error) {
    console.log("Error in updateProfile:", error); // Full error log
  }
};
