import { Request } from "express";
import multer, { StorageEngine, FileFilterCallback } from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

export type User = {
  userId: number;
  userName: string;
  role: string | null;
  password: string;
  createdAt: Date | null;
};

export type TokenData = {
  user: User;
  privileges: String[];
};

export const generateUserToken = ({ user, privileges }: TokenData) => {
  const secretKey: string = process.env.SECRET_KEY!;
  return jwt.sign(
    {
      userId: user.userId,
      userName: user.userName,
      role: user.role,
      privileges,
    },
    secretKey,
    {
      expiresIn: "30d",
    }
  );
};

// Upload Image Starts
const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File Filter to Allow Only Images
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimeType && extName) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png) are allowed."));
  }
};

// Multer Configuration
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter,
});

// Utility function for single file upload
export const uploadSingleImage = (fieldName: string) => {
  return upload.single(fieldName);
};
