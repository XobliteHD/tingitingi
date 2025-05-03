// backend/models/Booking.js

import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    houseId: {
      type: String,
      required: [true, "House ID is required"],
      ref: "House",
    },
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Customer email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Customer phone number is required"],
      trim: true,
    },
    checkIn: {
      type: Date,
      required: [true, "Check-in date is required"],
    },
    checkOut: {
      type: Date,
      required: [true, "Check-out date is required"],
      validate: {
        validator: function (value) {
          return this.checkIn < value;
        },
        message: "Check-out date must be after check-in date",
      },
    },
    adults: {
      type: Number,
      required: [true, "Number of adults is required"],
      min: 1,
    },
    children: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    message: {
      type: String,
      required: false,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
