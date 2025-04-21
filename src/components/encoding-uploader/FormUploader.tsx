import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import Image from "next/image";

interface UploadProgress {
  [key: string]: number;
}

interface XhrInstances {
  [key: string]: XMLHttpRequest;
}

function UploadEncoding() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [xhrInstances, setXhrInstances] = useState<XhrInstances>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileCounterRef = useRef(0);
  const timestamp = Date.now();
  const date = new Date(timestamp);
  const seconds = date.getSeconds();

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (event.dataTransfer.files.length > 0) {
      const newFiles = Array.from(event.dataTransfer.files).filter(
        (file) => file.type === "video/mp4",
      );
      newFiles.forEach((file, index) => {
        let uniqueID = `${file.name}_${fileCounterRef.current}`;
        document.getElementById("show")!.innerHTML = "";
        document.getElementById("show")!.textContent =
          `File Counter: ${uniqueID}`;
        console.dir(`Generated Unique ID: ${uniqueID}`);
        const formData = new FormData();
        formData.append("videos[]", file);

        setUploadProgress((prevProgress) => ({
          ...prevProgress,
          [uniqueID]: 0,
        }));

        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress((prevProgress) => ({
              ...prevProgress,
              [uniqueID]: progress,
            }));
          }
        });

        xhr.open("POST", "http://127.0.0.1:8000/api/uploadvid?videos");
        xhr.send(formData);

        setXhrInstances((prevInstances) => ({
          ...prevInstances,
          [uniqueID]: xhr,
        }));
      });
      fileCounterRef.current++;

      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const cancelUpload = (index: number) => {
    const file = selectedFiles[index];
    const uniqueID = `${file.name}_${index}`;
    fileCounterRef.current--;

    const xhr = xhrInstances[uniqueID];

    if (xhr) {
      xhr.abort();

      setUploadProgress((prevProgress) => {
        const updatedProgress = { ...prevProgress };
        delete updatedProgress[uniqueID];
        return updatedProgress;
      });

      setXhrInstances((prevInstances) => {
        const updatedInstances = { ...prevInstances };
        delete updatedInstances[uniqueID];
        return updatedInstances;
      });

      setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    }
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).filter(
      (file) => file.type === "video/mp4",
    );

    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);

    files.forEach((file) => {
      const formData = new FormData();
      formData.append("videos[]", file);

      setUploadProgress((prevProgress) => ({
        ...prevProgress,
        [file.name]: 0,
      }));

      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress((prevProgress) => ({
            ...prevProgress,
            [file.name]: progress,
          }));
        }
      });

      xhr.open("POST", "http://127.0.0.1:8000/api/uploadvid?videos");
      xhr.send(formData);

      setXhrInstances((prevInstances) => ({
        ...prevInstances,
        [file.name]: xhr,
      }));
    });
  };

  return (
    <>
      <div
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
        className="container"
      >
        <div className="file h-full">
          <div
            className="row drag h-80"
            style={{
              backgroundImage: `url("https://cdn-icons-png.flaticon.com/128/7661/7661557.png")`,
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <h4>Drop or Click to Attach File Here(MP4 only)</h4>
          </div>
          <div className="uploaded">
            {selectedFiles.map((file, index) => (
              <div key={index} className="card_upload">
                <div className="detail">
                  <h6>{file.name}</h6>
                  <p>{file.type}</p>
                  <p style={{ fontSize: "10px" }}>
                    {file.name}_{index}
                  </p>
                  {uploadProgress[`${file.name}_${index}`] !== undefined && (
                    <progress
                      value={uploadProgress[`${file.name}_${index}`]}
                      max="100"
                    ></progress>
                  )}
                  <p>{seconds}</p>
                </div>
                <div
                  className="del"
                  onClick={() => cancelUpload(index)}
                  style={{
                    display:
                      uploadProgress[`${file.name}_${index}`] === 100
                        ? "none"
                        : "",
                  }}
                >
                  <Image
                    src={
                      "https://cdn-icons-png.flaticon.com/128/9363/9363460.png"
                    }
                    alt=""
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <input
          type="file"
          accept="video/mp4"
          multiple
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleFileInputChange}
        />
        <button
          itemID="btn"
          onClick={() => fileInputRef.current?.click()}
          style={{ display: "none" }}
        >
          Attach File
        </button>
      </div>
      <div className="show" id="show"></div>
    </>
  );
}

export default UploadEncoding;
