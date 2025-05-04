import express from "express";
import Booking from "../models/Booking.js";
import mongoose from "mongoose";
import { parseISO } from "date-fns";
import sendEmail from "../config/mailConfig.js";
import { format } from "date-fns-tz";
import { fr } from "date-fns/locale";

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("Admin GET /bookings request with query:", req.query);

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const filter = {};
    const validStatuses = ["Pending", "Confirmed", "Cancelled", "Completed"];
    if (req.query.status && validStatuses.includes(req.query.status)) {
      filter.status = req.query.status;
      console.log("Applying status filter:", filter.status);
    }

    const searchQuery = {};
    const searchTerm = req.query.search ? req.query.search.trim() : "";

    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm, "i");

      if (/^[a-f0-9]{1,24}$/i.test(searchTerm)) {
        console.log("Search term might be an ID suffix:", searchTerm);
      }

      searchQuery.$or = [{ name: searchRegex }, { email: searchRegex }];
      console.log("Applying search filter:", searchQuery.$or);
    }

    const finalFilter = { ...filter, ...searchQuery };

    const sort = {};
    const sortBy = req.query.sortBy || "createdAt_desc";

    switch (sortBy) {
      case "checkIn_asc":
        sort.checkIn = 1;
        break;
      case "checkIn_desc":
        sort.checkIn = -1;
        break;
      case "createdAt_asc":
        sort.createdAt = 1;
        break;
      case "createdAt_desc":
      default:
        sort.createdAt = -1;
        break;
    }
    console.log("Applying sort:", sort);

    const totalBookings = await Booking.countDocuments(finalFilter);
    console.log(
      `Total bookings found matching filter [${JSON.stringify(
        finalFilter
      )}]: ${totalBookings}`
    );

    let bookings = await Booking.find(finalFilter)
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const totalPages = Math.ceil(totalBookings / limit);

    console.log(
      `Returning page ${page}/${totalPages}, ${bookings.length} bookings.`
    );

    res.status(200).json({
      bookings: bookings,
      page: page,
      pages: totalPages,
      total: totalBookings,
      limit: limit,
    });
  } catch (error) {
    console.error("Error fetching and sorting bookings for admin:", error);
    res.status(500).json({ message: "Server error fetching bookings" });
  }
});

router.put("/:id/status", async (req, res) => {
  const bookingId = req.params.id;
  const { status: newStatus } = req.body;
  const allowedStatuses = ["Pending", "Confirmed", "Cancelled", "Completed"];

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    return res.status(400).json({ message: "Invalid booking ID format" });
  }
  if (!newStatus || !allowedStatuses.includes(newStatus)) {
    return res.status(400).json({
      message: `Invalid status value. Must be one of: ${allowedStatuses.join(
        ", "
      )}`,
    });
  }

  try {
    const bookingBeforeUpdate = await Booking.findById(bookingId);
    if (!bookingBeforeUpdate) {
      return res.status(404).json({ message: "Booking not found" });
    }
    const originalStatus = bookingBeforeUpdate.status;

    if (newStatus === "Confirmed" && originalStatus !== "Confirmed") {
      const conflictingBooking = await Booking.findOne({
        _id: { $ne: bookingBeforeUpdate._id },
        houseId: bookingBeforeUpdate.houseId,
        status: "Confirmed",
        $or: [
          {
            checkIn: { $lt: bookingBeforeUpdate.checkOut },
            checkOut: { $gt: bookingBeforeUpdate.checkIn },
          },
        ],
      });
      if (conflictingBooking) {
        return res.status(409).json({
          message: `Cannot confirm booking. Dates conflict with existing confirmed booking ID: ${conflictingBooking._id}.`,
        });
      }
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { $set: { status: newStatus } },
      { new: true }
    );

    if (!updatedBooking) {
      console.error(`Booking ${bookingId} found but failed to update status.`);
      return res
        .status(404)
        .json({ message: "Booking found but update failed." });
    }

    if (
      (newStatus === "Confirmed" && originalStatus !== "Confirmed") ||
      (newStatus === "Cancelled" && originalStatus !== "Cancelled")
    ) {
      try {
        const dateFormat = "eeee dd MMMM yyyy";
        const timeZone = "Africa/Tunis";
        const formattedCheckIn = format(updatedBooking.checkIn, dateFormat, {
          timeZone,
          locale: fr,
        });
        const formattedCheckOut = format(updatedBooking.checkOut, dateFormat, {
          timeZone,
          locale: fr,
        });
        const bookingRef = updatedBooking._id.toString().slice(-6);
        const childrenText =
          updatedBooking.children > 0
            ? `, ${updatedBooking.children} Enfant(s)`
            : "";

        let userSubject = "";
        let userHtml = "";
        let userText = "";

        if (newStatus === "Confirmed") {
          userSubject = `Votre réservation Tingitingi est Confirmée ! (#${bookingRef})`;
          userHtml = `<h1>Réservation Confirmée !</h1><p>Bonjour ${updatedBooking.name},</p><p>Nous avons le plaisir de confirmer votre réservation pour <strong>${updatedBooking.houseId}</strong>.</p><p><strong>Détails :</strong></p><ul><li>Arrivée : ${formattedCheckIn}</li><li>Départ : ${formattedCheckOut}</li><li>Invités : ${updatedBooking.adults} Adulte(s)${childrenText}</li></ul><p>Votre référence de réservation (6 derniers chiffres) : ${bookingRef}</p><p>Au plaisir de vous accueillir !</p><br/><p>Cordialement,</p><p>L'équipe Tingitingi</p>`;
          userText = `...`;
        } else {
          userSubject = `Votre réservation Tingitingi a été Annulée (#${bookingRef})`;
          userHtml = `<h1>Avis d'Annulation de Réservation</h1><p>Bonjour ${updatedBooking.name},</p><p>Ce courriel vous informe que votre demande de réservation pour <strong>${updatedBooking.houseId}</strong> du ${formattedCheckIn} au ${formattedCheckOut} a été annulée.</p><p>Votre référence de réservation (6 derniers chiffres) : ${bookingRef}</p><p>Si vous avez des questions, veuillez nous contacter.</p><br/><p>Cordialement,</p><p>L'équipe Tingitingi</p>`;
          userText = `...`;
        }

        await sendEmail({
          to: updatedBooking.email,
          subject: userSubject,
          text: userText,
          html: userHtml,
        });
        console.log(
          `User notification email sent for status change (${newStatus}) for booking ${updatedBooking._id}`
        );
      } catch (emailError) {
        console.error(
          `Failed to send status update email (${newStatus}) for booking ${updatedBooking._id}:`,
          emailError
        );
      }
    }

    res.status(200).json({
      message: `Booking status updated to ${updatedBooking.status}`,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error(`Error updating status for booking ${bookingId}:`, error);
    res.status(500).json({ message: "Server error updating booking status" });
  }
});
router.delete("/:id", async (req, res) => {
  const bookingId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    return res.status(400).json({ message: "Invalid booking ID format" });
  }
  try {
    const result = await Booking.findByIdAndDelete(bookingId);
    if (!result) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res
      .status(200)
      .json({ message: `Booking ${bookingId} deleted successfully.` });
  } catch (error) {
    console.error(`Error deleting booking ${bookingId}:`, error);
    res.status(500).json({ message: "Server error deleting booking" });
  }
});

