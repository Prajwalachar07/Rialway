const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const axios = require("axios");

const serviceAccount = require("./firebase-key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "Your_DB-URL"
});

const db = admin.database();
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const API_KEY = "Your_OpenWheather_api-key"; // Replace with your actual API key
const locationCache = new Map(); // Cache for location data
const weatherCache = new Map();  // Cache for weather data

// Convert timestamp to readable format
const convertTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toISOString().replace("T", " ").split(".")[0];
};

// Get location based on lat/lon (with caching)
const getLocation = async (latitude, longitude) => {
    const key = `${latitude},${longitude}`;
    if (locationCache.has(key)) return locationCache.get(key);

    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const location = response.data.address.city || response.data.address.town || response.data.address.village || "Unknown Location";
        locationCache.set(key, location); // Store in cache
        return location;
    } catch (error) {
        console.error("Error fetching location:", error);
        return "Unknown Location";
    }
};

// Get weather data (with caching)
const getWeather = async (latitude, longitude) => {
    const key = `${latitude},${longitude}`;
    if (weatherCache.has(key)) return weatherCache.get(key);

    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
        const weather = response.data.weather[0].description + `, ${response.data.main.temp}°C`;
        weatherCache.set(key, weather); // Store in cache
        return weather;
    } catch (error) {
        console.error("Error fetching weather:", error);
        return "Weather data unavailable";
    }
};

// Fetch motion data API (asynchronous response)
app.get("/get-motion-data", async (req, res) => {
    try {
        const ref = db.ref("pir/data");
        const snapshot = await ref.once("value");
        const rawData = snapshot.val();

        if (!rawData) return res.status(404).json({ message: "No motion data found" });

        // Step 1: Send a quick response without location & weather
        let responseData = Object.entries(rawData).map(([id, entry]) => ({
            id,
            motion: entry.motion === 1 ? "Moving" : "Resting",
            timestamp: convertTimestamp(entry.timestamp),
            location: "Fetching...",
            weather: "Fetching..."
        }));

        res.json(responseData);

        // Step 2: Fetch location & weather in the background
        for (let item of responseData) {
            if (item.motion === "Moving") {
                const lat = 12.9716; // Replace with actual latitude from sensor
                const lon = 77.5946; // Replace with actual longitude from sensor

                item.location = await getLocation(lat, lon);
                item.weather = await getWeather(lat, lon);
            } else {
                item.location = "N/A";
                item.weather = "N/A";
            }
        }
    } catch (error) {
        console.error("Error fetching motion data:", error);
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
