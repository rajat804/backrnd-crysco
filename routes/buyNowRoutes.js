const handleBuyNow = async () => {
  if (!size) return alert("Select size");

  const res = await fetch(`${BASE_URL}/api/orders/buy-now`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      product: {
        _id: product._id,
        title: product.title,
        price: product.salePrice,
        size,
        image: product.images[0],
      },
      quantity,
    }),
  });

  const data = await res.json();

  const options = {
    key: data.key, // ✅ backend se aa rahi
    amount: data.amount,
    currency: data.currency,
    order_id: data.orderId,
    name: "Monster Store",
    description: "Buy Now Payment",

    handler: async function (response) {
      await fetch(`${BASE_URL}/api/orders/verify-buy-now`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...response,
          product: {
            _id: product._id,
            title: product.title,
            price: product.salePrice,
            size,
            image: product.images[0],
          },
          quantity,
          shippingAddress,
        }),
      });

      alert("Order Placed Successfully");
      window.location.href = "/my-orders";
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};