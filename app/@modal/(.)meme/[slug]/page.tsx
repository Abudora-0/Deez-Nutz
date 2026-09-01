import { notFound } from "next/navigation";
import { Modal } from "@/components/meme/Modal";
import { MemeDetail } from "@/components/meme/MemeDetail";
import { resolveMeme } from "@/lib/gallery";

export const dynamicParams = true;

export default async function InterceptedMemePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meme = await resolveMeme(slug);
  if (!meme) notFound();

  return (
    <Modal>
      <MemeDetail meme={meme} variant="modal" />
    </Modal>
  );
}
