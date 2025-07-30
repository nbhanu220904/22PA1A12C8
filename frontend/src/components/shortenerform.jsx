// frontend/src/components/ShortenerForm.jsx
// import { validateEntry } from '../utils/validators';
import { shortenUrls } from "../api/shorten";
import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import logger from "../middleware/logger";
import { validateEntry } from "../utills/validator";
import ShortenerList from "./shortenerlist";

const MAX_URLS = 5;

const ShortenerForm = () => {
  const [entries, setEntries] = useState([
    { url: "", validity: "", shortcode: "" },
  ]);
  const [shortened, setShortened] = useState([]);
  const handleChange = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const addUrlField = () => {
    if (entries.length < MAX_URLS) {
      setEntries([...entries, { url: "", validity: "", shortcode: "" }]);
    }
  };

  const removeUrlField = (index) => {
    const updated = entries.filter((_, i) => i !== index);
    setEntries(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allErrors = entries.map(validateEntry);
    const hasErrors = allErrors.some((error) => Object.keys(error).length > 0);
    if (hasErrors) {
      logger.warn("Validation failed", { allErrors });
      alert("Validation failed. Please check your input fields.");
      return;
    }

    logger.info("Form submitted with entries", { entries });

    try {
      const result = await shortenUrls(entries);
      setShortened(result);
      logger.debug("Shortened result:", { result });
    } catch (err) {
      logger.error("Failed to shorten URLs", { error: err });
      alert("Failed to shorten URLs. Check logs for details.");
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom>
        URL Shortener
      </Typography>

      <form onSubmit={handleSubmit}>
        {entries.map((entry, index) => (
          <Paper key={index} elevation={3} sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Original URL"
                  variant="outlined"
                  fullWidth
                  required
                  value={entry.url}
                  onChange={(e) => handleChange(index, "url", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Validity (minutes)"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={entry.validity}
                  onChange={(e) =>
                    handleChange(index, "validity", e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Preferred Shortcode"
                  variant="outlined"
                  fullWidth
                  value={entry.shortcode}
                  onChange={(e) =>
                    handleChange(index, "shortcode", e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12}>
                {entries.length > 1 && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeUrlField(index)}
                  >
                    Remove
                  </Button>
                )}
              </Grid>
            </Grid>
          </Paper>
        ))}

        {entries.length < MAX_URLS && (
          <Button onClick={addUrlField} variant="contained" sx={{ mb: 2 }}>
            + Add Another URL
          </Button>
        )}

        <Box textAlign="center">
          <Button type="submit" variant="contained" color="primary">
            Shorten URLs
          </Button>
        </Box>
        <ShortenerList urls={shortened} />
      </form>
    </Container>
  );
};

export default ShortenerForm;
