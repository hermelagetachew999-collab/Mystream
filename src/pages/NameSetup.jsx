import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NameSetup() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  function finish() {
    if (!name.trim()) return;
    localStorage.setItem("profileName", name.trim());
    navigate("/home");
  }

  return (
    <div className="setup-page">
      <h1>Your Name?</h1>

      <input
        className="name-input"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button className="next-btn" onClick={finish}>Continue</button>
    </div>
  );
}
