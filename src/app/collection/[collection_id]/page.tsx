import { VideoProvider } from "@/app/appContext/videoDetail";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import SelectGroupOne from "@/components/SelectGroup/SelectGroupOne";
import CollectionPage from "@/components/collection_videos";
import { ArrowLeft } from "@mui/icons-material";
import Link from "next/link";
import React from "react";

// Define the Collection interface
interface Collection {
  collection_id: string;
  name: string;
  description: string;
  created_at: string;
  user_id: string;
}

// Define the props for the page
interface PageProps {
  params: {
    collection_id: string;
  };
}

// Component for displaying collection details
const CollectionHome: React.FC<PageProps> = async ({ params }) => {
  const { collection_id } = params;

  if (!collection_id) {
    return (
      <DefaultLayout>
        <p>Collection not found.</p>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <CollectionPage collection_id={collection_id} />
    </DefaultLayout>
  );
};

export default CollectionHome;
