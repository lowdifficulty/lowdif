import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-16 text-black">
      <Link
        href="/"
        className="mb-12 text-lg font-black tracking-tight text-black"
      >
        LOWDIF
      </Link>
      {children}
    </div>
  );
}
