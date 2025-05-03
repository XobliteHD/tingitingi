import express from "express";
import House from "../models/House.js";
import Booking from "../models/Booking.js";

const router = express.Router();

router.get("/:id/booked-dates", async (req, res) => {
  try {
    const houseId = req.params.id;
    const bookings = await Booking.find(
      {
        houseId: houseId,
        status: { $in: ["Pending", "Confirmed"] },
      },
      "checkIn checkOut status _id"
    );

    if (!bookings) {
      return res.status(200).json([]);
    }

    const bookedIntervals = bookings.map((booking) => ({
      start: booking.checkIn,
      end: new Date(booking.checkOut.getTime() - 24 * 60 * 60 * 1000),
      status: booking.status,
      bookingId: booking._id,
    }));

    res.status(200).json(bookedIntervals);
  } catch (error) {
    console.error(
      `Error fetching booked dates for house ${req.params.id}:`,
      error
    );
    res.status(500).json({ message: "Server error fetching booked dates" });
  }
});

router.get("/", async (req, res) => {
  try {
    const houses = await House.find({ isManuallyUnavailable: { $ne: true } });

    const housesWithDetails = houses.map((house) => ({
      id: house._id,
      name: house.name,
      shortDescription: house.shortDescription,
      image: house.image,
      images: house.images,
    }));

    res.status(200).json(housesWithDetails);
  } catch (error) {
    console.error("Error fetching houses:", error);
    res.status(500).json({ message: "Server error fetching houses" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const houseId = req.params.id;
    const house = await House.findById(houseId);

    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }
    const houseDetails = {
      id: house._id,
      name: house.name,
      shortDescription: house.shortDescription,
      longDescription: house.longDescription,
      image: house.image,
      images: house.images,
      capacity: house.capacity,
      isManuallyUnavailable: house.isManuallyUnavailable,
    };

    res.status(200).json(houseDetails);
  } catch (error) {
    console.error(`Error fetching house with id ${req.params.id}:`, error);
    if (error.kind === "ObjectId" || error.name === "CastError") {
      return res.status(400).json({ message: "Invalid house ID format" });
    }
    res.status(500).json({ message: "Server error fetching house details" });
  }
});

export default router;
