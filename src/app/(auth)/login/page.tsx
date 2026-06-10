import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-8 text-center text-3xl font-black tracking-tight text-black">
        Sign In
      </h1>
      <AuthForm mode="login" variant="light" />
    </div>
  );
}
