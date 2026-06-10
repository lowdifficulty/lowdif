import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function ArtistSignupPage() {
  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-8 text-center text-3xl font-black tracking-tight text-black">
        Create Account
      </h1>
      <AuthForm mode="signup" defaultRole="ARTIST" variant="light" />
      <p className="mt-6 text-center text-sm text-black/45">
        <Link href="/signup" className="text-black underline">
          Listener signup
        </Link>
        {" · "}
        <Link href="/login" className="text-black underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
