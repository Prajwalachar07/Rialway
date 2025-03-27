const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

// Firebase Configuration
const serviceAccount = require("./firebase-key.json"); // Replace with your actual Firebase JSON key file

// Initialize Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "DB_URL" // Replace with your Firebase Database URL
});

const db = admin.database();
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Endpoint to Fetch Motion Data
app.get("/get-motion-data", async (req, res) => {
    try {
        const ref = db.ref("motion_logs");
        const snapshot = await ref.once("value");
        const data = snapshot.val();

        if (!data) {
            return res.status(404).json({ message: "No motion data found" });
        }

        return res.json(data);
    } catch (error) {
        console.error("Error fetching motion data:", error);
        return res.status(500).json({ error: "Server error" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
