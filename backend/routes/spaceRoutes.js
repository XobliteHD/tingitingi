import express from "express";
import Space from "../models/Space.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const spaces = await Space.find({ isManuallyUnavailable: { $ne: true } });

    const spacesWithDetails = spaces.map((space) => ({
      id: space._id,
      name: space.name,
      shortDescription: space.shortDescription,
      image: space.image,
      images: space.images,
    }));

    res.status(200).json(spacesWithDetails);
  } catch (error) {
    console.error("Error fetching public space items:", error);
    res.status(500).json({ message: "Server error fetching space items" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const spaceId = req.params.id;
    const space = await Space.findById(spaceId);

    if (!space) {
      return res.status(404).json({ message: "Item not found" });
    }

    const spaceDetails = {
      id: space._id,
      name: space.name,
      shortDescription: space.shortDescription,
      longDescription: space.longDescription,
      image: space.image,
      images: space.images,
    };

    res.status(200).json(spaceDetails);
  } catch (error) {
    console.error(`Error fetching space item with id ${req.params.id}:`, error);
    if (error.kind === "ObjectId" || error.name === "CastError") {
      return res.status(400).json({ message: "Invalid item ID format" });
    }
    res.status(500).json({ message: "Server error fetching item details" });
  }
});

export default router;
