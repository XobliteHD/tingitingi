import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import {
  storage as cloudinaryStorage,
  cloudinary,
} from "../config/cloudinaryConfig.js";
import Space from "../models/Space.js";

const router = express.Router();

const DEFAULT_IMAGE_URL =
  "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746197697/placeholder_k2h20u_ddn2kf.png";

const upload = multer({ storage: cloudinaryStorage });

router.get("/", async (req, res) => {
  try {
    const spaces = await Space.find({}).sort({ _id: 1 });
    res.status(200).json(spaces);
  } catch (error) {
    console.error("Admin: Error fetching spaces:", error);
    res.status(500).json({ message: "Server error fetching spaces" });
  }
});

router.get("/:id", async (req, res) => {
  const spaceId = req.params.id;
  try {
    const space = await Space.findById(spaceId);
    if (!space)
      return res.status(404).json({ message: "Space item not found" });
    res.status(200).json(space);
  } catch (error) {
    console.error(`Admin: Error fetching space ${spaceId}:`, error);
    res
      .status(500)
      .json({ message: "Server error fetching space item details" });
  }
});

router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 20 },
  ]),
  async (req, res) => {
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
      const existingSpace = await Space.findById(id);
      if (existingSpace) {
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
          message: `Space item with ID (slug) '${id}' already exists.`,
        });
      }

      const mainImagePath = req.files?.image?.[0]?.path;
      const galleryImagePaths = req.files?.images?.map((f) => f.path) || [];

      const newSpaceData = {
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
        isManuallyUnavailable: isManuallyUnavailable === 'true'
      };

      const newSpace = new Space(newSpaceData);
      const savedSpace = await newSpace.save();

      res.status(201).json(savedSpace);
    } catch (error) {
      console.error("Admin: Error creating space item:", error);
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
      res.status(500).json({ message: "Server error creating space item" });
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
    const spaceId = req.params.id;
    const {
      name,
      shortDescription_fr,
      shortDescription_en,
      longDescription_fr,
      longDescription_en,
      imagesToDelete,
      isManuallyUnavailable,
    } = req.body;

    try {
      const spaceToUpdate = await Space.findById(spaceId);
      if (!spaceToUpdate) {
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
        return res.status(404).json({ message: "Space item not found" });
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
        if (spaceToUpdate.image && spaceToUpdate.image !== DEFAULT_IMAGE_URL) {
          const oldPublicId = extractPublicId(spaceToUpdate.image);
          if (oldPublicId) {
            await cloudinary.uploader
              .destroy(oldPublicId)
              .catch((e) =>
                console.error("Failed to delete old main image:", e)
              );
          }
        }
        updateFields.image = newImageData.path;
      }

      let currentImages = [...spaceToUpdate.images];
      let urlsToDelete = [];

      if (imagesToDelete) {
        try {
          urlsToDelete = JSON.parse(imagesToDelete);
          if (!Array.isArray(urlsToDelete)) {
            urlsToDelete = [];
          }
        } catch (parseError) {
          urlsToDelete = [];
        }
      }

      if (urlsToDelete.length > 0) {
        const publicIdsToDeleteFromGallery = urlsToDelete
          .map(extractPublicId)
          .filter((id) => id);

        if (publicIdsToDeleteFromGallery.length > 0) {
          try {
            await cloudinary.api.delete_resources(
              publicIdsToDeleteFromGallery,
              { type: "upload", resource_type: "image" }
            );
          } catch (cloudinaryError) {
            console.error(
              "Failed to delete specific gallery images from Cloudinary for Space:",
              cloudinaryError
            );
          }
        }
        currentImages = currentImages.filter(
          (imgUrl) => !urlsToDelete.includes(imgUrl)
        );
      }

      const newGalleryImageFiles = req.files?.images || [];
      if (newGalleryImageFiles.length > 0) {
        const newGalleryPaths = newGalleryImageFiles.map((f) => f.path);
        currentImages = [...currentImages, ...newGalleryPaths];
      }
      if (
        JSON.stringify(currentImages) !== JSON.stringify(spaceToUpdate.images)
      ) {
        updateFields.images = currentImages;
      }

      spaceToUpdate.set(updateFields);
      const updatedSpace = await spaceToUpdate.save();

      res.status(200).json(updatedSpace);
    } catch (error) {
      console.error(`Admin: Error updating space item ${spaceId}:`, error);
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
      res.status(500).json({ message: "Server error updating space item" });
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
  const spaceId = req.params.id;
  try {
    const spaceToDelete = await Space.findById(spaceId);
    if (!spaceToDelete)
      return res.status(404).json({ message: "Space item not found" });

    const publicIdsToDelete = [];
    if (spaceToDelete.image && spaceToDelete.image !== DEFAULT_IMAGE_URL) {
      const mainPublicId = extractPublicId(spaceToDelete.image);
      if (mainPublicId) publicIdsToDelete.push(mainPublicId);
    }
    if (spaceToDelete.images && spaceToDelete.images.length > 0) {
      spaceToDelete.images.forEach((imgUrl) => {
        const galleryPublicId = extractPublicId(imgUrl);
        if (galleryPublicId) publicIdsToDelete.push(galleryPublicId);
      });
    }

    if (publicIdsToDelete.length > 0) {
      await cloudinary.api
        .delete_resources(publicIdsToDelete, {
          type: "upload",
          resource_type: "image",
        })
        .catch((e) =>
          console.error("Cloudinary deletion error during space delete:", e)
        );
    }

    await Space.findByIdAndDelete(spaceId);

    const folderPath = `tingitingi_rentals/spaces/${spaceId}`;
    try {
      await cloudinary.api.delete_folder(folderPath);
    } catch (folderError) {
      console.warn(
        `Could not delete Cloudinary folder ${folderPath}. It might not be empty or might not exist. Error:`,
        folderError.message || folderError
      );
    }

    res
      .status(200)
      .json({ message: `Space item ${spaceId} deleted successfully.` });
  } catch (error) {
    console.error(`Admin: Error deleting space item ${spaceId}:`, error);
    res.status(500).json({ message: "Server error deleting space item" });
  }
});

export default router;