"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSignin } from "../../hooks/useSignin";
import { useRouter } from "next/navigation";
import { setTokens } from "@/src/lib/utils/cookies";
import { Lock, Eye, EyeOff } from "lucide-react";
import { TrackrLogoSvg, EmailIconSvg, GoogleIconSvg } from "@/src/assets/svgs";
import { colors } from "@/src/styles/colors";

export const SignIn = () => {
  const { handleSignIn, isLoading, error } = useSignin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      //   const response = await handleSignIn({ email, password, rememberMe });
      //   setTokens(response.data.token);
      setTokens("uadsdbasdasosn");
      router.push("/dashboard");
    } catch {
      // Error is handled by the hook and exposed via error state
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
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
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
          <Link href="/forgot-password" className="forgotPassword">
            Forgot Password?
          </Link>
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

      <div className="divider">or continue with</div>

      <button type="button" className="googleBtn">
        <GoogleIconSvg />
        Continue with Google
      </button>

      <div className="signupPrompt">
        Don&apos;t have an account?
        <Link href="/signup" className="signupLink">
          Create account
        </Link>
      </div>
    </div>
  );
};
