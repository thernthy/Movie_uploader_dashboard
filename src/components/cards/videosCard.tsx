import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { Collection, Video } from "../Charts/ChartOne";
import { useVideo } from "@/app/appContext/videoDetail";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/scrollbar";
import {
  ChangeCollectionIcon,
  CopySvg,
  DeleteSVG,
  DownloadSVG,
  MoveCollectionSVG,
  Edit,
} from "../icons/icons";

// Define the props type for ChartOne
interface dataProp {
  key: number;
  video: Video;
  Collections: Collection[];
  seleted?: boolean;
  handleAddVideo: () => void;
  onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: (event: React.MouseEvent<HTMLDivElement>) => void;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  onTouchStart: (event: React.TouchEvent<HTMLDivElement>) => void;
  onTouchMove: (event: React.TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: (event: React.TouchEvent<HTMLDivElement>) => void;
}

const VideoCard: React.FC<dataProp> = ({
  video,
  Collections,
  handleAddVideo,
  seleted,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onClick,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}) => {
  const [progress, setProgress] = useState<Record<string, string>>({});
  const { setVideo } = useVideo();
  const [visibleVideoId, setVisibleVideoId] = useState<string | null>(null);

  const [selectedCollection, setSelectedCollection] = useState<number | null>(
    null
  );
  const [showCollectionSelector, setShowCollectionSelector] = useState<
    string | null
  >(null);

  const fetchProgress = async (video_id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BAS_API_DOMAIN}/api_poster/encoding_progress/${video_id}`,
        {
          headers: {
            "api-key": `${process.env.NEXT_PUBLIC_ACCESS_POST_API_KEY}`,
          },
        }
      );
      const data = await response.json();
      setProgress((prev) => ({ ...prev, [video_id]: data.status }));
    } catch (error) {
      console.error(`Failed to fetch progress for video ${video_id}:`, error);
    }
  };

  const startEncoding = async (video_id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BAS_API_DOMAIN}/api_poster/encode_video/${video_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": `${process.env.NEXT_PUBLIC_ACCESS_POST_API_KEY}`,
          },
          body: JSON.stringify({
            resolution: "720p",
            folder: video_id, // Replace with the actual folder value
          }),
        }
      );
      const result = await response.json();
      console.log(`Encoding started for video ${video_id}:`, result);
      fetchProgress(video_id); // Fetch progress after starting encoding
    } catch (error) {
      console.error(`Failed to start encoding for video ${video_id}:`, error);
    }
  };

  //handle edition tools
  const handleEditionDotClick = (videoId: string) => {
    // Toggle visibility of the tools
    setVisibleVideoId((prevVideoId) =>
      prevVideoId === videoId ? null : videoId
    );
  };

  const handleMoveToCollectionsClick = (videoId: string) => {
    // Toggle visibility of the collection selector
    setShowCollectionSelector((prevVideoId) =>
      prevVideoId === videoId ? null : videoId
    );
  };

  //handle copy video id
  const handleCopyVideo = (video_id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(video_id)
        .then(() => {})
        .catch((error) => {
          console.error("Failed to copy video ID to clipboard:", error);
        });
    } else {
    }
  };

  //handle delete video
  const handleDeletVideo = async (video_id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BAS_API_DOMAIN}/video_del/${video_id}`,
        {
          method: "DELETE",
          headers: {
            "api-key": `${process.env.NEXT_PUBLIC_ACCESS_POST_API_KEY}`,
          },
        }
      );
      if (response.ok) {
        handleAddVideo();
      }
    } catch (error) {
      console.error(`Failed to fetch progress for video ${video_id}:`, error);
    }
  };

  //handle move video to collection
  const handleMovieCollection = async (video_id: string) => {};

  //handle download video file

  const handleMovieFileDownloadiing = async (video_id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BAS_API_DOMAIN}/api_get_data/dowload_file_?type=video_file&_video_id=${video_id}`,
        {
          headers: {
            "api-key": `${process.env.NEXT_PUBLIC_ACCESS_GET_API_KEY}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(
          `Failed to download video ${video_id}: ${response.statusText}`
        );
      }

      const data = await response.json();
      if (!data.file_path) {
        throw new Error(`No file path provided for video ${video_id}.`);
      }

      const downloadUrl = `${process.env.NEXT_PUBLIC_BAS_API_DOMAIN}/${data.file_path}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = data.file_path.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(`Failed download ${video_id}:`, error);
    }
  };

  const handleChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
    video_id: string
  ) => {
    const value = parseInt(event.target.value, 10);
    setSelectedCollection(value);
    try {
      // Send a POST request to your FastAPI endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BAS_API_DOMAIN}/move_collection/${video_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": `${process.env.NEXT_PUBLIC_ACCESS_POST_API_KEY}`,
          },
          body: JSON.stringify({ collection_id: value }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      handleAddVideo();
      // const data = await response.json();
    } catch (error) {
      console.error(`Failed to move collection: ${error}`);
    }
  };

  const handleDetail = (
    vide_id: string,
    video_title: string,
    video_play_url: string
  ) => {
    setVideo({
      video_id: vide_id,
      title: video_title,
      video_play_url: video_play_url, // Replace with the actual video URL
    });
  };

  const handleEdit = () => {
    alert("Under develop");
  };

  return (
    <div className="relative" key={video.video_id}>
      <div className="video_card relative h-50 w-full rounded-md bg-white text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark">
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            onMouseDown(e);
          }}
          onMouseEnter={onMouseEnter}
          onMouseUp={(e) => {
            e.preventDefault();
            onMouseUp(e);
          }}
          onClick={onClick}
          onTouchStart={(e) => {
            e.preventDefault();
            onTouchStart(e);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            onTouchMove(e);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onTouchEnd(e);
          }}
          style={{
            backgroundImage: `url(${
              video.video_status === "streaming"
                ? `https://m27.shop/videos/${video.video_id}/thumbnail.jpg`
                : ""
            })`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          className=" z-1 h-full w-full"
        ></div>
        {video.video_status === "streaming" && (
          <ul
            onClick={() => handleEditionDotClick(video.video_id)}
            className="edition_dot absolute right-0 top-0 z-9 flex max-h-8 max-w-3 flex-col items-center  justify-center gap-1 p-3 text-black hover:bg-white hover:shadow-card dark:bg-meta-4 dark:text-white dark:hover:bg-boxdark"
          >
            <li className="rounded-full bg-black p-0.5 dark:bg-white"></li>
            <li className="rounded-full bg-black p-0.5 dark:bg-white"></li>
            <li className="rounded-full bg-black p-0.5 dark:bg-white"></li>
          </ul>
        )}
        <ul
          className={`edition_tools absolute right-0 top-9 flex-col items-start justify-center gap-1 bg-white p-2 px-2 shadow-card dark:bg-meta-4 ${
            visibleVideoId === video.video_id ? "flex" : "hidden"
          }`}
        >
          <li
            onClick={() =>
              handleDetail(
                video.video_id,
                video.title,
                `https://m27player.b-cdn.net/${video.video_id}/video.m3u8`
              )
            }
            className=" flex w-full cursor-pointer flex-row items-start justify-start gap-2 rounded-sm px-2 py-0.5 hover:bg-white hover:shadow-card dark:hover:bg-boxdark"
          >
            <Edit /> <span>Rename</span>
          </li>
          <li
            onClick={() => handleCopyVideo(video.video_id)}
            className=" flex w-full cursor-pointer flex-row items-start justify-start gap-2 rounded-sm px-2 py-0.5 hover:bg-white hover:shadow-card dark:hover:bg-boxdark"
          >
            <CopySvg /> <span>Copy Vidoe ID</span>
          </li>
          <li
            onClick={() => handleMoveToCollectionsClick(video.video_id)}
            className=" flex w-full cursor-pointer flex-row items-start justify-start gap-2 rounded-sm px-2 py-0.5 hover:bg-white hover:shadow-card dark:hover:bg-boxdark"
          >
            {!video.collection_id && <MoveCollectionSVG />}
            {video.collection_id && <ChangeCollectionIcon />}{" "}
            <span>
              {video.collection_id ? "Chang collection" : "Move to collection"}
            </span>
          </li>
          {showCollectionSelector === video.video_id && (
            <li className="w-full flex-row items-center justify-center px-2 pl-4">
              <ul className="bg-back w-full rounded-md bg-boxdark">
                <li className="w-full">
                  <select
                    className="w-full bg-transparent py-2"
                    onChange={(e) => handleChange(e, video.video_id)}
                    value={video.collection_id || selectedCollection || ""}
                  >
                    {Collections?.map((item) => (
                      <option
                        key={item.collection_id} // Added a key for each option
                        className="bg-boxdark"
                        value={item.collection_id}
                      >
                        {item.name}
                      </option>
                    ))}
                  </select>
                </li>
              </ul>
            </li>
          )}
          <li
            onClick={() => handleMovieFileDownloadiing(video.video_id)}
            className=" flex w-full cursor-pointer flex-row items-start justify-start gap-2 rounded-sm px-2 py-0.5 hover:bg-white hover:shadow-card dark:hover:bg-boxdark"
          >
            <DownloadSVG /> <span>Download</span>
          </li>
          <li
            onClick={() => handleDeletVideo(video.video_id)}
            className=" flex w-full cursor-pointer flex-row items-start justify-start gap-2 rounded-sm px-2 py-0.5 hover:bg-white hover:shadow-card dark:hover:bg-boxdark"
          >
            <DeleteSVG /> <span>Delete</span>
          </li>
        </ul>
        {/* Display encoding progress here */}
        {video.video_status !== "streaming" ? <CircularProgress /> : ""}
        {video.video_status !== "streaming" && (
          <div
            className="h-24 w-full"
            style={{
              backgroundImage: `url(${
                video.video_status == "streaming"
                  ? "https://m27.shop" +
                    `/videos/${video.thumbnail_path}/thumbnail.jpg`
                  : "https://cdn-icons-png.flaticon.com/128/9363/9363460.png"
              })`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          ></div>
        )}
      </div>
      <div
        className="content overflow-hidden text-ellipsis whitespace-nowrap px-2"
        onClick={() =>
          handleDetail(
            video.video_id,
            video.title,
            `https://m27player.b-cdn.net/${video.video_id}/video.m3u8`
          )
        }
      >
        <h6
          className="overflow-hidden text-ellipsis whitespace-nowrap"
          title={video.title}
        >
          {video.title}
        </h6>
        <p title={new Date(video.created_at).toLocaleDateString()}>
          Uploaded on: {new Date(video.created_at).toLocaleDateString()}
        </p>
      </div>
      {video.video_status == "encoding" && (
        <div
          className="absolute left-2 top-2 z-99 rounded-full bg-yellow-200 px-2 py-2 text-white"
          title={video.video_status}
        ></div>
      )}
      {video.video_status == "downloading" && (
        <>
          <div
            className="absolute left-2 top-2 z-99 rounded-full bg-emerald-300 px-2 py-2 text-white"
            title={video.video_status}
          ></div>
          {/* <div
            className="bg-yallow-200 absolute right-2 top-2 rounded-full px-1 py-0.5 text-sm"
            onClick={() => handleRedownloading(video.video_id)}
          >
            Redownload
          </div> */}
        </>
      )}
      {video.video_status == "processing" && (
        <div
          className="absolute left-2 top-2 z-99 rounded-full bg-emerald-100 px-2 py-2 text-white"
          title={video.video_status}
        ></div>
      )}
      {video.video_status == "Download Failed" && (
        <>
          <div
            className="bg-red-400 absolute left-2 top-2 z-99 rounded-full px-2 py-2 text-white"
            title={video.video_status}
          ></div>
          {/* <div
            className="bg-yallow-200 absolute right-2 top-2 rounded-full px-1 py-0.5 text-sm"
            onClick={() => handleRedownloading(video.video_id)}
          >
            Redownload
          </div> */}
        </>
      )}
      {seleted && (
        <div
          className="absolute -left-1 -top-1 z-9  rounded-full bg-emerald-300 px-1 py-1 text-white"
          title={"seleted"}
        >
          <div className="rounded-full bg-orange-400 p-1.5"></div>
        </div>
      )}
      {video.video_status == "trancoding" && (
        <div
          className="absolute left-2 top-2 z-99 rounded-full bg-blue-300 px-2 py-2 text-white"
          title={video.video_status}
        ></div>
      )}
    </div>
  );
};

export default VideoCard;
