import axios from "axios";

export const getNimbusToken = async () => {
  const res = await axios.post(
    "https://ship.nimbuspost.com/api/v1/auth/login",
    {
      email: process.env.NIMBUS_EMAIL,
      password: process.env.NIMBUS_PASSWORD,
    }
  );

  return res.data.data;
};