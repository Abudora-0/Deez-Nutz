import type { Metadata } from "next";
import { FavoritesClient } from "@/components/gallery/FavoritesClient";

export const metadata: Metadata = {
  title: "Your Stash",
  description: "The memes you hoarded, ready to download in one zip.",
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
