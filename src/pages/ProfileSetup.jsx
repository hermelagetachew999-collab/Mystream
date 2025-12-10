import { useNavigate } from "react-router-dom";

export default function ProfileSetup() {
  const navigate = useNavigate();

  function selectType(type) {
    localStorage.setItem("profileType", type);
    navigate("/name");
  }

  return (
    <div className="setup-page">
      <h1>Who Are You?</h1>

      <div className="options">
        <button onClick={() => selectType("kid")}>Kid</button>
        <button onClick={() => selectType("adult")}>Adult</button>
        <button onClick={() => selectType("elder")}>Elder</button>
      </div>

      <p className="next-text">Choose one to continue</p>
    </div>
  );
}
