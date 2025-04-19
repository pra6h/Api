import multer from "multer";

const storage = multer.memoryStorage();

export const singleUpload = multer({ storage }).single("file");

export const multiFieldUpload = multer({ storage }).fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "resume", maxCount: 1 },
  { name: "companyLogo", maxCount: 1 }, // company logo for recruiters
]);
