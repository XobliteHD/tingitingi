import express from "express";
import Other from "../models/Other.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const others = await Other.find({ isManuallyUnavailable: { $ne: true } });

    const othersWithDetails = others.map((other) => ({
      id: other._id,
      name: other.name,
      shortDescription: other.shortDescription,
      image: other.image,
      images: other.images,
    }));

    res.status(200).json(othersWithDetails);
  } catch (error) {
    console.error("Error fetching public other items:", error);
    res.status(500).json({ message: "Server error fetching other items" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const otherId = req.params.id;
    const other = await Other.findById(otherId);

    if (!other) {
      return res.status(404).json({ message: "Item not found" });
    }

    const otherDetails = {
      id: other._id,
      name: other.name,
      shortDescription: other.shortDescription,
      longDescription: other.longDescription,
      image: other.image,
      images: other.images,
    };

    res.status(200).json(otherDetails);
  } catch (error) {
    console.error(`Error fetching other item with id ${req.params.id}:`, error);
    if (error.kind === "ObjectId" || error.name === "CastError") {
      return res.status(400).json({ message: "Invalid item ID format" });
    }
    res.status(500).json({ message: "Server error fetching item details" });
  }
});

export default router;
