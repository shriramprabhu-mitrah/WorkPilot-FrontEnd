import { SignInTemplate } from "@/src/modules/signin/templates";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In - Trackr",
    description: "Sign in to your Trackr workspace",
};

export default function SignInPage() {
    return <SignInTemplate />;
}
