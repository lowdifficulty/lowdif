import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

interface SignupPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { email } = await searchParams;

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-8 text-center text-3xl font-black tracking-tight text-black">
        Create Account
      </h1>
      <AuthForm mode="signup" variant="light" defaultEmail={email ?? ""} />
      <p className="mt-6 text-center text-sm text-black/45">
        Listen, upload, and mine LOWDIF with one account.{" "}
        <Link href="/whitepaper" className="text-black underline">
          Read the whitepaper
        </Link>
      </p>
    </div>
  );
}
