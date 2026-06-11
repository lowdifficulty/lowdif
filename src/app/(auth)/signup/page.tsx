import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-8 text-center text-3xl font-black tracking-tight text-black">
        Create Account
      </h1>
      <AuthForm mode="signup" variant="light" />
      <p className="mt-6 text-center text-sm text-black/45">
        Listen, upload, and mine LOWDIF with one account.{" "}
        <Link href="/whitepaper" className="text-black underline">
          Read the whitepaper
        </Link>
      </p>
    </div>
  );
}
