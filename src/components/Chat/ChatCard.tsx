import { useState, ChangeEvent } from "react";
type UploadVideoFormProps = {
  handleAddVideo: () => void;
};

interface UploadResponse {
  videoId: string;
  videoPath: string;
}

const ChatCard: React.FC<UploadVideoFormProps> = ({ handleAddVideo }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [response, setResponse] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a video file first.");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file); // Ensure this field name matches the FastAPI endpoint

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api_poster/upload_mp4_vd",
        {
          method: "POST",
          body: formData,
          headers: {
            "api-key": "123456", // Include this header if needed
          },
        },
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setResponse(data);
      handleAddVideo();
    } catch (err: unknown) {
      // Type the error explicitly
      if (err instanceof Error) {
        setError(err.message || "An error occurred");
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">
        Chats
      </h4>
      <div>
        <h1>Upload Video</h1>
        <input type="file" accept="video/*" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Video"}
        </button>
        {response && (
          <div>
            <h2>Upload Successful</h2>
            <p>Video ID: {response.videoId}</p>
            <p>Video Path: {response.videoPath}</p>
          </div>
        )}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
};

export default ChatCard;
