// src/components/ProfileGate.jsx
import { useState } from "react";

const steps = ["age", "name"];

function ProfileGate({ onComplete }) {
  const [step, setStep] = useState(0);
  const [ageGroup, setAgeGroup] = useState(null); // 'kid' | 'adult' | 'elder'
  const [name, setName] = useState("");

  const next = () => {
    if (step === 0 && !ageGroup) return;
    if (step === 1 && name.trim().length < 1) return;
    if (step < steps.length - 1) setStep(s => s + 1);
    else finish();
  };
  const prev = () => setStep(s => Math.max(0, s - 1));

  const finish = () => {
    onComplete({ name: name.trim(), ageGroup });
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 gap-4 bg-black p-4">
      <h1 className="display-4">Who's watching?</h1>

      {step === 0 && (
        <div className="d-flex gap-4 flex-column align-items-center">
          <p className="lead">Choose an age group</p>
          <div className="d-flex gap-3">
            <button className={`btn ${ageGroup === 'kid' ? 'btn-primary' : 'btn-outline-light'}`} onClick={() => setAgeGroup('kid')}>Kid</button>
            <button className={`btn ${ageGroup === 'adult' ? 'btn-primary' : 'btn-outline-light'}`} onClick={() => setAgeGroup('adult')}>Adult</button>
            <button className={`btn ${ageGroup === 'elder' ? 'btn-primary' : 'btn-outline-light'}`} onClick={() => setAgeGroup('elder')}>Elder</button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="d-flex flex-column align-items-center">
          <p className="lead">What's your name?</p>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="form-control text-center" style={{width: 300}} />
        </div>
      )}

      <div className="d-flex gap-3 mt-3">
        <button className="btn btn-secondary" onClick={prev} disabled={step === 0}>Previous</button>
        <button className="btn btn-primary" onClick={next}>{step === steps.length - 1 ? 'Finish' : 'Next'}</button>
      </div>
    </div>
  );
}

export default ProfileGate;
