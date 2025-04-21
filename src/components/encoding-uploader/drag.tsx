import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import "./style.css";
interface componentProp {
  handleRefresh: () => void;
}
const UploadEncodingZip: React.FC<componentProp> = ({ handleRefresh }) => {
  const [selectedFiles, setSelectedFiles] = useState<{ [id: string]: File }>(
    {}
  );
  const [uploadProgress, setUploadProgress] = useState<{
    [id: string]: number;
  }>({});
  const [xhrInstances, setXhrInstances] = useState<{
    [id: string]: XMLHttpRequest;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timestamp = Date.now();
  const date = new Date(timestamp);
  const seconds = date.getSeconds();

  const uploadFile = (file: File, uniqueID: string) => {
    console.log(`Generated Unique ID: ${uniqueID}`);

    const formData = new FormData();
    formData.append("videos[]", file);

    setUploadProgress((prevProgress) => ({
      ...prevProgress,
      [uniqueID]: 0,
    }));

    const xhr = new XMLHttpRequest();
    const maxRetries = 3;
    let attempt = 0;

    const attemptUpload = () => {
      attempt++;
      const retryDelay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff

      setTimeout(() => {
        xhr.open(
          "POST",
          "https://encodingzipuploader.m27.shop"
          //"https://encodingzipuploade.wwdqwii0qsas4gjzuwlpxfrosi7zxjx4tyw51io.store"
        ); //https://encodingzipuploader.m27.shop/
        xhr.setRequestHeader("API-Key", "thernthy862003");
        xhr.setRequestHeader("Accept", "application/json");
        xhr.send(formData);
      }, retryDelay);
    };

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setUploadProgress((prevProgress) => ({
          ...prevProgress,
          [uniqueID]: progress,
        }));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        console.log(`Upload successful for ${uniqueID}`);
        handleRefresh();
      } else if (attempt < maxRetries) {
        console.error(
          `Upload failed for ${uniqueID}: ${xhr.statusText}. Retrying... (${attempt})`
        );
        attemptUpload();
      } else {
        console.error(
          `Upload failed for ${uniqueID} after ${attempt} attempts`
        );
      }
    });

    xhr.addEventListener("error", () => {
      if (attempt < maxRetries) {
        console.error(`Upload error for ${uniqueID}. Retrying... (${attempt})`);
        attemptUpload();
      } else {
        console.error(`Upload error for ${uniqueID} after ${attempt} attempts`);
      }
    });

    xhr.addEventListener("timeout", () => {
      console.error(`Upload timed out for ${uniqueID}`);
    });

    xhr.addEventListener("loadend", () => {
      setXhrInstances((prevInstances) => {
        const { [uniqueID]: removed, ...rest } = prevInstances;
        return rest;
      });
    });

    xhr.timeout = 86400000; // 24 hours in milliseconds

    // Initial attempt
    attemptUpload();
  };

  // Handle file drop events
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const dropArea = document.getElementById("drop-area");
    if (!dropArea || !dropArea.contains(event.target as Node)) {
      return;
    }

    const newFiles = Array.from(event.dataTransfer.files).filter(
      (file) => file.type === "application/x-zip-compressed"
    );

    if (newFiles.length > 0) {
      console.log("Handling drop event", newFiles);
      processFiles(newFiles);
    }
  };

  // Handle file input change events
  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);

    if (files.length > 0) {
      console.log("Handling input change event", files);
      processFiles(files);
    }

    // Clear the file input field
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Centralized function to process files
  const processFiles = (files: File[]) => {
    files.forEach((file) => {
      const uniqueID = uuidv4(); // Generate a unique ID for each file
      setSelectedFiles((prevFiles) => ({
        ...prevFiles,
        [uniqueID]: file,
      }));
      uploadFile(file, uniqueID);
    });
  };

  // const cancelUpload = (index: number) => {
  //   const file = selectedFiles[index];
  //   const uniqueID = `${file.name}_${index}`;
  //   fileCounterRef.current--;

  //   const xhr = xhrInstances[uniqueID];

  //   if (xhr) {
  //     xhr.abort();

  //     setUploadProgress((prevProgress) => {
  //       const updatedProgress = { ...prevProgress };
  //       delete updatedProgress[uniqueID];
  //       return updatedProgress;
  //     });

  //     setXhrInstances((prevInstances) => {
  //       const updatedInstances = { ...prevInstances };
  //       delete updatedInstances[uniqueID];
  //       return updatedInstances;
  //     });

  //     setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  //   }
  // };

  return (
    <>
      <div
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
        className="containerer w-full"
      >
        <input
          type="file"
          accept="application/zip, application/x-zip-compressed"
          multiple
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={(e) => handleFileInputChange(e)}
        />
        <button
          itemID="btn"
          onClick={() => fileInputRef.current?.click()}
          style={{ display: "none" }}
        >
          Attach File
        </button>
        <div
          id="drop-area"
          className="row drag text-red-700 bg-gray-300 w-3/12 rounded-md border-2 border-meta-4"
          style={{
            backgroundImage: `url("https://cdn-icons-png.flaticon.com/128/8331/8331919.png")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            height: "400px",
            width: "100%",
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          {/* <h4 className="mt-32">Drop or Click to Attach File Here (MP4 only)</h4> */}
        </div>
      </div>

      <div className="show" id="show"></div>
      <div className="file mt-4 grid w-full grid-flow-row gap-2">
        <div
          className="uploaded xxl:grid-cols-3 grid h-full w-full place-items-center gap-1 rounded-md border-black md:grid-cols-1 xl:grid-cols-3"
          style={{ overflowY: "scroll", scrollbarWidth: "none" }}
        >
          {Object.keys(selectedFiles).map((fileId: string) => {
            const file = selectedFiles[fileId];

            return (
              <div
                key={fileId} // Use fileId as the unique key
                className="bg-gray-300 border-gray-700 relative w-full max-w-sm rounded border border-meta-4 p-6 shadow"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/128/16769/16769089.png"
                  className="w-12"
                  alt=""
                />
                <h6 className="mb-2 truncate text-xl font-semibold tracking-tight text-black dark:text-white">
                  {file.name}
                </h6>
                <div className="bg-gray-200 dark:bg-gray-700 h-2.5 w-full rounded-full border border-meta-4">
                  <div
                    className="h-2 rounded-full bg-orange-500"
                    style={{
                      width: `${uploadProgress[fileId] || 0}%`,
                    }}
                  ></div>
                </div>
                <p className="text-center">
                  {file.name} - Progress: {uploadProgress[fileId] || 0}%
                </p>{" "}
                {/* Fixed closing tag */}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default UploadEncodingZip;
