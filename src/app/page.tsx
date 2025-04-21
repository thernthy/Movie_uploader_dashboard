import { options } from "./api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation"; // Server-side redirection
import ECommerce from "@/components/Dashboard/E-commerce";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { VideoProvider } from "@/app/appContext/videoDetail";
import { HandleCollectionsProvider } from "./appContext/popUpCategoryAdd";
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: "Movies management server",
  description: "The main movies management server",
};

export default async function Home() {
  // Fetch the session server-side
  const session = await getServerSession(options);

  // If there's no session, redirect to the sign-in page
  // if (!session) {
  //   redirect("/auth/signin");
  // }

  // If the session exists, render the protected content
  return (
    <DefaultLayout>
      <HandleCollectionsProvider>
        <VideoProvider>
          <ECommerce />
        </VideoProvider>
      </HandleCollectionsProvider>
    </DefaultLayout>
  );
}
