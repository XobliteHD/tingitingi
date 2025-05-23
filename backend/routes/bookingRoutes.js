import express from "express";
import axios from "axios";
import Booking from "../models/Booking.js";
import { format } from "date-fns-tz";
import { fr } from "date-fns/locale";
import sendEmail from "../config/mailConfig.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const {
    houseId,
    name,
    email,
    phone,
    checkIn,
    checkOut,
    adults,
    children,
    message,
    recaptchaToken,
  } = req.body;

  if (!recaptchaToken) {
    return res.status(400).json({ message: "reCAPTCHA token is missing." });
  }

  try {
    const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!recaptchaSecretKey) {
      throw new Error("Server configuration error (reCAPTCHA).");
    }
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${recaptchaToken}`;
    const recaptchaResponse = await axios.post(verifyUrl);
    if (!recaptchaResponse.data.success) {
      console.error(
        "reCAPTCHA verification failed:",
        recaptchaResponse.data["error-codes"]
      );
      return res
        .status(400)
        .json({ message: "reCAPTCHA verification failed." });
    }

    if (
      !houseId ||
      !name ||
      !email ||
      !phone ||
      !checkIn ||
      !checkOut ||
      !adults
    ) {
      return res
        .status(400)
        .json({ message: "Missing required booking fields." });
    }

    let checkInDateForDB, checkOutDateForDB;
    try {
      checkInDateForDB = new Date(checkIn);
      checkOutDateForDB = new Date(checkOut);
      if (
        isNaN(checkInDateForDB.getTime()) ||
        isNaN(checkOutDateForDB.getTime())
      ) {
        throw new Error("Invalid date format received.");
      }
      if (checkOutDateForDB <= checkInDateForDB) {
        throw new Error("Check-out date must be after check-in date.");
      }
      console.log(
        "Saving Check-in Date for DB:",
        checkInDateForDB.toISOString()
      );
      console.log(
        "Saving Check-out Date for DB:",
        checkOutDateForDB.toISOString()
      );
    } catch (dateError) {
      console.error("Date parsing/validation error:", dateError);
      return res.status(400).json({
        message: dateError.message || "Invalid check-in or check-out dates.",
      });
    }

    const existingBooking = await Booking.findOne({
      houseId: houseId,
      status: "Confirmed",
      $or: [
        {
          checkIn: { $lt: checkOutDateForDB },
          checkOut: { $gt: checkInDateForDB },
        },
      ],
    });
    if (existingBooking) {
      return res
        .status(409)
        .json({
          message:
            "Sorry, the selected dates conflict with a confirmed booking.",
        });
    }

    const newBooking = new Booking({
      houseId,
      name,
      email,
      phone,
      checkIn: checkInDateForDB,
      checkOut: checkOutDateForDB,
      adults: parseInt(adults, 10),
      children: parseInt(children || "0", 10),
      message: message || "",
      status: "Pending",
    });
    const savedBooking = await newBooking.save();
    console.log("Booking saved successfully:", savedBooking._id);

    try {
      const dateFormat = "eeee dd MMMM yyyy";
      const timeZone = "Africa/Tunis";
      const formattedCheckIn = format(savedBooking.checkIn, dateFormat, {
        timeZone,
        locale: fr,
      });
      const formattedCheckOut = format(savedBooking.checkOut, dateFormat, {
        timeZone,
        locale: fr,
      });
      const childrenText =
        savedBooking.children > 0 ? `, ${savedBooking.children} Enfant(s)` : "";
      const messageText =
        savedBooking.message || "<i>Aucun message fourni.</i>";

      const adminSubject = `Nouvelle demande de réservation - ${houseId} - ${name}`;
      const adminHtml = `<h1>Nouvelle demande de réservation reçue</h1><p><strong>Maison ID :</strong> ${houseId}</p><p><strong>Nom :</strong> ${name}</p><p><strong>Email :</strong> ${email}</p><p><strong>Téléphone :</strong> ${phone}</p><p><strong>Arrivée :</strong> ${formattedCheckIn}</p><p><strong>Départ :</strong> ${formattedCheckOut}</p><p><strong>Invités :</strong> ${savedBooking.adults} Adulte(s)${childrenText}</p><p><strong>Message :</strong></p><p>${messageText}</p><hr/><p><i>Statut de la réservation : En attente</i></p><p>Veuillez vous connecter au panneau d'administration pour confirmer ou gérer cette réservation.</p>`;
      await sendEmail({
        to: process.env.ADMIN_EMAIL_RECIPIENT,
        subject: adminSubject,
        html: adminHtml,
      });
      console.log(
        `Admin notification email sent for booking ${savedBooking._id}`
      );

      const userSubject = `Votre demande de réservation Tingitingi reçue !`;
      const userHtml = `<h1>Merci pour votre demande de réservation, ${name} !</h1><p>Nous avons bien reçu votre demande pour <strong>${houseId}</strong>.</p><p><strong>Détails :</strong></p><ul><li>Arrivée : ${formattedCheckIn}</li><li>Départ : ${formattedCheckOut}</li><li>Invités : ${savedBooking.adults} Adulte(s)${childrenText}</li></ul><p>Votre demande est actuellement <strong>En attente</strong>. Nous l'examinerons sous peu et vous contacterons pour confirmation ou plus de détails.</p><br/><p>Cordialement,</p><p>L'équipe Tingitingi</p>`;
      const userText = `Merci pour votre demande de réservation, ${name} !\nNous avons bien reçu votre demande pour ${houseId}.\nDétails :\nArrivée : ${formattedCheckIn}\nDépart : ${formattedCheckOut}\nInvités : ${savedBooking.adults} Adulte(s)${childrenText}\nVotre demande est actuellement En attente...\nCordialement, L'équipe Tingitingi`;
      await sendEmail({
        to: email,
        subject: userSubject,
        text: userText,
        html: userHtml,
      });
      console.log(
        `User confirmation email sent for booking ${savedBooking._id}`
      );
    } catch (emailError) {
      console.error(
        `Failed to send emails for booking ${savedBooking._id}:`,
        emailError
      );
    }

    res.status(201).json({
      message: "Booking request received successfully!",
      booking: savedBooking,
    });
  } catch (error) {
    console.error("Error processing booking request:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ message: "Validation failed", errors: messages });
    }
    if (
      error.message.includes("Invalid date format") ||
      error.message.includes("Check-out date must be after")
    ) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes("Server configuration error (reCAPTCHA)")) {
      return res.status(500).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error creating booking." });
  }
});

export default router;
