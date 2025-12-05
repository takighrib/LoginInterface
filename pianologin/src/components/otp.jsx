import { useState } from "react";
import axios from "axios";
import './otpLogin.css';
const OTPLogin = ({ email, onSuccess }) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email,
        otp,
      });

      if (res.data.success) {
        onSuccess(); // Appeler callback pour rediriger l'utilisateur
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-login">
      <h2>Entrez votre code OTP</h2>
      <form onSubmit={handleSubmit}>
    <div className="form-group">
      <label htmlFor="otp">Code OTP</label>
      <input
        type="text"
        id="otp"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Entrez votre code OTP"
        maxLength={6}
        className="email-input" 
        style={{ color: "black" }}
        required
      />
    </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Vérification..." : "Valider"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default OTPLogin;
