import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  pack: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  salePrice: {
    type: Number,
    required: true,
  },
});

const bulkProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    variants: [variantSchema],
    amazonLink: String,
    description: String,
    highlights: [String],
    images: [String],
  },
  { timestamps: true }
);

export default mongoose.model("BulkProduct", bulkProductSchema);