// frontend/src/utils/validators.js

export const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch (err) {
    return false;
  }
};

export const isValidShortcode = (code) => {
  // Shortcode must be alphanumeric and between 3–20 characters (example constraint)
  return /^[a-zA-Z0-9_-]{3,20}$/.test(code);
};

export const isValidValidity = (val) => {
  if (val === "") return true; // Optional field
  const num = Number(val);
  return Number.isInteger(num) && num > 0;
};

// Full entry validator
export const validateEntry = (entry) => {
  const errors = {};

  if (!isValidUrl(entry.url)) {
    errors.url = "Invalid URL format.";
  }

  if (!isValidValidity(entry.validity)) {
    errors.validity = "Validity must be a positive integer.";
  }

  if (entry.shortcode && !isValidShortcode(entry.shortcode)) {
    errors.shortcode =
      "Shortcode must be 3-20 chars (alphanumeric, dash or underscore).";
  }

  return errors;
};
