import axios from "axios";
import { getNimbusToken } from "../utils/nimbus.js";

export const createShipment = async (req, res) => {
  try {
    const token = await getNimbusToken();

    const order = req.body;

    const response = await axios.post(
      "https://ship.nimbuspost.com/api/v1/shipments",
      {
        order_number: order.orderId,
        payment_method: "Prepaid",

        consignee: {
          name: order.fullName,
          address: order.address,
          city: order.city,
          pincode: order.pincode,
          phone: order.phone,
        },

        product: [
          {
            name: "Product",
            quantity: 1,
            price: 500,
          },
        ],

        weight: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json(err.message);
  }
};