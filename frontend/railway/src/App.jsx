import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  const [motionData, setMotionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/get-motion-data");
        const data = await response.json();
        setMotionData(data);
        setLoading(false);

        // Refresh location & weather after initial data load
        setTimeout(() => {
          setMotionData((prevData) =>
            prevData.map((item) => ({
              ...item,
              location: item.location !== "Fetching..." ? item.location : "Unknown",
              weather: item.weather !== "Fetching..." ? item.weather : "No data",
            }))
          );
        }, 5000); // Wait 5s to update
      } catch (error) {
        console.error("Error fetching data:", error);
        setMotionData([]);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="text-center">📡 Motion Sensor Data</h2>

      {loading ? (
        <p>Loading...</p>
      ) : motionData.length === 0 ? (
        <p>No motion data found.</p>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="thead-dark">
            <tr>
              <th>ID</th>
              <th>Motion</th>
              <th>Timestamp</th>
              <th>Location</th>
              <th>Weather</th>
            </tr>
          </thead>
          <tbody>
            {motionData.map((log) => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.motion}</td>
                <td>{log.timestamp}</td>
                <td>{log.location}</td>
                <td>{log.weather}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default App;
