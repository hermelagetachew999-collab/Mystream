// src/App.jsx
import React, { useEffect, useState } from "react";
import ProfileGate from "./components/ProfileGate.jsx";
import Home from "./components/Home.jsx";
import { APP_NAME, ACCENT_COLOR } from "./config";

function App() {
  const [profile, setProfile] = useState(null); // { name, ageGroup }
  const [showProfileGate, setShowProfileGate] = useState(true);

  useEffect(() => {
    // If we previously saved profile, use it
    const saved = localStorage.getItem("netflix_profile");
    if (saved) {
      setProfile(JSON.parse(saved));
      setShowProfileGate(false);
    }
  }, []);

  const handleProfileComplete = (profileData) => {
    setProfile(profileData);
    localStorage.setItem("netflix_profile", JSON.stringify(profileData));
    setShowProfileGate(false);
    
    // Force full page reload when profile changes → guarantees fresh hero every time
    window.location.reload();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff" }}>
      <style>{`
        :root { --accent: ${ACCENT_COLOR}; }
      `}</style>

      {showProfileGate ? (
        <ProfileGate onComplete={handleProfileComplete} />
      ) : (
        // The key forces React to treat it as a brand new Home component when ageGroup changes
        <Home key={profile?.ageGroup || 'default'} profile={profile} appName={APP_NAME} />
      )}
    </div>
  );
}

export default App;