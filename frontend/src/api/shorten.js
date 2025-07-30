// frontend/src/api/shorten.js

import logger from "../middleware/logger";

const API_BASE_URL = "http://localhost:5000"; // Replace with your backend base URL if different

export const shortenUrls = async (entries) => {
  try {
    const response = await fetch(`${API_BASE_URL}/shorturls/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entries),
    });

    const data = await response.json();

    if (!response.ok) {
      logger.error("Failed to shorten URLs", { response: data });
      throw new Error(data.error || "Unknown error");
    }

    logger.info("Shortened URLs successfully", { result: data });
    return data;
  } catch (err) {
    logger.error("Error during URL shortening", { message: err.message });
    throw err;
  }
};
