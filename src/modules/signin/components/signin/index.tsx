"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSignin } from "../../hooks/useSignin";
import { useRouter } from "next/navigation";
import { setTokens } from "@/src/lib/utils/cookies";
import { Lock, Eye, EyeOff } from "lucide-react";
import { TrackrLogoSvg, EmailIconSvg, GoogleIconSvg, CloseIconSvg } from "@/src/assets/svgs";
import { colors } from "@/src/styles/colors";

export const SignIn = () => {
  const { handleSignIn, handleForgotPassword, handleResetPasswordConfirm, isLoading, error } = useSignin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const [showForgotSidebar, setShowForgotSidebar] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);
  const [forgotErrorMsg, setForgotErrorMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await handleSignIn({ email, password, rememberMe });
      if (response.data) {
        setTokens(response.data.access_token, response.data.refresh_token);
      }
      router.push("/dashboard");
    } catch {
      // Error is handled by the hook and exposed via error state
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccessMessage(null);
    setForgotErrorMsg(null);
    try {
      const response = await handleForgotPassword(forgotEmail);
      setForgotSuccessMessage(response?.message || "Reset link sent successfully to your email.");
      setForgotStep(2);
    } catch (err: unknown) {
      setForgotErrorMsg(err instanceof Error ? err.message : "Failed to send reset link");
      throw err;
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !resetOtp || !resetNewPassword) return;
    setForgotSuccessMessage(null);
    setForgotErrorMsg(null);
    try {
      const response = await handleResetPasswordConfirm({
        email: forgotEmail,
        otp: resetOtp,
        new_password: resetNewPassword
      });
      setForgotSuccessMessage(response?.message || "Password reset successfully.");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: unknown) {
      setForgotErrorMsg(err instanceof Error ? err.message : "Failed to reset password");
    }
  };

  return (
    <div className="signinContainer">
      <div className="logo">
        <div className="logoIcon">
          <TrackrLogoSvg />
        </div>
        WorkPilot
      </div>

      <h1 className="signinTitle">Welcome back</h1>
      <h2 className="subtitle">Sign in to your workspace to continue.</h2>

      <form onSubmit={onSubmit} style={{ width: "100%" }}>
        <div className="formGroup">
          <label className="label" htmlFor="email">
            Email Address
          </label>
          <div className="inputWrapper">
            <EmailIconSvg />
            <input
              type="email"
              id="email"
              className="input"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="formGroup">
          <label className="label" htmlFor="password">
            Password
          </label>

          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full"
              style={{ paddingLeft: '40px', paddingRight: '40px' }}
              required
              minLength={8}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="optionsRow">
          <label className="rememberMe">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>
          <button
            type="button"
            onClick={() => {
              setForgotSuccessMessage(null);
              setForgotErrorMsg(null);
              setForgotStep(1);
              setShowForgotSidebar(true);
            }}
            className="forgotPassword"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            Forgot Password?
          </button>
        </div>

        {error && (
          <div
            style={{
              color: colors.error,
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <button type="submit" className="submitBtn" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* For now comment this code 
       <div className="divider">or continue with</div>

      <button type="button" className="googleBtn">
        <GoogleIconSvg />
        Continue with Google
      </button> */}
  
      <div className="signupPrompt">
        Don&apos;t have an account?
        <Link href="/signup" className="signupLink">
          Create account
        </Link>
      </div>

      {showForgotSidebar && (
        <div
          className="fixed inset-0 z-[999] flex justify-end bg-black/50"
          onClick={() => setShowForgotSidebar(false)}
        >
          <div
            className="flex h-screen w-full max-w-[600px] animate-[slideIn_0.3s_ease-out] flex-col bg-white p-10 shadow-[-4px_0_15px_rgba(0,0,0,0.1)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute right-6 top-6 flex items-center justify-center rounded-full border-none bg-transparent p-2 cursor-pointer transition-colors hover:bg-gray-100"
              onClick={() => setShowForgotSidebar(false)}
            >
              <CloseIconSvg />
            </button>

            <div className="mt-5 mb-10 flex items-center text-2xl font-bold">
              <div className="mr-3 h-8 w-8 rounded-lg bg-[#0d6efd]">
                <TrackrLogoSvg />
              </div>
              WorkPilot
            </div>

            <h1 className="mb-2 text-[28px] font-bold text-gray-900">Forgot Password?</h1>
            <p className="mb-8 text-sm text-gray-500">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={forgotStep === 1 ? handleForgotSubmit : handleResetSubmit} className="w-full">
              <div className="mb-6 w-full">
                <label className="mb-2 block text-sm font-bold text-gray-800" htmlFor="forgotEmail">
                  Email Address
                </label>
                <div className="relative w-full">
                  <EmailIconSvg />
                  <input
                    type="email"
                    id="forgotEmail"
                    className="input"
                    placeholder="name@company.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    disabled={forgotStep === 2}
                  />
                </div>
              </div>

              {forgotStep === 2 && (
                <>
                  <div className="mb-6 w-full">
                    <label className="mb-2 block text-sm font-bold text-gray-800" htmlFor="resetOtp">
                      OTP
                    </label>
                    <div className="relative w-full">
                      <input
                        type="text"
                        id="resetOtp"
                        className="input !pl-3"
                        placeholder="Enter OTP"
                        value={resetOtp}
                        onChange={(e) => setResetOtp(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-6 w-full">
                    <label className="mb-2 block text-sm font-bold text-gray-800" htmlFor="resetNewPassword">
                      New Password
                    </label>
                    <div className="relative w-full">
                      <Lock
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type={showResetPassword ? "text" : "password"}
                        id="resetNewPassword"
                        className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                        aria-label={showResetPassword ? "Hide password" : "Show password"}
                      >
                        {showResetPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {forgotErrorMsg && (
                <div className="mb-4 text-sm text-red-500">
                  {forgotErrorMsg}
                </div>
              )}

              {forgotSuccessMessage && (
                <div className="mb-4 text-sm text-green-600">
                  {forgotSuccessMessage}
                </div>
              )}

              <button
                type="submit"
                className="mb-4 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                disabled={isLoading || !forgotEmail || (forgotStep === 2 && (!resetOtp || !resetNewPassword))}
              >
                {isLoading ? (forgotStep === 1 ? "Sending link..." : "Resetting Password...") : (forgotStep === 1 ? "Send Reset Link" : "Reset Password")}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setShowForgotSidebar(false)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
