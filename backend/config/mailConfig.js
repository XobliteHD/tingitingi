// backend/config/mailConfig.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_USER",
  "EMAIL_PASS",
  "EMAIL_FROM",
];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

let transporter;

if (missingVars.length > 0) {
  console.warn(`------------------------------------------------------`);
  console.warn(
    `WARN: Missing required email environment variables: ${missingVars.join(
      ", "
    )}`
  );
  console.warn(`Email functionality will be disabled.`);
  console.warn(`------------------------------------------------------`);
  transporter = null;
} else {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: parseInt(process.env.EMAIL_PORT, 10) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error("------------------------------------------------------");
      console.error("ERROR: Email transporter verification failed!");
      console.error("Check your EMAIL_HOST, PORT, USER, PASS in .env");
      console.error("Detailed Error:", error);
      console.error("------------------------------------------------------");
    } else {
      console.log("Email server is ready to take messages");
    }
  });
}
const sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    console.warn(
      `Email sending skipped: Email transporter not configured due to missing .env variables.`
    );
    return { skipped: true, reason: "Transporter not configured" };
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: subject,
    text: text,
    html: html,
  };

  try {
    console.log(`Attempting to send email to: ${to} with subject: ${subject}`);
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent successfully: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error occurred while sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
export default sendEmail;
