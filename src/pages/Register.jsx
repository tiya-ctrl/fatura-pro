import { useEffect } from "react";

// /register is kept only as an entry point used by the static marketing pages.
// It sends visitors straight to the real sign-up screen with the plan chooser.
export default function Register() {
  useEffect(() => {
    const q = window.location.search || "";
    const sep = q ? "&" : "?";
    window.location.replace("/login" + q + sep + "signup=1");
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#08080e", color: "#9a9690",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "DM Sans, sans-serif", fontSize: 14 }}>
      One moment...
    </div>
  );
}
