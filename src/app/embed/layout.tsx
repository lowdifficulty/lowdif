export default function EmbedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="m-0 min-h-0 overflow-hidden bg-black">{children}</div>;
}
