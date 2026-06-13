import { PublisherTracksView } from "@/components/account/PublisherTracksView";

interface PublisherTracksPageProps {
  params: Promise<{ id: string }>;
}

export default async function PublisherTracksPage({
  params,
}: PublisherTracksPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-3xl">
      <PublisherTracksView userId={id} />
    </div>
  );
}