router.put("/:id", async (req, res) => {
  const bookingId = req.params.id;
  const {
    name,
    email,
    phone,
    checkIn,
    checkOut,
    adults,
    children,
    status: newStatus,
    message,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    return res.status(400).json({ message: "Invalid booking ID format" });
  }
  const allowedStatuses = ["Pending", "Confirmed", "Cancelled", "Completed"];
  if (newStatus && !allowedStatuses.includes(newStatus)) {
    return res.status(400).json({ message: `Invalid status value.` });
  }

  let checkInDateUTC, checkOutDateUTC;
  try {
    if (checkIn) {
      const parsedCheckIn = parseISO(checkIn);
      if (isNaN(parsedCheckIn)) throw new Error("Invalid check-in date format");
      checkInDateUTC = parsedCheckIn;
    }
    if (checkOut) {
      const parsedCheckOut = parseISO(checkOut);
      if (isNaN(parsedCheckOut))
        throw new Error("Invalid check-out date format");
      checkOutDateUTC = parsedCheckOut;
    }
    if (
      checkInDateUTC &&
      checkOutDateUTC &&
      checkOutDateUTC <= checkInDateUTC
    ) {
      throw new Error("Check-out must be after check-in");
    }
    {
      throw new Error("Invalid date format");
    }
    if (
      checkInDateUTC &&
      checkOutDateUTC &&
      checkOutDateUTC <= checkInDateUTC
    ) {
      throw new Error("Check-out must be after check-in");
    }
  } catch (dateError) {
    return res.status(400).json({ message: dateError.message });
  }

  const finalAdults = adults !== undefined ? parseInt(adults, 10) : undefined;
  const finalChildren =
    children !== undefined ? parseInt(children, 10) : undefined;
  if (finalAdults !== undefined && (isNaN(finalAdults) || finalAdults < 1)) {
    return res.status(400).json({ message: "Invalid number of adults." });
  }
  if (
    finalChildren !== undefined &&
    (isNaN(finalChildren) || finalChildren < 0)
  ) {
    return res.status(400).json({ message: "Invalid number of children." });
  }

  const updateFields = {};
  if (name !== undefined) updateFields.name = name.trim();
  if (email !== undefined) updateFields.email = email.trim().toLowerCase();
  if (phone !== undefined) updateFields.phone = phone.trim();
  if (checkInDateUTC) updateFields.checkIn = checkInDateUTC;
  if (checkOutDateUTC) updateFields.checkOut = checkOutDateUTC;
  if (finalAdults !== undefined) updateFields.adults = finalAdults;
  if (finalChildren !== undefined) updateFields.children = finalChildren;
  if (newStatus) updateFields.status = newStatus;
  if (message !== undefined) updateFields.message = message.trim();

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ message: "No update fields provided." });
  }

  let originalStatus = null;

  try {
    const bookingToUpdate = await Booking.findById(bookingId);
    if (!bookingToUpdate) {
      return res.status(404).json({ message: "Booking not found" });
    }
    originalStatus = bookingToUpdate.status;

    const checkInForOverlap = updateFields.checkIn || bookingToUpdate.checkIn;
    const checkOutForOverlap =
      updateFields.checkOut || bookingToUpdate.checkOut;
    const statusForOverlap = updateFields.status || bookingToUpdate.status;

    if (statusForOverlap === "Confirmed" && originalStatus !== "Confirmed") {
      const conflictingBooking = await Booking.findOne({
        _id: { $ne: bookingToUpdate._id },
        houseId: bookingToUpdate.houseId,
        status: "Confirmed",
        $or: [
          {
            checkIn: { $lt: checkOutForOverlap },
            checkOut: { $gt: checkInForOverlap },
          },
        ],
      });
      if (conflictingBooking) {
        return res.status(409).json({
          message: `Cannot save changes. Dates conflict with existing confirmed booking ID: ${conflictingBooking._id}.`,
        });
      }
    }

    bookingToUpdate.set(updateFields);
    const updatedBooking = await bookingToUpdate.save();

    const finalStatus = updatedBooking.status;
    if (
      (finalStatus === "Confirmed" && originalStatus !== "Confirmed") ||
      (finalStatus === "Cancelled" && originalStatus !== "Cancelled")
    ) {
      try {
        const dateFormat = "eeee dd MMMM yyyy";
        const timeZone = "Africa/Tunis";
        const formattedCheckIn = format(updatedBooking.checkIn, dateFormat, {
          timeZone,
        });
        const formattedCheckOut = format(updatedBooking.checkOut, dateFormat, {
          timeZone,
        });
        const bookingRef = updatedBooking._id.toString().slice(-6);
        const childrenText =
          updatedBooking.children > 0
            ? `, ${updatedBooking.children} Enfant(s)`
            : "";

        let userSubject = "";
        let userHtml = "";
        let userText = "";

        if (finalStatus === "Confirmed") {
          userSubject = `Votre réservation Tingitingi est Confirmée ! (#${bookingRef})`;
          userHtml = `<h1>Réservation Confirmée !</h1><p>Bonjour ${updatedBooking.name},</p><p>Nous avons le plaisir de confirmer votre réservation pour <strong>${updatedBooking.houseId}</strong>.</p><p><strong>Détails :</strong></p><ul><li>Arrivée : ${formattedCheckIn}</li><li>Départ : ${formattedCheckOut}</li><li>Invités : ${updatedBooking.adults} Adulte(s)${childrenText}</li></ul><p>Votre référence de réservation (6 derniers chiffres) : ${bookingRef}</p><p>Au plaisir de vous accueillir !</p><br/><p>Cordialement,</p><p>L'équipe Tingitingi</p>`;
          userText = `Réservation Confirmée !\nBonjour ${updatedBooking.name},\nNous avons le plaisir de confirmer votre réservation pour ${updatedBooking.houseId}.\nDétails : Arrivée : ${formattedCheckIn} | Départ : ${formattedCheckOut} | Invités : ${updatedBooking.adults} Adulte(s)${childrenText}\nRef : ${bookingRef}\nAu plaisir de vous accueillir !\nCordialement, L'équipe Tingitingi`;
        } else {
          userSubject = `Votre réservation Tingitingi a été Annulée (#${bookingRef})`;
          userHtml = `<h1>Avis d'Annulation de Réservation</h1><p>Bonjour ${updatedBooking.name},</p><p>Ce courriel vous informe que votre demande de réservation pour <strong>${updatedBooking.houseId}</strong> du ${formattedCheckIn} au ${formattedCheckOut} a été annulée.</p><p>Votre référence de réservation (6 derniers chiffres) : ${bookingRef}</p><p>Si vous avez des questions, veuillez nous contacter.</p><br/><p>Cordialement,</p><p>L'équipe Tingitingi</p>`;
          userText = `Avis d'Annulation de Réservation\nBonjour ${updatedBooking.name},\nCe courriel vous informe que votre demande de réservation pour ${updatedBooking.houseId} du ${formattedCheckIn} au ${formattedCheckOut} a été annulée.\nRef : ${bookingRef}\nSi vous avez des questions, veuillez nous contacter.\nCordialement, L'équipe Tingitingi`;
        }
        await sendEmail({
          to: updatedBooking.email,
          subject: userSubject,
          text: userText,
          html: userHtml,
        });
        console.log(
          `User notification email sent for status change (${finalStatus}) via modal save for booking ${updatedBooking._id}`
        );
      } catch (emailError) {
        console.error(
          `Failed to send status update email (${finalStatus}) via modal save for booking ${updatedBooking._id}:`,
          emailError
        );
      }
    }

    res.status(200).json({
      message: `Booking updated successfully.`,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error(`Error updating booking ${bookingId}:`, error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ message: "Validation failed", errors: messages });
    }
    if (
      error instanceof RangeError ||
      error.message.includes("Invalid time value") ||
      error.message === "Invalid date format" ||
      error.message === "Check-out must be after check-in"
    ) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error updating booking" });
  }
});

export default router;
