import { useState, ChangeEvent } from "react";

interface UploadResponse {
  videoId: string;
  videoPath: string;
}

const VideoUpload: React.FC = () => {
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
        `${process.env.NEXT_PUBLIC_BAS_API_DOMAIN}/google_storage/upload_mp4_vd`,
        {
          method: "POST",
          body: formData,
          headers: {
            "api-key": `${process.env.NEXT_PUBLIC_ACCESS_POST_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setResponse(data);
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
  );
};

export default VideoUpload;
