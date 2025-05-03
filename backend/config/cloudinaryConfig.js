// backend/config/cloudinaryConfig.js

import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { CloudinaryStorage } from "multer-storage-cloudinary";

dotenv.config();

const configureCloudinary = () => {
  try {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.warn(
        "Cloudinary environment variables not fully set. Uploads may fail."
      );
      return;
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    console.log("Cloudinary SDK configured successfully.");
  } catch (error) {
    console.error("Error configuring Cloudinary SDK:", error);
  }
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: (req, file) => {
      const type = req.uploadType || "general";
      const id = req.params.id || req.body.id || "unknown";

      console.log(
        `Determining folder for: type=${type}, id=${id}, fieldname=${file.fieldname}`
      );

      if (file.fieldname === "image") {
        console.log(`--> Folder: tingitingi_rentals/frontpage_logos`);
        return `tingitingi_rentals/frontpage_logos`;
      } else if (file.fieldname === "images") {
        const targetFolder = `tingitingi_rentals/${type}s/${id}`;
        console.log(`--> Folder: ${targetFolder}`);
        return targetFolder;
      }
      const fallbackFolder = `tingitingi_rentals/uncategorized/${id}`;
      console.log(`--> Folder (fallback): ${fallbackFolder}`);
      return fallbackFolder;
    },
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

export { cloudinary, configureCloudinary, storage };
