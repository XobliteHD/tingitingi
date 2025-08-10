import express from "express";
import axios from "axios";
import sendEmail from "../config/mailConfig.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, message, recaptchaToken } = req.body;

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
      console.error("reCAPTCHA verification failed:", recaptchaResponse.data["error-codes"]);
      return res.status(400).json({ message: "reCAPTCHA verification failed." });
    }
  } catch (error) {
    console.error("Error during reCAPTCHA verification:", error);
    return res.status(500).json({ message: "Server error during reCAPTCHA verification." });
  }

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email, and message are required fields." });
  }

  try {
    const adminRecipient = process.env.ADMIN_EMAIL_RECIPIENT;
    if (!adminRecipient) {
        console.error("ADMIN_EMAIL_RECIPIENT is not set in .env file.");
        return res.status(500).json({ message: "Server configuration error (email recipient)."});
    }

    const subject = `New Contact Form Message from ${name}`;
    const textContent = `You have received a new message from your website contact form.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    const htmlContent = `
      <h1>New Contact Message</h1>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <hr>
      <h2>Message:</h2>
      <p style="white-space: pre-wrap;">${message}</p>
    `;

    await sendEmail({
      to: adminRecipient,
      subject: subject,
      text: textContent,
      html: htmlContent,
      replyTo: email
    });

    res.status(200).json({ message: "Your message has been sent successfully!" });

  } catch (error) {
    console.error("Error sending contact email:", error);
    res.status(500).json({ message: "Failed to send message. Please try again later." });
  }
});

export default router;