import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import hasloggedin from "../helper/hasloggedin";

function Dashboard() {
  const navigate = useNavigate();
  const [class_code, setClassCode] = useState();
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [error, setError] = useState(null);
  const studentDetails = JSON.parse(sessionStorage.getItem("user"));
  axios.defaults.withCredentials = true;
  useEffect(() => {
    if (!hasloggedin) navigate("/studentlogin");
    getLocation();
  }, [navigate]);
  const handleMarkAttendance = () => {
    if (isWithinRadius()) {
      axios
        .post("http://localhost:3001/api/operations/markattendance", {
          class_code,
          roll_no: studentDetails.roll_no,
        })
        .then(() => {
          alert("Attendance marked");
        })
        .catch(() => alert("Attendance can't be marked, try again!"));
    } else {
      alert("Proxy attendance suspected");
    }
  };
  const isWithinRadius = async () => {
    if (latitude && longitude) {
      await axios
        .get("http://localhost:3001/api/validate/getClass", {
          params: { class_code: class_code },
        })
        .then((res) => {
          console.log(res);
          const targetLatitude = res.data.subjectClasses.latitude;
          const targetLongitude = res.data.subjectClasses.longitude;
          const radius = 1000; // in square meter

          // Convert latitude and longitude difference to meters
          const latDiff = Math.abs(latitude - targetLatitude) * 111300;
          const lonDiff =
            Math.abs(longitude - targetLongitude) *
            111300 *
            Math.cos((targetLatitude * Math.PI) / 180);

          // Calculate distance in meters
          const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);

          // Check if the distance is within the radius
          return distance <= radius;
        })
        .catch((err) => {
          console.log(err);
        });
    }
    return false;
  };
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setError(null);
          console.log(latitude + " " + longitude);
        },
        (error) => {
          setError(error.message);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  const handleViewAttendance = () => 
    {
      navigate("/viewAttendance")
         
      
    }
  return (
    <div className="d-flex justify-content-center align-items-center bg-light vh-100">
      <div className="p-3 rounded w-15">
        <input
          type="text"
          placeholder="Enter Subject Class Code"
          autoComplete="off"
          name="class_code"
          className="form-control rounded-0"
          onChange={(e) => setClassCode(e.target.value)}
        />
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={handleMarkAttendance}
            className="btn btn-primary"
            style={{ marginRight: "10px" }}
          >
            Mark attendance
          </button>
          <button
            type="button"
            onClick={handleViewAttendance}
            className="btn btn-primary"
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            View attendance
          </button>
        </div>
        <p>{error}</p>
      </div>
    </div>
  );
}

export default Dashboard;
