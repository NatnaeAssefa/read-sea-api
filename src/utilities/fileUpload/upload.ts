import multer from "multer";
import path from "path";
import fs from "fs";

/**
 * Valid Image Mime Types
 */
const MimeTypes = ["image/png", "image/jpg", "image/jpeg"];

// Ensure upload directories exist
const ensureDirectoryExists = (directory: string) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// Create necessary directories
ensureDirectoryExists("uploads/");
ensureDirectoryExists("profiles/");

const profile_upload = multer({
  fileFilter: (req: any, file: any, callback: Function) => {
    if (MimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error("Invalid image type, Only png, jpg or jpeg allowed"));
    }
  },
  storage: multer.diskStorage({
    destination: (req: any, file: any, cb: Function) => {
      cb(null, "profiles/");
    },
    filename: (req: any, file: any, cb: Function) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
      );
    },
  }),
});

const file_upload = multer({
  // fileFilter: (req: any, file: any, callback: Function) => {
  //   if (MimeTypes.includes(file.mimetype)) {
  //     callback(null, true);
  //   } else {
  //     callback(new Error("Invalid image type, Only png, jpg or jpeg allowed"));
  //   }
  // },
  storage: multer.diskStorage({
    destination: (req: any, file: any, cb: Function) => {
      cb(null, "uploads/");
    },
    filename: (req: any, file: any, cb: Function) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
      );
    },
  }),
});

export { profile_upload, file_upload };
