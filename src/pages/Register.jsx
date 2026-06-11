import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 40 }}>
      <h1>Register Page ✍️</h1>

      <button onClick={() => navigate("/app")}>
        Create Account
      </button>
    </div>
  );
}