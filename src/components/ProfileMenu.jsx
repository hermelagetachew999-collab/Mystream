// src/components/ProfileMenu.jsx
import { useState } from "react";

function ProfileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="position-relative">
      <img
        onClick={() => setOpen(!open)}
        src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
        alt="profile"
        style={{ width: 40, cursor: "pointer" }}
      />

      {open && (
        <div
          className="position-absolute bg-dark text-white p-3 rounded"
          style={{ right: 0, top: 50, width: 150 }}
        >
          <p className="mb-1">Profile</p>
          <p className="mb-1">Settings</p>
          <p className="mb-0">Logout</p>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
