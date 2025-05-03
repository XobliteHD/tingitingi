import mongoose from "mongoose";

const otherSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      alias: "id",
    },
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },
    shortDescription: {
      fr: {
        type: String,
        required: [true, "Please add a short French description"],
        trim: true,
      },
      en: {
        type: String,
        required: [true, "Please add a short English description"],
        trim: true,
      },
    },
    longDescription: {
      fr: {
        type: String,
        required: [true, "Please add a long French description"],
        trim: true,
      },
      en: {
        type: String,
        required: [true, "Please add a long English description"],
        trim: true,
      },
    },
    image: {
      type: String,
      required: false,
      default:
        "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746197697/placeholder_k2h20u_ddn2kf.png",
    },
    images: {
      type: [String],
      required: false,
      default: [],
    },
    isManuallyUnavailable: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

const Other = mongoose.model("Other", otherSchema);

export default Other;
