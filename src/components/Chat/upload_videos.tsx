import React, { useState, useRef, ChangeEvent } from "react";
import folder from "../../asset/folder-download.png";
import "./upload.css";
import del from "../../assets/x-mark.png";
import UploadFileProgressBarCircle from "../progressBar/upload_file_progress";

type UploadVideoFormProps = {
  handleAddVideo: () => void;
};

interface UploadResponse {
  videoId: string;
  videoPath: string;
}

const UploadingVideos: React.FC<UploadVideoFormProps> = ({
  handleAddVideo,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );
  const [response, setResponse] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [xhrInstances, setXhrInstances] = useState<
    Record<string, XMLHttpRequest>
  >({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const createVideoEntry = async (file: File): Promise<string> => {
    const videoTitle = file.name.replace(" ", "_");

    const createVideoData = { title: videoTitle };

    try {
      const response = await fetch(
        `https://video.bunnycdn.com/library/293721/videos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            AccessKey: "ab5cc9e7-fc7d-4793-a05c089b0b48-e6e2-4f11", // Replace with actual API key
          },
          body: JSON.stringify(createVideoData),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Failed to create video entry: ${data.message}`);
      }

      console.log(`Created video entry ID: ${data.guid}`); // Debugging line
      return data.guid;
    } catch (error) {
      console.error(`Error creating video entry: ${error.message}`);
      throw error;
    }
  };

  const uploadVideoFile = (file: File, videoId: string, title: string) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = false; // Try without credentials

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setUploadProgress((prevProgress) => ({
          ...prevProgress,
          [file.name]: progress,
        }));
      }
    };

    xhr.onload = async () => {
      if (xhr.status === 200) {
        console.log(`Video uploaded successfully: ${file.name}`);
        setUploadProgress((prevProgress) => ({
          ...prevProgress,
          [file.name]: 100,
        }));
        setResponse({
          videoId,
          videoPath: xhr.responseText, // Assuming the server responds with the path
        });

        // Now call the FastAPI endpoint to create the video entry
        try {
          const createVideoResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BAS_API_DOMAIN}/api_poster/create-video/${videoId}/${file.name}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "api-key": "123456",
              },
            },
          );

          if (!createVideoResponse.ok) {
            throw new Error(
              `Failed to create video entry: ${createVideoResponse.statusText}`,
            );
          }

          const createVideoData = await createVideoResponse.json();
          handleAddVideo();
        } catch (error) {
          console.error(`Error creating video entry: ${error.message}`);
          setError(`Error creating video entry: ${error.message}`);
        }
      } else {
        console.error(`Upload failed: ${xhr.statusText}`);
        setError(`Upload failed: ${xhr.statusText}`);
      }
    };

    xhr.onerror = () => {
      console.error(`Error uploading file: ${file.name}`);
      setError(`Error uploading file: ${file.name}`);
    };

    xhr.open(
      "PUT",
      `https://video.bunnycdn.com/library/293721/videos/${videoId}`,
    );
    xhr.setRequestHeader("Content-Type", "video/mp4");
    xhr.setRequestHeader(
      "AccessKey",
      "ab5cc9e7-fc7d-4793-a05c089b0b48-e6e2-4f11",
    ); // Replace with actual API key

    setXhrInstances((prevInstances) => ({
      ...prevInstances,
      [file.name]: xhr,
    }));

    xhr.send(file);
  };

  const handleFileInputChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files) {
      const files = Array.from(event.target.files).filter(
        (file) => file.type === "video/mp4" || file.type === "video/x-matroska",
      );

      setSelectedFiles((prevFiles) => [...prevFiles, ...files]);

      for (const file of files) {
        setUploadProgress((prevProgress) => ({
          ...prevProgress,
          [file.name]: 0,
        }));

        try {
          const videoId = await createVideoEntry(file);
          if (videoId) {
            uploadVideoFile(file, videoId);
          }
        } catch (error) {
          console.error(`Failed to upload file: ${file.name}`);
        }
      }
    }
  };

  const cancelUpload = (index: number) => {
    const file = selectedFiles[index];
    const xhr = xhrInstances[file.name];

    if (xhr) {
      xhr.abort();
      setUploadProgress((prevProgress) => {
        const updatedProgress = { ...prevProgress };
        delete updatedProgress[file.name];
        return updatedProgress;
      });

      setXhrInstances((prevInstances) => {
        const updatedInstances = { ...prevInstances };
        delete updatedInstances[file.name];
        return updatedInstances;
      });

      setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-2 py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Chats
      </h4>
      <div
        onDrop={(e) => {
          e.preventDefault();
          handleFileInputChange(e as unknown as ChangeEvent<HTMLInputElement>);
        }}
        onDragOver={(e) => e.preventDefault()}
        className="max-h-48 min-h-33 w-full rounded-md border-2 border-gray px-4 py-2 dark:border-slate-800"
        onClick={() => fileInputRef.current?.click()}
      >
        <div
          className=" h-24 w-full"
          style={{
            backgroundImage: `url('https://cdn-icons-png.flaticon.com/128/9363/9363460.png')`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
        <h4 className="text-center">
          Drop or Click to Attach File Here (MP4 only)
        </h4>
      </div>
      <div className="uploaded">
        {selectedFiles.map((file, index) => (
          <div
            key={index}
            className="card_upload my-2 rounded-md border-2 border-gray py-1 dark:border-slate-800"
          >
            <div className="detail flex w-full flex-row flex-nowrap justify-between gap-2 px-2">
              <div>
                <h6>{file.name}</h6>
                <p>{file.type}</p>
              </div>
              {uploadProgress[file.name] !== undefined && (
                <UploadFileProgressBarCircle
                  value={uploadProgress[file.name]}
                />
              )}
              <img
                src={`https://cdn-icons-png.flaticon.com/128/7466/7466139.png`}
                alt="Cancel Upload"
                className="h-10"
                onClick={() => cancelUpload(index)}
              />
            </div>
            <div
              className="del"
              style={{
                display: uploadProgress[file.name] === 100 ? "none" : "",
              }}
            ></div>
          </div>
        ))}
      </div>
      <input
        type="file"
        accept="video/mp4, video/x-matroska"
        multiple
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileInputChange}
      />
      {response && (
        <div>
          <h2>Upload Successful</h2>
          {/* <p>Video ID: {response.videoId}</p>
          <p>Video Path: {response.videoPath}</p> */}
        </div>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default UploadingVideos;
