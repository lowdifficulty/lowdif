import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-8 text-center text-3xl font-black tracking-tight text-black">
        Create Account
      </h1>
      <AuthForm mode="signup" defaultRole="LISTENER" variant="light" />
      <p className="mt-6 text-center text-sm text-black/45">
        <Link href="/artist/signup" className="text-black underline">
          Sign up as an artist
        </Link>
      </p>
    </div>
  );
}
