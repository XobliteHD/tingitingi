import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import {
  storage as cloudinaryStorage,
  cloudinary,
} from "../config/cloudinaryConfig.js";
import House from "../models/House.js";

const router = express.Router();

const DEFAULT_IMAGE_URL = "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746197697/placeholder_k2h20u_ddn2kf.png";

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

router.post("/", upload.any(), async (req, res) => {
    const {
      id, name, shortDescription_fr, shortDescription_en, longDescription_fr,
      longDescription_en, capacity, isManuallyUnavailable, presentationContent_fr,
      presentationContent_en, virtualTourVideos, reviewsData,
      displayPhotosUrls, googlePhotosLink // ADDED THESE FIELDS
    } = req.body;

    const requiredFields = { id, name, shortDescription_fr, shortDescription_en, longDescription_fr, longDescription_en };
    const missingFields = Object.entries(requiredFields).filter(([key, value]) => !value || value.trim() === "").map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(", ")}` });
    }

    try {
      const existingHouse = await House.findById(id);
      if (existingHouse) {
        return res.status(400).json({ message: `House with ID (slug) '${id}' already exists.` });
      }

      const mainImageFile = req.files.find(f => f.fieldname === 'image');
      const galleryImageFiles = req.files.filter(f => f.fieldname === 'images');

      let parsedReviews = reviewsData ? JSON.parse(reviewsData) : [];
      const reviewImageFiles = req.files.filter(f => f.fieldname.startsWith('reviewImage_'));
      reviewImageFiles.forEach(file => {
          const index = parseInt(file.fieldname.split('_')[1]);
          if (!isNaN(index) && parsedReviews[index]) {
              parsedReviews[index].imageUrl = file.path;
          }
      });

      const newHouseData = {
        _id: id,
        name: name.trim(),
        shortDescription: { fr: shortDescription_fr.trim(), en: shortDescription_en.trim() },
        longDescription: { fr: longDescription_fr.trim(), en: longDescription_en.trim() },
        presentationContent: { fr: presentationContent_fr.trim(), en: presentationContent_en.trim() },
        virtualTourVideos: virtualTourVideos ? JSON.parse(virtualTourVideos) : [],
        reviews: parsedReviews,
        image: mainImageFile ? mainImageFile.path : undefined,
        images: galleryImageFiles.map(f => f.path),
        isManuallyUnavailable: isManuallyUnavailable === "true",
        ...(capacity && !isNaN(parseInt(capacity)) && { capacity: parseInt(capacity) }),
        // ADDED NEW FIELDS for POST
        displayPhotosUrls: displayPhotosUrls ? JSON.parse(displayPhotosUrls) : [],
        googlePhotosLink: googlePhotosLink ? googlePhotosLink.trim() : undefined,
      };

      const newHouse = new House(newHouseData);
      const savedHouse = await newHouse.save();
      res.status(201).json(savedHouse);
    } catch (error) {
      console.error("Admin: Error creating house:", error);
      res.status(500).json({ message: "Server error creating house" });
    }
});

router.put("/:id", upload.any(), async (req, res) => {
    const houseId = req.params.id;
    const {
      name, shortDescription_fr, shortDescription_en, longDescription_fr, longDescription_en,
      capacity, imagesToDelete, isManuallyUnavailable, presentationContent_fr,
      presentationContent_en, virtualTourVideos, reviewsData,
      displayPhotosUrls, googlePhotosLink // ADDED THESE FIELDS HERE
    } = req.body;

    try {
      const houseToUpdate = await House.findById(houseId);
      if (!houseToUpdate) {
        return res.status(404).json({ message: "House not found" });
      }

      const updateFields = {};
      if (name !== undefined) updateFields.name = name.trim();
      if (shortDescription_fr !== undefined) updateFields["shortDescription.fr"] = shortDescription_fr.trim();
      if (shortDescription_en !== undefined) updateFields["shortDescription.en"] = shortDescription_en.trim();
      if (longDescription_fr !== undefined) updateFields["longDescription.fr"] = longDescription_fr.trim();
      if (longDescription_en !== undefined) updateFields["longDescription.en"] = longDescription_en.trim();
      if (presentationContent_fr !== undefined) updateFields["presentationContent.fr"] = presentationContent_fr.trim();
      if (presentationContent_en !== undefined) updateFields["presentationContent.en"] = presentationContent_en.trim();
      if (isManuallyUnavailable !== undefined) updateFields.isManuallyUnavailable = isManuallyUnavailable === "true";
      
      if (virtualTourVideos !== undefined) {
          try { updateFields.virtualTourVideos = JSON.parse(virtualTourVideos); }
          catch (e) { console.error("Error parsing virtualTourVideos JSON", e); }
      }
      
      if (reviewsData !== undefined) {
          try {
              let parsedReviews = JSON.parse(reviewsData);
              const reviewImageFiles = req.files.filter(f => f.fieldname.startsWith('reviewImage_'));
              reviewImageFiles.forEach(file => {
                  const index = parseInt(file.fieldname.split('_')[1]);
                  if (!isNaN(index) && parsedReviews[index]) {
                      parsedReviews[index].imageUrl = file.path;
                  }
              });
              updateFields.reviews = parsedReviews;
          } catch(e) {
              console.error("Error processing reviews data", e);
          }
      }

      if (capacity !== undefined) {
        const capInt = parseInt(capacity);
        if (!isNaN(capInt) && capInt > 0) {
          updateFields.capacity = capInt;
        } else if (capacity === "" || capacity === null) {
          updateFields.capacity = null;
        }
      }
      
      const mainImageFile = req.files.find(f => f.fieldname === 'image');
      if (mainImageFile) {
        if (houseToUpdate.image && houseToUpdate.image !== DEFAULT_IMAGE_URL) {
          const oldPublicId = extractPublicId(houseToUpdate.image);
          if (oldPublicId) { await cloudinary.uploader.destroy(oldPublicId).catch(e => console.error("Failed to delete old main image:", e)); }
        }
        updateFields.image = mainImageFile.path;
      }

      let currentImages = [...houseToUpdate.images];
      let urlsToDelete = [];
      if (imagesToDelete) {
        try { urlsToDelete = JSON.parse(imagesToDelete); } 
        catch (e) { urlsToDelete = []; }
      }

      if (urlsToDelete.length > 0) {
        const publicIdsToDeleteFromGallery = urlsToDelete.map(extractPublicId).filter(id => id);
        if (publicIdsToDeleteFromGallery.length > 0) {
          try { await cloudinary.api.delete_resources(publicIdsToDeleteFromGallery, { type: "upload", resource_type: "image" }); } 
          catch (e) { console.error("Failed to delete gallery images from Cloudinary:", e); }
        }
        currentImages = currentImages.filter(imgUrl => !urlsToDelete.includes(imgUrl));
      }

      const newGalleryImageFiles = req.files.filter(f => f.fieldname === 'images');
      if (newGalleryImageFiles.length > 0) {
        const newGalleryPaths = newGalleryImageFiles.map(f => f.path);
        currentImages = [...currentImages, ...newGalleryPaths];
      }
      
      if (JSON.stringify(currentImages) !== JSON.stringify(houseToUpdate.images)) {
        updateFields.images = currentImages;
      }

      // ADDED NEW FIELDS for PUT
      if (displayPhotosUrls !== undefined) {
          try { updateFields.displayPhotosUrls = JSON.parse(displayPhotosUrls); }
          catch (e) { console.error("Error parsing displayPhotosUrls JSON", e); }
      }
      if (googlePhotosLink !== undefined) {
          updateFields.googlePhotosLink = googlePhotosLink.trim();
      }

      houseToUpdate.set(updateFields);
      const updatedHouse = await houseToUpdate.save();

      res.status(200).json(updatedHouse);
    } catch (error) {
      console.error(`Admin: Error updating house ${houseId}:`, error);
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
    const publicIdWithFolder = pathWithExtension.substring(0, pathWithExtension.lastIndexOf("."));
    return publicIdWithFolder || null;
  } catch (e) {
    console.error("Error extracting public ID from", imageUrl, e);
    return null;
  }
}

router.delete("/:id", async (req, res) => {
  const houseId = req.params.id;
  try {
    const houseToDelete = await House.findById(houseId);
    if (!houseToDelete) return res.status(404).json({ message: "House not found" });

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

    // NEW: Delete displayPhotosUrls from Cloudinary if they are Cloudinary URLs
    if (houseToDelete.displayPhotosUrls && houseToDelete.displayPhotosUrls.length > 0) {
      houseToDelete.displayPhotosUrls.forEach((imgUrl) => {
        const displayPublicId = extractPublicId(imgUrl);
        if (displayPublicId) publicIdsToDelete.push(displayPublicId);
      });
    }

    if (publicIdsToDelete.length > 0) {
      await cloudinary.api.delete_resources(publicIdsToDelete, { type: "upload", resource_type: "image" })
        .catch(e => console.error("Cloudinary deletion error during house delete:", e));
    }
    await House.findByIdAndDelete(houseId);

    const folderPath = `tingitingi_rentals/houses/${houseId}`;
    try {
      await cloudinary.api.delete_folder(folderPath);
    } catch (folderError) {
      console.warn(`Could not delete Cloudinary folder ${folderPath}. It might not be empty or might not exist. Error:`, folderError.message || folderError);
    }

    res.status(200).json({ message: `House ${houseId} deleted successfully.` });
  } catch (error) {
    console.error(`Admin: Error deleting house ${houseId}:`, error);
    res.status(500).json({ message: "Server error deleting house" });
  }
});

export default router;