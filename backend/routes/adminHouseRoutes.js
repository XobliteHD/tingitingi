// backend/routes/adminHouseRoutes.js
import express from "express";
import mongoose from "mongoose";
const DEFAULT_IMAGE_URL =
  "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746197697/placeholder_k2h20u_ddn2kf.png";
import multer from "multer";
import {
  storage as cloudinaryStorage,
  cloudinary,
} from "../config/cloudinaryConfig.js";
import House from "../models/House.js";

const router = express.Router();

const upload = multer({ storage: cloudinaryStorage });

router.get("/", async (req, res) => {
  try {
    const houses = await House.find({}).sort({ _id: 1 });
    res.status(200).json(houses);
  } catch (error) {
    console.error("Admin: Error fetching houses:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  const houseId = req.params.id;
  try {
    const house = await House.findById(houseId);
    if (!house) return res.status(404).json({ message: "House not found" });
    res.status(200).json(house);
  } catch (error) {
    console.error(`Admin: Error fetching house ${houseId}:`, error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 20 },
  ]),
  async (req, res) => {
    console.log("Request Body:", req.body);
    console.log("Request Files:", req.files);

    const {
      id,
      name,
      shortDescription_fr,
      shortDescription_en,
      longDescription_fr,
      longDescription_en,
      capacity,
      isManuallyUnavailable,
    } = req.body;

    const requiredFields = {
      id,
      name,
      shortDescription_fr,
      shortDescription_en,
      longDescription_fr,
      longDescription_en,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || value.trim() === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      if (req.files?.image?.[0]?.path)
        await cloudinary.uploader
          .destroy(req.files.image[0].filename)
          .catch((e) => console.error("Cloudinary cleanup error (image):", e));
      req.files?.images?.forEach(
        async (f) =>
          await cloudinary.uploader
            .destroy(f.filename)
            .catch((e) =>
              console.error("Cloudinary cleanup error (images):", e)
            )
      );

      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    try {
      const existingHouse = await House.findById(id);
      if (existingHouse) {
        if (req.files?.image?.[0]?.path)
          await cloudinary.uploader.destroy(req.files.image[0].filename);
        req.files?.images?.forEach(
          async (f) =>
            await cloudinary.uploader
              .destroy(f.filename)
              .catch((e) =>
                console.error("Cloudinary cleanup error (images):", e)
              )
        );
        return res
          .status(400)
          .json({ message: `House with ID (slug) '${id}' already exists.` });
      }

      const mainImageUpload = req.files?.image?.[0];
      const mainImagePath = req.files?.image?.[0]?.path;
      const galleryImagePaths = req.files?.images?.map((f) => f.path) || [];
      const galleryImageFilenames =
        req.files?.images?.map((f) => f.filename) || [];

      const newHouseData = {
        _id: id,
        name: name.trim(),
        shortDescription: {
          fr: shortDescription_fr.trim(),
          en: shortDescription_en.trim(),
        },
        longDescription: {
          fr: longDescription_fr.trim(),
          en: longDescription_en.trim(),
        },
        image: mainImagePath,
        images: galleryImagePaths,
        isManuallyUnavailable:
          isManuallyUnavailable === "true" || isManuallyUnavailable === true,
        ...(capacity &&
          !isNaN(parseInt(capacity)) &&
          parseInt(capacity) > 0 && { capacity: parseInt(capacity) }),
      };

      const newHouse = new House(newHouseData);
      const savedHouse = await newHouse.save();

      console.log("House created successfully:", savedHouse._id);
      res.status(201).json(savedHouse);
    } catch (error) {
      console.error("Admin: Error creating house:", error);
      if (req.files?.image?.[0]?.filename)
        await cloudinary.uploader
          .destroy(req.files.image[0].filename)
          .catch((e) =>
            console.error("Cloudinary error cleanup failed (image):", e)
          );
      req.files?.images?.forEach(
        async (f) =>
          await cloudinary.uploader
            .destroy(f.filename)
            .catch((e) =>
              console.error("Cloudinary error cleanup failed (images):", e)
            )
      );

      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((val) => val.message);
        return res
          .status(400)
          .json({ message: "Validation failed", errors: messages });
      }
      res.status(500).json({ message: "Server error creating house" });
    }
  }
);

router.put(
  "/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 20 },
  ]),
  async (req, res) => {
    const houseId = req.params.id;
    const {
      name,
      shortDescription_fr,
      shortDescription_en,
      longDescription_fr,
      longDescription_en,
      capacity,
      imagesToDelete,
      isManuallyUnavailable,
    } = req.body;

    console.log(`Updating house ${houseId}`);
    console.log("Update Body:", req.body);
    console.log("Update Files:", req.files);

    try {
      const houseToUpdate = await House.findById(houseId);
      if (!houseToUpdate) {
        if (req.files?.image?.[0]?.filename)
          await cloudinary.uploader
            .destroy(req.files.image[0].filename)
            .catch((e) =>
              console.error("Cloudinary cleanup error (image):", e)
            );
        req.files?.images?.forEach(
          async (f) =>
            await cloudinary.uploader
              .destroy(f.filename)
              .catch((e) =>
                console.error("Cloudinary cleanup error (images):", e)
              )
        );
        return res.status(404).json({ message: "House not found" });
      }

      const updateFields = {};
      if (name !== undefined && name.trim() !== "")
        updateFields.name = name.trim();
      if (
        shortDescription_fr !== undefined &&
        shortDescription_fr.trim() !== ""
      )
        updateFields["shortDescription.fr"] = shortDescription_fr.trim();
      if (
        shortDescription_en !== undefined &&
        shortDescription_en.trim() !== ""
      )
        updateFields["shortDescription.en"] = shortDescription_en.trim();
      if (longDescription_fr !== undefined && longDescription_fr.trim() !== "")
        updateFields["longDescription.fr"] = longDescription_fr.trim();
      if (longDescription_en !== undefined && longDescription_en.trim() !== "")
        updateFields["longDescription.en"] = longDescription_en.trim();

      if (isManuallyUnavailable !== undefined) {
        updateFields.isManuallyUnavailable =
          isManuallyUnavailable === "true" || isManuallyUnavailable === true;
      }
      if (capacity !== undefined) {
        const capInt = parseInt(capacity);
        if (!isNaN(capInt) && capInt > 0) {
          updateFields.capacity = capInt;
        } else if (capacity === "" || capacity === null) {
          updateFields.capacity = null;
        }
      }

      if (req.files?.image?.[0]) {
        const newImageData = req.files.image[0];

        if (houseToUpdate.image && houseToUpdate.image !== DEFAULT_IMAGE_URL) {
          const oldPublicId = extractPublicId(houseToUpdate.image);
          if (oldPublicId) {
            console.log(`Deleting old main image: ${oldPublicId}`);
            await cloudinary.uploader
              .destroy(oldPublicId)
              .catch((e) =>
                console.error("Failed to delete old main image:", e)
              );
          }
        }
        updateFields.image = newImageData.path;
      }

      let currentImages = [...houseToUpdate.images];
      /**/
      let urlsToDelete = [];
      if (imagesToDelete) {
        // Check if the field was sent
        console.log("Raw imagesToDelete received:", imagesToDelete);
        try {
          urlsToDelete = JSON.parse(imagesToDelete); // Parse JSON string
          if (!Array.isArray(urlsToDelete)) {
            console.warn("Parsed imagesToDelete is not an array, ignoring.");
            urlsToDelete = [];
          }
          console.log("Parsed urlsToDelete:", urlsToDelete);
        } catch (parseError) {
          console.error("Error parsing imagesToDelete JSON:", parseError);
          urlsToDelete = [];
        }
      }

      if (urlsToDelete.length > 0) {
        const publicIdsToDeleteFromGallery = urlsToDelete
          .map(extractPublicId)
          .filter((id) => id);

        console.log(
          "Extracted Public IDs to Delete:",
          publicIdsToDeleteFromGallery
        );

        if (publicIdsToDeleteFromGallery.length > 0) {
          console.log(
            "Attempting to delete from Cloudinary:",
            publicIdsToDeleteFromGallery
          );
          try {
            const deleteResult = await cloudinary.api.delete_resources(
              publicIdsToDeleteFromGallery,
              { type: "upload", resource_type: "image" }
            );
            console.log("Cloudinary delete result:", deleteResult);
          } catch (cloudinaryError) {
            console.error(
              "Failed to delete specific gallery images from Cloudinary:",
              cloudinaryError
            );
          }
        } else {
          console.log("No valid public IDs extracted from urlsToDelete.");
        }

        currentImages = currentImages.filter(
          (imgUrl) => !urlsToDelete.includes(imgUrl)
        );
        console.log("Filtered image array after deletions:", currentImages);
      } else {
        console.log("No images marked for deletion.");
      }
      const newGalleryImageFiles = req.files?.images || [];
      if (newGalleryImageFiles.length > 0) {
        const newGalleryPaths = newGalleryImageFiles.map((f) => f.path);
        currentImages = [...currentImages, ...newGalleryPaths];
      }
      if (
        JSON.stringify(currentImages) !== JSON.stringify(houseToUpdate.images)
      ) {
        updateFields.images = currentImages;
      }

      houseToUpdate.set(updateFields);
      const updatedHouse = await houseToUpdate.save();

      console.log(`House ${houseId} updated successfully.`);
      res.status(200).json(updatedHouse);
    } catch (error) {
      console.error(`Admin: Error updating house ${houseId}:`, error);
      if (req.files?.image?.[0]?.filename)
        await cloudinary.uploader
          .destroy(req.files.image[0].filename)
          .catch((e) =>
            console.error("Cloudinary error cleanup failed (image):", e)
          );
      req.files?.images?.forEach(
        async (f) =>
          await cloudinary.uploader
            .destroy(f.filename)
            .catch((e) =>
              console.error("Cloudinary error cleanup failed (images):", e)
            )
      );
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((val) => val.message);
        return res
          .status(400)
          .json({ message: "Validation failed", errors: messages });
      }
      res.status(500).json({ message: "Server error updating house" });
    }
  }
);

