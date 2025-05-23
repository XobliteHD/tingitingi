import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import {
  storage as cloudinaryStorage,
  cloudinary,
} from "../config/cloudinaryConfig.js";
import Other from "../models/Other.js";

const router = express.Router();

const DEFAULT_IMAGE_URL =
  "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746197697/placeholder_k2h20u_ddn2kf.png";

const upload = multer({ storage: cloudinaryStorage });

router.get("/", async (req, res) => {
  try {
    const others = await Other.find({}).sort({ _id: 1 });
    res.status(200).json(others);
  } catch (error) {
    console.error("Admin: Error fetching others:", error);
    res.status(500).json({ message: "Server error fetching others" });
  }
});

router.get("/:id", async (req, res) => {
  const otherId = req.params.id;
  try {
    const other = await Other.findById(otherId);
    if (!other)
      return res.status(404).json({ message: "Other item not found" });
    res.status(200).json(other);
  } catch (error) {
    console.error(`Admin: Error fetching other ${otherId}:`, error);
    res
      .status(500)
      .json({ message: "Server error fetching other item details" });
  }
});

router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 20 },
  ]),
  async (req, res) => {
    console.log("Admin Create Other Request Body:", req.body);
    console.log("Admin Create Other Request Files:", req.files);

    const {
      id,
      name,
      shortDescription_fr,
      shortDescription_en,
      longDescription_fr,
      longDescription_en,
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
    const unavailableValue =
      req.body.isManuallyUnavailable === "true" ||
      req.body.isManuallyUnavailable === true;
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || value.trim() === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      if (req.files?.image?.[0]?.filename)
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
      const existingOther = await Other.findById(id);
      if (existingOther) {
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
        return res.status(400).json({
          message: `Other item with ID (slug) '${id}' already exists.`,
        });
      }

      const mainImagePath = req.files?.image?.[0]?.path;
      const galleryImagePaths = req.files?.images?.map((f) => f.path) || [];

      const newOtherData = {
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
      };

      const newOther = new Other(newOtherData);
      const savedOther = await newOther.save();

      console.log("Other item created successfully:", savedOther._id);
      res.status(201).json(savedOther);
    } catch (error) {
      console.error("Admin: Error creating other item:", error);
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
      res.status(500).json({ message: "Server error creating other item" });
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
    const otherId = req.params.id;
    const {
      name,
      shortDescription_fr,
      shortDescription_en,
      longDescription_fr,
      longDescription_en,
      imagesToDelete,
      isManuallyUnavailable,
    } = req.body;
    const unavailableValue =
      req.body.isManuallyUnavailable === "true" ||
      req.body.isManuallyUnavailable === true;
    console.log(`Admin Updating other item ${otherId}`);
    console.log("Update Body:", req.body);
    console.log("Update Files:", req.files);

    try {
      const otherToUpdate = await Other.findById(otherId);
      if (!otherToUpdate) {
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
        return res.status(404).json({ message: "Other item not found" });
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

      if (req.files?.image?.[0]) {
        const newImageData = req.files.image[0];
        if (otherToUpdate.image && otherToUpdate.image !== DEFAULT_IMAGE_URL) {
          const oldPublicId = extractPublicId(otherToUpdate.image);
          if (oldPublicId) {
            console.log(
              `Deleting old main image (non-default): ${oldPublicId}`
            );
            await cloudinary.uploader
              .destroy(oldPublicId)
              .catch((e) =>
                console.error("Failed to delete old main image:", e)
              );
          }
        }
        updateFields.image = newImageData.path;
      }

      let currentImages = [...otherToUpdate.images];

      let urlsToDelete = [];
      if (imagesToDelete) {
        console.log("Raw imagesToDelete received for Other:", imagesToDelete);
        try {
          urlsToDelete = JSON.parse(imagesToDelete);
          if (!Array.isArray(urlsToDelete)) {
            console.warn("Parsed imagesToDelete is not an array, ignoring.");
            urlsToDelete = [];
          }
          console.log("Parsed urlsToDelete for Other:", urlsToDelete);
        } catch (parseError) {
          console.error(
            "Error parsing imagesToDelete JSON for Other:",
            parseError
          );
          urlsToDelete = [];
        }
      }

      if (urlsToDelete.length > 0) {
        const publicIdsToDeleteFromGallery = urlsToDelete
          .map(extractPublicId)
          .filter((id) => id);

        console.log(
          "Extracted Public IDs to Delete for Other:",
          publicIdsToDeleteFromGallery
        );

        if (publicIdsToDeleteFromGallery.length > 0) {
          console.log(
            "Attempting to delete Other gallery from Cloudinary:",
            publicIdsToDeleteFromGallery
          );
          try {
            const deleteResult = await cloudinary.api.delete_resources(
              publicIdsToDeleteFromGallery,
              { type: "upload", resource_type: "image" }
            );
            console.log(
              "Cloudinary delete result for Other gallery:",
              deleteResult
            );
          } catch (cloudinaryError) {
            console.error(
              "Failed to delete specific gallery images from Cloudinary for Other:",
              cloudinaryError
            );
          }
        } else {
          console.log(
            "No valid public IDs extracted from urlsToDelete for Other."
          );
        }

        currentImages = currentImages.filter(
          (imgUrl) => !urlsToDelete.includes(imgUrl)
        );
        console.log(
          "Filtered Other image array after deletions:",
          currentImages
        );
      } else {
        console.log("No Other images marked for deletion.");
      }

      const newGalleryImageFiles = req.files?.images || [];
      if (newGalleryImageFiles.length > 0) {
        const newGalleryPaths = newGalleryImageFiles.map((f) => f.path);
        currentImages = [...currentImages, ...newGalleryPaths];
      }
      if (
        JSON.stringify(currentImages) !== JSON.stringify(otherToUpdate.images)
      ) {
        updateFields.images = currentImages;
      }

      otherToUpdate.set(updateFields);
      const updatedOther = await otherToUpdate.save();

      console.log(`Other item ${otherId} updated successfully.`);
      res.status(200).json(updatedOther);
    } catch (error) {
      console.error(`Admin: Error updating other item ${otherId}:`, error);
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
      res.status(500).json({ message: "Server error updating other item" });
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
  const otherId = req.params.id;
  console.log(`Admin Deleting other item ${otherId}`);
  try {
    const otherToDelete = await Other.findById(otherId);
    if (!otherToDelete)
      return res.status(404).json({ message: "Other item not found" });

    const publicIdsToDelete = [];
    if (otherToDelete.image && otherToDelete.image !== DEFAULT_IMAGE_URL) {
      const mainPublicId = extractPublicId(otherToDelete.image);
      if (mainPublicId) publicIdsToDelete.push(mainPublicId);
    }
    if (otherToDelete.images && otherToDelete.images.length > 0) {
      otherToDelete.images.forEach((imgUrl) => {
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
          console.error("Cloudinary deletion error during other delete:", e)
        );
    } else {
      console.log(
        "No user-uploaded Cloudinary resources to delete for this item."
      );
    }

    await Other.findByIdAndDelete(otherId);

    const folderPath = `tingitingi_rentals/others/${otherId}`;
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

    console.log(`Other item ${otherId} deleted successfully.`);
    res
      .status(200)
      .json({ message: `Other item ${otherId} deleted successfully.` });
  } catch (error) {
    console.error(`Admin: Error deleting other item ${otherId}:`, error);
    res.status(500).json({ message: "Server error deleting other item" });
  }
});

export default router;
