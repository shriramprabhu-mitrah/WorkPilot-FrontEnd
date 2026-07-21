"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSignup } from "../../hooks/useSignup";
import { useRouter } from "next/navigation";
import { TermsConditions } from "../../../../app/components/common/terms-coditions";
import { PrivacyPolicy } from "../../../../app/components/common/privacy";
import { Eye, EyeOff } from "lucide-react";
import {
  TrackrLogoSvg,
  EmailIconSvg,
  UserIconSvg,
  LockIconSvg,
  CloseIconSvg,
} from "@/src/assets/svgs";
import { colors } from "@/src/styles/colors";

export const SignUp = () => {
  const { handleSignUp, isLoading, error } = useSignup();
  const [full_name, setName] = useState("");
  const [username, setuserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [sidebarContent, setSidebarContent] = useState<
    "terms" | "privacy" | null
  >(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const passwordsMatch = password === confirmPwd;
  const isFormValid =
    full_name.trim() !== "" &&
    username.trim() !=="" &&
    email.trim() !== "" &&
    password !== "" &&
    confirmPwd !== "" &&
    passwordsMatch &&
    agreedToTerms;

  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await handleSignUp({ full_name, username, email, password, timezone });
      setIsSuccess(true);
    } catch {}
  };

  return (
    <div className="signinContainer">
      {isSuccess ? (
        <div className="flex w-full flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
          </div>
          <h1 className="signinTitle mb-4">Account created!</h1>
          <p className="mb-8 text-sm leading-[1.6] text-gray-500">
            As a <strong className="text-gray-900 dark:text-gray-100">User</strong>, you need an invitation to join an organization.<br/>
            Ask your Organization Admin to invite you via email.
          </p>
          
          <div className="mb-10 w-full rounded-xl border border-amber-200 bg-amber-50 p-6 text-left dark:border-amber-900 dark:bg-amber-900/20">
            <h3 className="mb-3 text-sm font-semibold text-amber-700 dark:text-amber-500">What happens next?</h3>
            <ul className="m-0 flex flex-col gap-2 pl-5 text-[13px] text-amber-600 dark:text-amber-400">
              <li>Your Organization Admin sends you an invite link</li>
              <li>Click the link to join their workspace</li>
              <li>Start collaborating immediately</li>
            </ul>
          </div>
          
          <button 
            type="button" 
            onClick={() => router.push("/signin")}
            className="cursor-pointer border-none bg-transparent text-[15px] font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <>
          <div className="logo">
            <div className="logoIcon">
              <TrackrLogoSvg />
            </div>
            WorkPilot
          </div>

          <h1 className="signinTitle">Create your account</h1>
          <h2 className="subtitle">Get started free — no credit card required.</h2>

      <form onSubmit={onSubmit} style={{ width: "100%" }}>
        <div className="formGroup">
          <label className="label" htmlFor="name">
            Full Name
          </label>
          <div className="inputWrapper">
            <UserIconSvg />
            <input
              type="text"
              id="name"
              className="input"
              placeholder="Jane Smith"
              value={full_name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="formGroup">
          <label className="label" htmlFor="username">
            User Name
          </label>
          <div className="inputWrapper">
            <UserIconSvg />
            <input
              type="text"
              id="username"
              className="input"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setuserName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="formGroup">
          <label className="label" htmlFor="email">
            Work Email
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
          <div className="inputWrapper">
            <LockIconSvg />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="input"
              placeholder="8+ characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="formGroup" style={{ marginBottom: "32px" }}>
          <label className="label" htmlFor="confirmPwd">
            Confirm Password
          </label>
          <div className="inputWrapper">
            <LockIconSvg />
            <input
              type={showConfirmPwd ? "text" : "password"}
              id="confirmPwd"
              className="input"
              placeholder="Re-enter your password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPwd((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {password && confirmPwd && !passwordsMatch && (
            <div
              style={{
                color: colors.error,
                fontSize: "12px",
                marginTop: "4px",
              }}
            >
              Passwords do not match
            </div>
          )}
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

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            marginBottom: "24px",
            fontSize: "12px",
            color: colors.gray500,
          }}
        >
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            style={{ marginTop: "2px", cursor: "pointer" }}
          />
          <label htmlFor="terms" style={{ cursor: "pointer" }}>
            By continuing you agree to our{" "}
            <button
              type="button"
              onClick={() => setSidebarContent("terms")}
              style={{
                color: colors.primaryFocus,
                textDecoration: "none",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: "inherit",
                fontFamily: "inherit",
              }}
            >
              Terms
            </button>{" "}
            and{" "}
            <button
              type="button"
              onClick={() => setSidebarContent("privacy")}
              style={{
                color: colors.primaryFocus,
                textDecoration: "none",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: "inherit",
                fontFamily: "inherit",
              }}
            >
              Privacy Policy
            </button>
          </label>
        </div>

        <button
          type="submit"
          className="submitBtn"
          disabled={isLoading || !isFormValid}
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="signupPrompt" style={{ marginTop: "24px" }}>
        Already have an account?
        <Link href="/signin" className="signupLink">
          Sign in
        </Link>
      </div>

      {sidebarContent && (
        <div className="sidebarOverlay" onClick={() => setSidebarContent(null)}>
          <div
            className="sidebarContainer"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="sidebarCloseBtn"
              onClick={() => setSidebarContent(null)}
            >
              <CloseIconSvg />
            </button>
            {sidebarContent === "terms" ? (
              <TermsConditions />
            ) : (
              <PrivacyPolicy />
            )}
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};
