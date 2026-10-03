import type { Metadata } from "next";

import { DocumentsView } from "@/components/documents/DocumentsView";

export const metadata: Metadata = { title: "Τα βιβλία μου" };

export default function DocumentsPage() {
  return <DocumentsView />;
}
