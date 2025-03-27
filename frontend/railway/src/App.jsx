import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Add Bootstrap for styling

const App = () => {
  const [motionData, setMotionData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [motionFilter, setMotionFilter] = useState("all"); // all, detected, not-detected

  useEffect(() => {
    fetch("http://localhost:5000/get-motion-data")
      .then((response) => response.json())
      .then((data) => {
        if (data && typeof data === "object") {
          const formattedData = Object.entries(data).map(([id, value]) => ({
            id,
            ...value,
          }));
          setMotionData(formattedData);
          setFilteredData(formattedData);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  // Filtering function
  const filterData = () => {
    let filtered = motionData;

    // Filter by date range
    if (startDate && endDate) {
      filtered = filtered.filter((log) => {
        const logDate = new Date(log.motion.start_time);
        return logDate >= new Date(startDate) && logDate <= new Date(endDate);
      });
    }

    // Filter by motion detected
    if (motionFilter !== "all") {
      const isDetected = motionFilter === "detected" ? 1 : 0;
      filtered = filtered.filter((log) => log.motion.detected === isDetected);
    }

    setFilteredData(filtered);
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center">📡 Motion Sensor Data</h2>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-3">
          <label>Start Date:</label>
          <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="col-md-3">
          <label>End Date:</label>
          <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="col-md-3">
          <label>Motion Detected:</label>
          <select className="form-control" value={motionFilter} onChange={(e) => setMotionFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="detected">Detected</option>
            <option value="not-detected">Not Detected</option>
          </select>
        </div>
        <div className="col-md-3 d-flex align-items-end">
          <button className="btn btn-primary w-100" onClick={filterData}>Apply Filters</button>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredData.length === 0 ? (
        <p>No motion data found.</p>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="thead-dark">
            <tr>
              <th>ID</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Motion Detected</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Duration (seconds)</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((log) => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.location?.latitude}</td>
                <td>{log.location?.longitude}</td>
                <td>{log.motion?.detected ? "Yes" : "No"}</td>
                <td>{log.motion?.start_time}</td>
                <td>{log.motion?.end_time}</td>
                <td>{log.motion?.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default App;
