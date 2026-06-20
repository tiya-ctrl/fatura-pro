import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthChange } from "./auth";

import LandingPage from "./pages/Landing";
import InvoiceApp from "./pages/InvoiceApp";
import Login from "./pages/Login";
import Register from "./pages/Register";

/* ───────── Landing ───────── */
function LandingWrapper() {
  const navigate = useNavigate();

  return <LandingPage onOpenApp={() => navigate("/login")} />;
}

/* ───────── Login ───────── */
function LoginWrapper() {
  const navigate = useNavigate();

  return (
    <Login
      onLogin={() => navigate("/app")}
      onBack={() => navigate("/")}
    />
  );
}

/* ───────── Register ───────── */
function RegisterWrapper() {
  const navigate = useNavigate();

  return (
    <Register
      onRegister={() => navigate("/app")}
      onBack={() => navigate("/login")}
    />
  );
}

/* ───────── Protected App ───────── */
function InvoiceWrapper() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });

    return unsub;
  }, []);

  if (loading) return null;

  if (!user) return <Login />;

  return <InvoiceApp user={user} onGoHome={() => navigate("/")} />;
}

/* ───────── Routes ───────── */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingWrapper />} />
      <Route path="/login" element={<LoginWrapper />} />
      <Route path="/register" element={<RegisterWrapper />} />
      <Route path="/app" element={<InvoiceWrapper />} />
      <Route path="*" element={<LandingWrapper />} />
    </Routes>
  );
}

/* ───────── Main App ───────── */
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}