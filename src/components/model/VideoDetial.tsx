import React, { useEffect, useRef, useState } from "react";
import { useVideo } from "@/app/appContext/videoDetail";
import {
  CloseButton,
  CopySvg,
  DeleteSVGWhite,
  DowArrowWhite,
  DownloadSVGWhite,
  Edit,
} from "../icons/icons";
import Hls from "hls.js";

interface VideoDetailProps {
  refresh: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}
const VideoDetail: React.FC<VideoDetailProps> = ({ refresh, setRefresh }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { video, isModalVisible, hideModal } = useVideo();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [tempTitle, setTempTitle] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowMessage(false);
    }, 900); // 500ms timeout
    return () => clearTimeout(timeout); // Cleanup on unmount
  }, [showMessage, message]);
  useEffect(() => {
    //setTempTitle(video?.title);
    // setTitle(video?.title);
    if (videoRef.current && video?.video_play_url) {
      const hls = new Hls();

      // Check if HLS is supported
      if (Hls.isSupported()) {
        hls.loadSource(video.video_play_url);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current?.play();
        });

        // Clean up on unmount
        return () => {
          hls.destroy();
        };
      } else if (
        videoRef.current.canPlayType("application/vnd.apple.mpegurl")
      ) {
        videoRef.current.src = video.video_play_url;
        videoRef.current.addEventListener("loadedmetadata", () => {
          videoRef.current?.play();
        });
      }
    }
  }, [video, video?.video_play_url]);

  if (!isModalVisible || !video) {
    return null; // Don't render anything if the modal is not visible or video is null
  }

  const allerMessage = (message: string) => {
    return (
      <div className=" absolute right-4 top-4 rounded-md bg-white px-3 py-1">
        <p>{message}</p>
      </div>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setMessage(`Copied: ${text}`);
        setShowMessage(true);
      },
      () => {
        setMessage("Failed to copy");
        setShowMessage(true);
      },
    );
  };
  const startEditing = () => {
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setTempTitle(title);
  };

  const saveEdit = async (video_id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BAS_API_DOMAIN}/video_edit/${video_id}?title=${tempTitle}`,
        {
          method: "Post",
          headers: {
            "api-key": `${process.env.NEXT_PUBLIC_ACCESS_POST_API_KEY}`,
          },
        },
      );
      if (response.ok) {
        setIsEditing(false);
        setRefresh(!refresh);
        ///window.location.reload(); // Reload the page after saving
      }
    } catch (error) {
      console.error(`Failed to fetch progress for video ${video_id}:`, error);
    }
  };

  return (
    <div className="fixed right-0 top-0 z-999999 max-h-screen min-h-screen bg-white shadow-card dark:bg-black">
      {showMessage && allerMessage(`${message}`)}
      <div className="absolute -left-10 top-2 z-999999" onClick={hideModal}>
        <CloseButton />
      </div>
      <div className="mt-2 flex border-spacing-1 flex-row justify-between border border-x-0 border-t-0 border-meta-4 px-5 py-3">
        <div className="title">
          <h4>{video.title}</h4>
        </div>
        <div className="dd inline-block gap-3 md:flex md:flex-row">
          <button className="flex flex-row rounded-md border-2 border-meta-4 px-3 py-1">
            <span>
              <DownloadSVGWhite />
            </span>
            Downloads
          </button>
          <button className="flex flex-row rounded-md border-2 border-meta-4 px-3 py-1">
            <span>
              <DeleteSVGWhite />
            </span>
            Delete
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 items-start gap-3 rounded-md px-5 py-2 pt-4 md:grid-cols-2">
        <div className="vid flex flex-col justify-center rounded-md">
          <video
            ref={videoRef}
            className="w-full max-w-115 rounded-md md:w-96 lg:xl:w-115 xl:w-115"
            height="360"
            controls
          >
            {/* No need to add source here; it's handled by Hls.js */}
          </video>
        </div>
        <ul className="detail mb-3.5 flex flex-col items-start">
          <li className="firstBlog mb-3.5 flex w-full flex-col rounded-md border-2 border-meta-4 px-4 py-2">
            <div className="flex flex-row items-center justify-between">
              <h4>
                <b>Video Info</b>
              </h4>
              <DowArrowWhite />
            </div>
            <div className="title mb-3.5 mt-2 w-full">
              <h6>Video Title</h6>

              <div
                style={{ borderColor: "#8080807a" }}
                className="mt-3 flex h-10 w-full flex-row items-center justify-between gap-2 rounded-md border  bg-white pr-2  dark:bg-meta-4"
              >
                <input
                  type="text"
                  className="h-full w-full rounded-md border-none bg-transparent pl-3 pr-2 outline-none focus:outline-none focus:ring-0"
                  placeholder="Direct Play URL"
                  required
                  value={tempTitle ?? ""} // fallback to empty string if null
                  onChange={(e) => setTempTitle(e.target.value)}
                  readOnly={!isEditing}
                />
                {!isEditing ? (
                  <>
                    <div
                      className="flex w-6 cursor-pointer items-center justify-center text-white"
                      onClick={() => copyToClipboard(`${video.title}`)}
                    >
                      <CopySvg />
                    </div>
                    <div
                      className="flex w-6 cursor-pointer items-center justify-center text-white"
                      onClick={() => startEditing()}
                    >
                      <Edit />
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className="flex w-6 cursor-pointer items-center justify-center text-white"
                      onClick={() => cancelEdit()}
                    >
                      <span className="text-danger">&#10005;</span>
                    </div>
                    <div
                      className="flex w-6 cursor-pointer items-center justify-center text-white"
                      onClick={() => saveEdit(video.video_id)}
                    >
                      <span className="text-green-300">&#10003;</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="title mb-3.5 mt-2 w-full">
              <h6>Video ID</h6>
              <div
                style={{ borderColor: "#8080807a" }}
                className="mt-3 flex h-10 w-full flex-row items-center justify-between gap-2 rounded-md border  bg-white pr-2  dark:bg-meta-4"
              >
                <input
                  type="text"
                  className="h-full w-full rounded-md border-none bg-transparent pl-3 pr-2 outline-none focus:outline-none focus:ring-0"
                  placeholder="Direct Play URL"
                  required
                  value={video.video_id}
                  readOnly
                />
                <div
                  className="flex w-6 items-center justify-center text-white"
                  onClick={() => copyToClipboard(`${video.video_id}`)}
                >
                  <CopySvg />
                </div>
              </div>
            </div>
          </li>
          <li className="firstBlog mb-3.5 flex w-full flex-col rounded-md border-2 border-meta-4 px-4 py-2">
            <div className="flex flex-row items-center justify-between">
              <h4>
                <b>Link</b>
              </h4>
              <DowArrowWhite />
            </div>
            <div className="title mb-3.5 mt-2 w-full">
              <h6>Video ID</h6>
              <div
                style={{ borderColor: "#8080807a" }}
                className="mt-3 flex h-10 w-full flex-row items-center justify-between gap-2 rounded-md border  bg-white pr-2  dark:bg-meta-4"
              >
                <input
                  type="text"
                  className="h-full w-full rounded-md border-none bg-transparent pl-3 pr-2 outline-none focus:outline-none focus:ring-0"
                  placeholder="Direct Play URL"
                  required
                  value={video.video_id}
                  readOnly
                />
                <div
                  className="flex w-6 items-center justify-center text-white"
                  onClick={() => copyToClipboard(`${video.video_id}`)}
                >
                  <CopySvg />
                </div>
              </div>
            </div>
            <div className="title mb-3.5 w-full">
              <h6>HLS PlayList Url</h6>
              <div
                style={{ borderColor: "#8080807a" }}
                className="mt-3 flex h-10 w-full flex-row items-center justify-between gap-2 rounded-md border  bg-white pr-2  dark:bg-meta-4"
              >
                <input
                  type="text"
                  className="h-full w-full rounded-md border-none bg-transparent pl-3 pr-2 outline-none focus:outline-none focus:ring-0"
                  placeholder="Direct Play URL"
                  required
                  value={video.video_play_url}
                  readOnly
                />
                <div
                  className="flex w-6 items-center justify-center text-white"
                  onClick={() => copyToClipboard(`${video.video_play_url}`)}
                >
                  <CopySvg />
                </div>
              </div>
            </div>
            <div className="title mb-3.5 w-full">
              <h6>Thumbnail URL</h6>
              <div
                style={{ borderColor: "#8080807a" }}
                className="mt-3 flex h-10 w-full flex-row items-center justify-between gap-2 rounded-md border  bg-white pr-2  dark:bg-meta-4"
              >
                <input
                  type="text"
                  className="h-full w-full rounded-md border-none bg-transparent pl-3 pr-2 outline-none focus:outline-none focus:ring-0"
                  placeholder="Direct Play URL"
                  required
                  value={
                    "https://monsterv-uploader.m27.shop/videos/66f4cc9d037543.26789957354056c584e1180906/thumbnail.jpg"
                  }
                  readOnly
                />
                <div
                  className="flex w-6 items-center justify-center text-white"
                  onClick={() =>
                    copyToClipboard(
                      "https://monsterv-uploader.m27.shop/videos/66f4cc9d037543.26789957354056c584e1180906/thumbnail.jpg",
                    )
                  }
                >
                  <CopySvg />
                </div>
              </div>
            </div>
            {/* <div className="title mb-3.5 w-full">
              <h6>Direct Play URL</h6>
              <div
                style={{ borderColor: "#8080807a" }}
                className="mt-3 flex h-10 w-full flex-row items-center justify-between gap-2 rounded-md border  bg-white pr-2  dark:bg-meta-4"
              >
                <input
                  type="text"
                  className="h-full w-full rounded-md border-none bg-transparent pl-3 pr-2 outline-none focus:outline-none focus:ring-0"
                  placeholder="Direct Play URL"
                  required
                  value={video.video_play_url}
                  readOnly
                />
                <div
                  className="flex w-6 items-center justify-center text-white"
                  onClick={() => copyToClipboard(`${video.video_play_url}`)}
                >
                  <CopySvg />
                </div>
              </div>
            </div> */}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default VideoDetail;
