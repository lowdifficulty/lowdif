import { ProfileView } from "@/components/account/ProfileView";

interface PublicProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-3xl">
      <ProfileView userId={id} />
    </div>
  );
}
