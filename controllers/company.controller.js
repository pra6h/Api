import { Company } from "../models/company.model.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "../utils/cloudinary.js";


// Register a company
export const registerCompany = async (req, res) => {
  try {
    const { companyName } = req.body;

    if (!companyName) {
      return res.status(400).json({
        message: "Company name is required.",
        success: false,
      });
    }

    const existingCompany = await Company.findOne({ createdBy: req.id });
    if (existingCompany) {
      return res.status(400).json({
        message: "You can only register one company.",
        success: false,
      });
    }

    const nameExists = await Company.findOne({ name: companyName });
    if (nameExists) {
      return res.status(400).json({
        message: "A company with this name already exists.",
        success: false,
      });
    }

    const company = await Company.create({
      name: companyName,
      createdBy: req.id,
    });

    return res.status(201).json({
      message: "Company registered successfully.",
      company,
      success: true,
    });
  } catch (error) {
    console.error("Error registering company:", error);
    return res.status(500).json({
      message: "Server error.",
      success: false,
    });
  }
};

// Get company for the logged-in recruiter
export const getCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ createdBy: req.id });
     return res.status(404).json({
        success: false,
        company: company || null, // ⚡ Always send a company key (even if null)
      });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error.",
      success: false,
    });
  }
};

// Get company by ID (only if created by the user)
export const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findOne({ _id: companyId, createdBy: req.id });

    if (!company) {
      return res.status(404).json({
        message: "Company not found or you don't have permission.",
        success: false,
      });
    }

    return res.status(200).json({
      company,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error.",
      success: false,
    });
  }
};

// Update a company
export const updateCompany = async (req, res) => {
  try {
    const { name, description, website, location } = req.body;
    const file = req.file;

    let updateData = { name, description, website, location };

    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      updateData.logo = cloudResponse.secure_url;
    }

    const company = await Company.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.id },
      updateData,
      { new: true }
    );

    if (!company) {
      return res.status(404).json({
        message: "Company not found or you don't have permission.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Company information updated.",
      success: true,
      company,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error.",
      success: false,
    });
  }
};

// Delete a company
export const deleteCompany = async (req, res) => {
  try {
    const deletedCompany = await Company.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.id,
    });

    if (!deletedCompany) {
      return res.status(404).json({
        message: "Company not found or you don't have permission.",
        success: false,
      });
    }

    res.status(200).json({
      message: "Company deleted successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};