function extractPublicId(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") return null;
  try {
    const urlParts = imageUrl.split("/");
    const uploadIndex = urlParts.indexOf("upload");
    if (uploadIndex === -1 || uploadIndex + 2 >= urlParts.length) return null;
    const pathWithExtension = urlParts.slice(uploadIndex + 2).join("/");
    const publicIdWithFolder = pathWithExtension.substring(
      0,
      pathWithExtension.lastIndexOf(".")
    );
    return publicIdWithFolder || null;
  } catch (e) {
    console.error("Error extracting public ID from", imageUrl, e);
    return null;
  }
}

router.delete("/:id", async (req, res) => {
  const houseId = req.params.id;
  console.log(`Admin Deleting house ${houseId}`);
  try {
    const houseToDelete = await House.findById(houseId);
    if (!houseToDelete)
      return res.status(404).json({ message: "House not found" });

    const publicIdsToDelete = [];

    if (houseToDelete.image && houseToDelete.image !== DEFAULT_IMAGE_URL) {
      const mainPublicId = extractPublicId(houseToDelete.image);
      if (mainPublicId) publicIdsToDelete.push(mainPublicId);
    }
    if (houseToDelete.images && houseToDelete.images.length > 0) {
      houseToDelete.images.forEach((imgUrl) => {
        const galleryPublicId = extractPublicId(imgUrl);
        if (galleryPublicId) publicIdsToDelete.push(galleryPublicId);
      });
    }
    if (publicIdsToDelete.length > 0) {
      console.log("Deleting Cloudinary resources:", publicIdsToDelete);
      await cloudinary.api
        .delete_resources(publicIdsToDelete, {
          type: "upload",
          resource_type: "image",
        })
        .catch((e) =>
          console.error("Cloudinary deletion error during house delete:", e)
        );
    }
    await House.findByIdAndDelete(houseId);

    const folderPath = `tingitingi_rentals/houses/${houseId}`;
    console.log(`Attempting to delete Cloudinary folder: ${folderPath}`);
    try {
      const folderDeleteResult = await cloudinary.api.delete_folder(folderPath);
      console.log(
        `Cloudinary folder deletion result for ${folderPath}:`,
        folderDeleteResult
      );
    } catch (folderError) {
      console.warn(
        `Could not delete Cloudinary folder ${folderPath}. It might not be empty or might not exist. Error:`,
        folderError.message || folderError
      );
    }

    console.log(`House ${houseId} deleted successfully.`);
    res.status(200).json({ message: `House ${houseId} deleted successfully.` });
  } catch (error) {
    console.error(`Admin: Error deleting house ${houseId}:`, error);
    res.status(500).json({ message: "Server error deleting house" });
  }
});

export default router;
