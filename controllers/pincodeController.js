import axios from "axios";
import { getNimbusToken } from "../utils/nimbus.js";

export const checkPincode = async (req, res) => {
  try {
    const { pincode } = req.body;

    const token = await getNimbusToken();

    const response = await axios.get(
      `https://ship.nimbuspost.com/api/v1/courier/serviceability`,
      {
        params: {
          pickup_postcode: process.env.PICKUP_PINCODE,
          delivery_postcode: pincode,
          weight: 1,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.data.available_courier_companies.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Delivery not available on this pincode",
      });
    }

    res.json({
      success: true,
      message: "Delivery available",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};