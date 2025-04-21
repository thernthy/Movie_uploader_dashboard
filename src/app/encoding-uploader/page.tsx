import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import EncodingUpladerIndex from "@/components/encoding-uploader";
import { VideoProvider } from "@/app/appContext/videoDetail";
export const metadata: Metadata = {
  title: "Encoded file uploader",
  description: "This user page use for uploading video encoding file",
};

const Profile = () => {
  return (
    <DefaultLayout>
      <VideoProvider>
        <EncodingUpladerIndex />
      </VideoProvider>
    </DefaultLayout>
  );
};

export default Profile;
