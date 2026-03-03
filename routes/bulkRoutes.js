import express from "express";
import upload from "../middleware/upload.js";
import {
  createBulkProduct,
  getBulkProducts,
  getBulkProductById,
  updateBulkProduct,
  deleteBulkProduct,
} from "../controllers/bulkController.js";

const router = express.Router();

router.post("/", upload.array("images", 10), createBulkProduct);
router.get("/", getBulkProducts);
router.get("/:id", getBulkProductById);
router.put("/:id", upload.array("images", 10), updateBulkProduct);
router.delete("/:id", deleteBulkProduct);

export default router;