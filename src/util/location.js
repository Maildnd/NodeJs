const axios = require("axios");

const HttpError = require("../models/http-error");

const { GOOGLE_API_KEY, GOOGLE_GEOCODE_URL } = require("../../config-global");

async function getCoordsForAddress(address) {
  const response = await axios.get(
    `${GOOGLE_GEOCODE_URL}?address=${encodeURIComponent(
      address
    )}&key=${GOOGLE_API_KEY}`
  );

  const data = response.data;

  if (!data || data.status === "ZERO_RESULTS") {
    const error = new HttpError(
      "Could not find location for the specified address.",
      422
    );
    throw error;
  }

  const coordinates = data.results[0].geometry.location;

  return coordinates;
}

module.exports = getCoordsForAddress;
