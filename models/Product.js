import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  categoryType: { type: String },
  sizes: [{ type: String }],
  mrp: { type: Number },
  salePrice: { type: Number },
  amazonLink: { type: String },
  description: { type: String },
  highlights: [{ type: String }],
  images: [{ type: String }], // Cloudinary URLs
  amazingDeals: {
  type: Boolean,
  default: false,
},
newArrivals: {
  type: Boolean,
  default: false,
},
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
export default Product;