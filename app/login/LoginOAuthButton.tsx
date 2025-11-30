"use client";
import { signIn } from "next-auth/react";

export default function LoginOAuthButton() {
  return (
    <button onClick={() => signIn("google")}
      style={{padding: "0.5rem 1rem", background: "#4285F4", color: "white", border: "none", borderRadius: "4px"}}>
      Iniciar sesión con Google
    </button>
  );
}
