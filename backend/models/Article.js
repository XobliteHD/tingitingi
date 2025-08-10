import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
    },
    summary: {
      type: String,
      required: [true, "Please add a summary"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Please add content"],
    },
    mainImage: {
      type: String,
      required: false,
      default: "https://res.cloudinary.com/daaxaj4j7/image/upload/v1746197697/placeholder_k2h20u_ddn2kf.png",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    author: {
        type: String,
        default: 'Tingitingi Team',
    }
  },
  {
    timestamps: true,
  }
);

const Article = mongoose.model("Article", articleSchema);

export default Article;