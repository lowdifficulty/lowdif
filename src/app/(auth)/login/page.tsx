import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-8 text-center text-3xl font-black tracking-tight text-black">
        Sign In
      </h1>
      <AuthForm mode="login" variant="light" />
      <p className="mt-6 text-center text-sm text-black/45">
        <Link href="/signup" className="text-black underline">
          Join the movement
        </Link>
        {" · "}
        <Link href="/whitepaper" className="text-black underline">
          Whitepaper
        </Link>
      </p>
    </div>
  );
}
