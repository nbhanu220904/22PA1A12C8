// frontend/src/api/stats.js

import logger from "../middleware/logger";

const API_BASE_URL = "http://localhost:5000"; // Adjust if your backend runs elsewhere

export const getStatsByShortcode = async (shortcode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/shorturls/${shortcode}`, {
      method: "GET",
    });

    const data = await response.json();

    if (!response.ok) {
      logger.error("Failed to fetch stats", { shortcode, error: data });
      throw new Error(data.error || "Failed to fetch stats");
    }

    logger.info("Fetched stats for shortcode", { shortcode, data });
    return data;
  } catch (err) {
    logger.error("Stats fetch error", { shortcode, message: err.message });
    throw err;
  }
};
