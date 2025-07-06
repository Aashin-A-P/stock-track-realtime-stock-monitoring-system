"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSingleImage = exports.generateUserToken = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateUserToken = ({ user, privileges }) => {
    const secretKey = process.env.SECRET_KEY;
    return jsonwebtoken_1.default.sign({
        userId: user.userId,
        userName: user.userName,
        role: user.role,
        privileges,
    }, secretKey, {
        expiresIn: "30d",
    });
};
exports.generateUserToken = generateUserToken;
// Upload Image Starts
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});
// File Filter to Allow Only Images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extName = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    if (mimeType && extName) {
        cb(null, true);
    }
    else {
        cb(new Error("Only image files (jpeg, jpg, png) are allowed."));
    }
};
// Multer Configuration
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter,
});
// Utility function for single file upload
const uploadSingleImage = (fieldName) => {
    const uploadedRes = upload.single(fieldName);
    // console.log("Uploaded Res", uploadedRes);
    return uploadedRes;
};
exports.uploadSingleImage = uploadSingleImage;
