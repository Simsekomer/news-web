"use client";

import { useState } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function postJson(path, body) {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async function handleSendCode(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { ok, data } = await postJson("/api/auth/forgot-password", { email });
      if (!ok) {
        setError(data.message);
        return;
      }
      setMessage(data.message);
      setStep("reset");
    } catch {
      setError("Could not connect to the server");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { ok, data } = await postJson("/api/auth/reset-password", {
        email,
        code,
        password,
      });
      if (!ok) {
        setError(data.message);
        return;
      }
      setStep("done");
    } catch {
      setError("Could not connect to the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 420 }}>
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h1 className="h4 text-center mb-3">Forgot password</h1>

          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-info">{message}</div>}

          {step === "email" && (
            <form onSubmit={handleSendCode}>
              <p className="text-muted small text-center mb-4">
                Enter your email and we will send you a 6-digit reset code.
              </p>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Sending..." : "Send code"}
              </button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleReset}>
              <div className="mb-3">
                <label className="form-label">Reset code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="form-control text-center fs-4"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">New password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Confirm new password</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Saving..." : "Reset password"}
              </button>
              <button
                type="button"
                className="btn btn-link w-100 mt-2"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setMessage("");
                  setError("");
                }}
              >
                Send a new code
              </button>
            </form>
          )}

          {step === "done" && (
            <div className="alert alert-success">
              Your password has been reset. <Link href="/login">Log in</Link>
            </div>
          )}

          {step !== "done" && (
            <p className="text-center mt-3 mb-0">
              <Link href="/login">Back to login</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}