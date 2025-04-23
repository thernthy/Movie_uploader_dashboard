import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import CircularProgress from "@mui/material/CircularProgress";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Scrollbar, Mousewheel } from "swiper/modules";
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

// Define the video data structure based on the API response
export interface Video {
  video_id: string;
  title: string;
  description: string;
  collection_id: string;
  resolution: string;
  thumbnail_path: string;
  processed_video_path: string;
  created_at: string;
  video_status: string;
}

export interface Collection {
  user_id: string;
  collection_id: string;
  name: string;
  created_at: string;
  description?: string;
  total_files?: number;
}

// Define the props type for ChartOne
interface ChartOneProps {
  videos: Video[];
  Collection: Collection[];
  handleAddVideo: () => void;
}

const ChartOne: React.FC<ChartOneProps> = ({
  videos,
  Collection,
  handleAddVideo,
}) => {
  const [progress, setProgress] = useState<Record<string, string>>({});
  const { setVideo } = useVideo();
  const [visibleVideoId, setVisibleVideoId] = useState<string | null>(null);

  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null,
  );
  const [showCollectionSelector, setShowCollectionSelector] = useState<
    string | null
  >(null);
  const [selectedData, setSelectedData] = useState<
    { video_id: string; status: string }[]
  >([]);
  const [isSelecting, setIsSelecting] = useState(false);
  useEffect(() => {
    videos.forEach((video) => {
      if (video.video_status === "uploaded") {
        startEncoding(video.video_id);
      }
    });
  }, [videos]);

  const startEncoding = async (video_id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BAS_API_DOMAIN}/api_poster/google_api/encode_video/${video_id}`,
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
        },
      );
      const result = await response.json();
      console.log(`Encoding started for video ${video_id}:`, result);
      fetchProgress(video_id); // Fetch progress after starting encoding
    } catch (error) {
      console.error(`Failed to start encoding for video ${video_id}:`, error);
    }
  };

  const fetchProgress = async (video_id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BAS_API_DOMAIN}/api_poster/encoding_progress/${video_id}`,
        {
          headers: {
            "api-key": `${process.env.NEXT_PUBLIC_ACCESS_POST_API_KEY}`,
          },
        },
      );
      const data = await response.json();
      setProgress((prev) => ({ ...prev, [video_id]: data.status }));
    } catch (error) {
      console.error(`Failed to fetch progress for video ${video_id}:`, error);
    }
  };

  // Effect to handle mouse move when selecting
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (isSelecting) {
        const target = event.target as HTMLElement;
        const videoId = target.getAttribute("data-video-id");
        if (videoId) {
          const video = videos.find((v) => v.video_id === videoId);
          if (video) {
            toggleSelection(video);
          }
        }
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isSelecting, videos]);

  //handle edition tools
  const handleEditionDotClick = (videoId: string) => {
    // Toggle visibility of the tools
    setVisibleVideoId((prevVideoId) =>
      prevVideoId === videoId ? null : videoId,
    );
  };

  const handleMoveToCollectionsClick = (videoId: string) => {
    // Toggle visibility of the collection selector
    setShowCollectionSelector((prevVideoId) =>
      prevVideoId === videoId ? null : videoId,
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
        `${process.env.NEXT_PUBLIC_BAS_API_DOMAIN}/api_poster/video_del/${video_id}`,
        {
          method: "DELETE",
          headers: {
            "api-key": `${process.env.NEXT_PUBLIC_ACCESS_POST_API_KEY}`,
          },
        },
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
        },
      );
      if (!response.ok) {
        throw new Error(
          `Failed to download video ${video_id}: ${response.statusText}`,
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
    video_id: string,
  ) => {
    const value = event.target.value;
    setSelectedCollection(value);
    try {
      // Send a POST request to your FastAPI endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BAS_API_DOMAIN}/api_poster/move_collection/${video_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": `${process.env.NEXT_PUBLIC_ACCESS_POST_API_KEY}`,
          },
          body: JSON.stringify({ collection_id: value }),
        },
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

  const handleRequestBunnyEncodingStatus = async (
    video_id: string,
    current_status: string,
  ) => {
    if (
      current_status === "encoding" ||
      current_status === "processing" ||
      current_status === "trancoding"
    ) {
      try {
        // Wait for 1 second before making the request
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const response = await fetch(
          `https://video.bunnycdn.com/library/293721/videos/${video_id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              AccessKey: "ab5cc9e7-fc7d-4793-a05c089b0b48-e6e2-4f11", // Replace with actual API key
            },
          },
        );

        const data = await response.json();
        const bunnyStatus = data.encodeProgress;
        let newStatus = "0"; // Adjust according to your actual response structure

        switch (true) {
          case bunnyStatus <= 0:
            newStatus = "processing";
            break;
          case bunnyStatus > 0 && bunnyStatus < 100:
            newStatus = "trancoding";
            break;
          case bunnyStatus === 100:
            newStatus = "downloading";
            await fetch(
              `${process.env.NEXT_PUBLIC_BAS_API_DOMAIN}/api_poster/bunny-encoded-file-downloading/${video_id}`,
              {
                method: "GET",
                headers: {
                  "api-key": `${process.env.NEXT_PUBLIC_ACCESS_POST_API_KEY}`,
                },
              },
            );
            break;
          default:
            newStatus = "unknown"; // Handle other statuses if needed
        }

        if (newStatus !== current_status) {
          // Call function to update status in local database
          requestUpdateVideoProgressingStatus(video_id, newStatus);
        }
      } catch (error) {
        console.error("Failed to fetch Bunny video status:", error);
      }
    }
  };

  const requestUpdateVideoProgressingStatus = async (
    video_id: string,
    new_status: string,
  ) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BAS_API_DOMAIN}/api_poster/updateVideoStatus?video_id=${video_id}&status=${new_status}`,
        {
          method: "PUT", // Change to PUT for updates
          headers: {
            "Content-Type": "application/json",
            "api-key": `${process.env.NEXT_PUBLIC_ACCESS_POST_API_KEY}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update video status");
      }
    } catch (error) {
      console.error("Error updating video status:", error);
    }
  };

  useEffect(() => {
    videos.forEach((video) => {
      if (
        video.video_status === "processing" ||
        video.video_status === "trancoding" ||
        video.video_status === "encoding"
      ) {
        handleRequestBunnyEncodingStatus(video.video_id, video.video_status);
      }
    });
  }, [videos]);

  const handleRedownloading = async (video_id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BAS_API_DOMAIN}/api_poster/bunny-encoded-file-downloading/${video_id}`,
        {
          method: "GET",
          headers: {
            "api-key": `${process.env.NEXT_PUBLIC_ACCESS_POST_API_KEY}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to trigger redownloading.");
      }

      const data = await response.json();
      console.log("Redownload triggered:", data);
      handleAddVideo(); // Refresh video list
    } catch (error) {
      console.error(`Failed to redownload video ${video_id}:`, error);
    }
  };

  const handleDetail = (
    vide_id: string,
    video_title: string,
    video_play_url: string,
  ) => {
    setVideo({
      video_id: vide_id,
      title: video_title,
      video_play_url: video_play_url, // Replace with the actual video URL
    });
  };

  // Function to toggle selection
  const toggleSelection = (video: Video) => {
    const newData = { video_id: video.video_id, status: video.video_status };
    console.log(newData);
    // Check if the video is already selected
    if (!selectedData.find((item) => item.video_id === video.video_id)) {
      setSelectedData((prevData) => [...prevData, newData]);
    } else {
      setSelectedData((prevData) =>
        prevData.filter((item) => item.video_id !== video.video_id),
      );
    }
  };

  // Mouse event handlers
  const handleMouseDown = (video: Video) => {
    setIsSelecting(true);
    toggleSelection(video);
  };

  const handleMouseEnter = (video: Video) => {
    if (isSelecting) {
      toggleSelection(video);
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  // Touch event handlers
  const handleTouchStart = (video: Video) => {
    setIsSelecting(true);
    toggleSelection(video);
  };

  const handleTouchMove = (video: Video) => {
    if (isSelecting) {
      toggleSelection(video);
    }
  };

  const handleTouchEnd = () => {
    setIsSelecting(false);
  };

  const handleCollectionChange = async () => {
    if (selectedData.length > 0 && selectedCollection) {
      try {
        // Loop through each selected video
        for (const video of selectedData) {
          // Make the request for each video
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BAS_API_DOMAIN}/move_collection/${video.video_id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "api-key": `${process.env.NEXT_PUBLIC_ACCESS_POST_API_KEY}`,
              },
              body: JSON.stringify({ collection_id: selectedCollection }),
            },
          );

          // Check if the response was successful
          if (response.ok) {
            console.log(`Video ${video.video_id} successfully updated.`);
          } else {
            console.error(
              `Error updating video ${video.video_id}: ${response.statusText}`,
            );
          }
        }

        // Optionally clear selections after successful update
        setSelectedData([]);
        setSelectedCollection("");
        handleAddVideo();
      } catch (error) {
        console.error("Error updating collection:", error);
      }
    } else {
      console.log("Please select videos and a collection.");
    }
  };

  const HandleDeleteVideos = async () => {
    if (selectedData.length > 0) {
      try {
        // Loop through each selected video
        for (const video of selectedData) {
          // Make the DELETE request for each video
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BAS_API_DOMAIN}/video_del/${video.video_id}`,
            {
              method: "DELETE",
              headers: {
                "api-key": `${process.env.NEXT_PUBLIC_ACCESS_POST_API_KEY}`,
              },
            },
          );

          // Check if the response was successful
          if (response.ok) {
            console.log(`Video ${video.video_id} successfully deleted.`);
          } else {
            console.error(
              `Error deleting video ${video.video_id}: ${response.statusText}`,
            );
          }
        }

        // Optionally clear selections after successful deletion
        setSelectedData([]);
        setSelectedCollection("");
        handleAddVideo(); // This function should be updated if needed based on new requirements
      } catch (error) {
        console.error("Error deleting videos:", error);
      }
    } else {
      console.log("Please select videos to delete.");
    }
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div>
        <div id="chartOne" className="-ml-5">
          <div className="mb-2 flex w-full items-center justify-between">
            <div className="inline-flex items-center rounded-md bg-white p-1.5 dark:bg-meta-4">
              <button className="rounded bg-white px-3 py-1 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark">
                Latest Videos
              </button>
              <button className="rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark">
                Collections
              </button>
              <button className="rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark">
                Videos
              </button>
            </div>

            {selectedData.length > 0 && (
              <div className="inline-flex items-center rounded-md bg-white p-1.5 dark:bg-meta-4">
                <select
                  className="w-full bg-transparent py-0"
                  value={`${selectedCollection}`}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                >
                  <option value="">Change videos collection</option>
                  {Collection?.map((item) => (
                    <option
                      className="bg-boxdark"
                      value={`${item.collection_id}`}
                      key={item.collection_id}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>
                <button
                  className="rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark"
                  onClick={handleCollectionChange}
                  title="Chenge collection to videos"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 100 100"
                    width="24px"
                    height="24px"
                  >
                    <path
                      fill="#88ae45"
                      d="M13 27A2 2 0 1 0 13 31A2 2 0 1 0 13 27Z"
                    />
                    <path
                      fill="#f1bc19"
                      d="M77 12A1 1 0 1 0 77 14A1 1 0 1 0 77 12Z"
                    />
                    <path
                      fill="#e6edb7"
                      d="M50 13A37 37 0 1 0 50 87A37 37 0 1 0 50 13Z"
                    />
                    <path
                      fill="#f1bc19"
                      d="M83 11A4 4 0 1 0 83 19A4 4 0 1 0 83 11Z"
                    />
                    <path
                      fill="#88ae45"
                      d="M87 22A2 2 0 1 0 87 26A2 2 0 1 0 87 22Z"
                    />
                    <path
                      fill="#fbcd59"
                      d="M81 74A2 2 0 1 0 81 78 2 2 0 1 0 81 74zM15 59A4 4 0 1 0 15 67 4 4 0 1 0 15 59z"
                    />
                    <path
                      fill="#88ae45"
                      d="M25 85A2 2 0 1 0 25 89A2 2 0 1 0 25 85Z"
                    />
                    <path
                      fill="#fff"
                      d="M18.5 51A2.5 2.5 0 1 0 18.5 56A2.5 2.5 0 1 0 18.5 51Z"
                    />
                    <path
                      fill="#f1bc19"
                      d="M21 66A1 1 0 1 0 21 68A1 1 0 1 0 21 66Z"
                    />
                    <path
                      fill="#fff"
                      d="M80 33A1 1 0 1 0 80 35A1 1 0 1 0 80 33Z"
                    />
                    <g>
                      <path
                        fill="#fdfcee"
                        d="M50 26.042A23.958 23.958 0 1 0 50 73.958A23.958 23.958 0 1 0 50 26.042Z"
                      />
                      <path
                        fill="#472b29"
                        d="M50,26.4c13.013,0,23.6,10.587,23.6,23.6S63.013,73.6,50,73.6S26.4,63.013,26.4,50 S36.987,26.4,50,26.4 M50,25c-13.807,0-25,11.193-25,25s11.193,25,25,25s25-11.193,25-25S63.807,25,50,25L50,25z"
                      />
                      <path
                        fill="#93bc39"
                        d="M49.999 30.374999999999996A19.626 19.626 0 1 0 49.999 69.627A19.626 19.626 0 1 0 49.999 30.374999999999996Z"
                      />
                      <path
                        fill="#b7cc6b"
                        d="M49.999,33.375c10.333,0,18.781,7.99,19.55,18.126 c0.038-0.497,0.076-0.994,0.076-1.5c0-10.839-8.787-19.626-19.626-19.626c-10.839,0-19.626,8.787-19.626,19.626 c0,0.506,0.038,1.003,0.076,1.5C31.218,41.365,39.667,33.375,49.999,33.375z"
                      />
                      <path
                        fill="#472b29"
                        d="M49.999,30.75c10.615,0,19.251,8.635,19.251,19.249c0,10.615-8.636,19.251-19.251,19.251 c-10.614,0-19.249-8.636-19.249-19.251C30.75,39.385,39.385,30.75,49.999,30.75 M49.999,30C38.972,30,30,38.972,30,49.999 C30,61.027,38.972,70,49.999,70C61.027,70,70,61.027,70,49.999S61.027,30,49.999,30L49.999,30z"
                      />
                    </g>
                    <g>
                      <path
                        fill="#fdfcee"
                        d="M52.8,38h-6.3c-3.038,0-5.5,2.462-5.5,5.5v10.379l-0.82-0.82C40.141,53.02,40.089,53,40.038,53 c-0.051,0-0.103,0.02-0.141,0.059l-1.838,1.838C38.02,54.936,38,54.987,38,55.038c0,0.051,0.02,0.102,0.059,0.141l4.3,4.3 c0.078,0.078,0.205,0.078,0.283,0l4.3-4.3c0.078-0.078,0.078-0.205,0-0.283l-1.838-1.838c-0.078-0.078-0.205-0.078-0.283,0 L44,53.879V43.5c0-1.381,1.119-2.5,2.5-2.5h6.3c0.11,0,0.2-0.09,0.2-0.2v-2.6C53,38.09,52.91,38,52.8,38z"
                      />
                      <path
                        fill="#472b29"
                        d="M52.5,38.5v2h-6c-1.654,0-3,1.346-3,3v10.379v1.207l0.854-0.854l0.608-0.608l1.414,1.414 L42.5,58.914l-3.876-3.876l1.414-1.414l0.608,0.608l0.854,0.854v-1.207V43.5c0-2.757,2.243-5,5-5H52.5 M52.8,38h-6.3 c-3.038,0-5.5,2.462-5.5,5.5v10.379l-0.82-0.82C40.141,53.02,40.089,53,40.038,53c-0.051,0-0.103,0.02-0.141,0.059l-1.838,1.838 C38.02,54.936,38,54.987,38,55.038c0,0.051,0.02,0.102,0.059,0.141l4.3,4.3c0.039,0.039,0.09,0.059,0.141,0.059 s0.102-0.02,0.141-0.059l4.3-4.3c0.078-0.078,0.078-0.205,0-0.283l-1.838-1.838C45.064,53.02,45.013,53,44.962,53 s-0.102,0.02-0.141,0.059L44,53.879V43.5c0-1.381,1.119-2.5,2.5-2.5h6.3c0.11,0,0.2-0.09,0.2-0.2v-2.6C53,38.09,52.91,38,52.8,38 L52.8,38z"
                      />
                      <g>
                        <path
                          fill="#fdfcee"
                          d="M47.2,62h6.3c3.038,0,5.5-2.462,5.5-5.5V46.121l0.82,0.82C59.859,46.98,59.911,47,59.962,47 c0.051,0,0.103-0.02,0.141-0.059l1.838-1.838C61.98,45.064,62,45.013,62,44.962c0-0.051-0.02-0.102-0.059-0.141l-4.3-4.3 c-0.078-0.078-0.205-0.078-0.283,0l-4.3,4.3c-0.078,0.078-0.078,0.205,0,0.283l1.838,1.838c0.078,0.078,0.205,0.078,0.283,0 l0.82-0.82V56.5c0,1.381-1.119,2.5-2.5,2.5h-6.3c-0.11,0-0.2,0.09-0.2,0.2v2.6C47,61.91,47.09,62,47.2,62z"
                        />
                        <path
                          fill="#472b29"
                          d="M57.5,41.086l3.876,3.876l-1.414,1.414l-0.608-0.608L58.5,44.914v1.207V56.5c0,2.757-2.243,5-5,5 h-6v-2h6c1.654,0,3-1.346,3-3V46.121v-1.207l-0.854,0.854l-0.608,0.608l-1.414-1.414L57.5,41.086 M57.5,40.462 c-0.051,0-0.102,0.02-0.141,0.059l-4.3,4.3c-0.078,0.078-0.078,0.205,0,0.283l1.838,1.838C54.936,46.98,54.987,47,55.038,47 s0.102-0.02,0.141-0.059l0.82-0.82V56.5c0,1.381-1.119,2.5-2.5,2.5h-6.3c-0.11,0-0.2,0.09-0.2,0.2v2.6c0,0.11,0.09,0.2,0.2,0.2 h6.3c3.038,0,5.5-2.462,5.5-5.5V46.121l0.82,0.82C59.859,46.98,59.911,47,59.962,47c0.051,0,0.103-0.02,0.141-0.059l1.838-1.838 C61.98,45.064,62,45.013,62,44.962c0-0.051-0.02-0.102-0.059-0.141l-4.3-4.3C57.602,40.481,57.551,40.462,57.5,40.462L57.5,40.462 z"
                        />
                      </g>
                    </g>
                  </svg>
                </button>
                <button
                  onClick={HandleDeleteVideos}
                  className="rounded px-3 py-1 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark"
                  title="Deleted Selected Videos"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 100 100"
                    width="24px"
                    height="24px"
                  >
                    <path
                      fill="#ee3e54"
                      d="M13 27A2 2 0 1 0 13 31A2 2 0 1 0 13 27Z"
                    />
                    <path
                      fill="#f1bc19"
                      d="M77 12A1 1 0 1 0 77 14A1 1 0 1 0 77 12Z"
                    />
                    <path
                      fill="#fce0a2"
                      d="M50 13A37 37 0 1 0 50 87A37 37 0 1 0 50 13Z"
                    />
                    <path
                      fill="#f1bc19"
                      d="M83 11A4 4 0 1 0 83 19A4 4 0 1 0 83 11Z"
                    />
                    <path
                      fill="#ee3e54"
                      d="M87 22A2 2 0 1 0 87 26A2 2 0 1 0 87 22Z"
                    />
                    <path
                      fill="#fbcd59"
                      d="M81 74A2 2 0 1 0 81 78 2 2 0 1 0 81 74zM15 59A4 4 0 1 0 15 67 4 4 0 1 0 15 59z"
                    />
                    <path
                      fill="#ee3e54"
                      d="M25 85A2 2 0 1 0 25 89A2 2 0 1 0 25 85Z"
                    />
                    <path
                      fill="#fff"
                      d="M18.5 51A2.5 2.5 0 1 0 18.5 56A2.5 2.5 0 1 0 18.5 51Z"
                    />
                    <path
                      fill="#f1bc19"
                      d="M21 66A1 1 0 1 0 21 68A1 1 0 1 0 21 66Z"
                    />
                    <path
                      fill="#fff"
                      d="M80 33A1 1 0 1 0 80 35A1 1 0 1 0 80 33Z"
                    />
                    <g>
                      <path
                        fill="#8b8bc1"
                        d="M41.7,74.3c-3.8,0-8-2.1-8-6.8V41.9l-3-3.5V35c0-4.8,2.1-6.7,7.1-6.7h24.3c5.1,0,7.1,2,7.1,6.7v3.5l-3,3.4 v25.6c0,4.6-4.2,6.8-8.1,6.8H41.7z"
                      />
                      <path
                        fill="#472b29"
                        d="M62.2,29c5.4,0,6.4,2.3,6.4,6v0.2v1v2l-2.7,3l-0.3,0.4v0.5v25.4c0,4.2-3.7,6.1-7.4,6.1H41.7 c-3.6,0-7.3-1.9-7.3-6.1V42.2v-0.5l-0.3-0.4l-2.7-3.1v-2v-1V35c0-3.7,1.1-6,6.4-6L62.2,29 M62.2,27.6H37.8C32,27.6,30,30.2,30,35 v0.2v1v2.6l3,3.5v25.3c0,4.9,4.2,7.5,8.7,7.5h16.5c4.6,0,8.8-2.6,8.8-7.5V42.1l3-3.4v-2.6v-1V35C70,30.2,68,27.6,62.2,27.6 L62.2,27.6z"
                      />
                      <path
                        fill="#6869ad"
                        d="M37.4 56.6V43.1c0-1 .9-1.8 1.9-1.8l0 0c1.1 0 1.9.8 1.9 1.8v13.2V67c0 1-.9 1.8-1.9 1.8l0 0c-1.1 0-1.9-.8-1.9-1.8v-2.2M44.3 56.6V43.1c0-1 .9-1.8 2-1.8l0 0c1.1 0 2 .8 2 1.8v13.2V67c0 1-.9 1.8-2 1.8l0 0c-1.1 0-2-.8-2-1.8v-2.2"
                      />
                      <path
                        fill="#472b29"
                        d="M46.5 41.8c.9 0 1.7.6 1.7 1.3v13.2V67c0 .7-.8 1.3-1.7 1.3s-1.7-.6-1.7-1.3v-2.2-8.1V43.1C44.8 42.4 45.5 41.8 46.5 41.8M46.5 41.3c-1.2 0-2.2.8-2.2 1.8v13.6 8.1V67c0 1 1 1.8 2.2 1.8s2.2-.8 2.2-1.8V56.3 43.1C48.6 42.1 47.6 41.3 46.5 41.3L46.5 41.3zM39.5 68.8c-1.2 0-2.3-.9-2.3-2v-2.3c0-.1.1-.3.3-.3s.3.1.3.3v2.3c0 .8.8 1.5 1.8 1.5s1.8-.7 1.8-1.5V43.3c0-.8-.8-1.5-1.8-1.5s-1.8.7-1.8 1.5v9.2c0 .1-.1.3-.3.3s-.3-.1-.3-.3v-9.2c0-1.1 1-2 2.3-2s2.3.9 2.3 2v23.5C41.8 67.9 40.7 68.8 39.5 68.8z"
                      />
                      <path
                        fill="#6869ad"
                        d="M51.4 56.6V43.1c0-1 .9-1.8 2-1.8l0 0c1.1 0 2 .8 2 1.8v13.2V67c0 1-.9 1.8-2 1.8l0 0c-1.1 0-2-.8-2-1.8v-2.2M58.5 56.6V43.1c0-1 .9-1.8 2-1.8l0 0c1.1 0 2 .8 2 1.8v13.2V67c0 1-.9 1.8-2 1.8l0 0c-1.1 0-2-.8-2-1.8v-2.2"
                      />
                      <path
                        fill="#6869ad"
                        d="M51.4 56.6V43.1c0-1 .9-1.8 2-1.8l0 0c1.1 0 2 .8 2 1.8v13.2V67c0 1-.9 1.8-2 1.8l0 0c-1.1 0-2-.8-2-1.8v-2.2M58.5 56.6V43.1c0-1 1-1.8 2.2-1.8l0 0c1.2 0 2.2.8 2.2 1.8v13.2V67c0 1-1 1.8-2.2 1.8l0 0c-1.2 0-2.2-.8-2.2-1.8v-2.2"
                      />
                      <path
                        fill="#472b29"
                        d="M53.5 41.8c.9 0 1.6.6 1.6 1.3v13.2V67c0 .7-.7 1.3-1.6 1.3s-1.6-.6-1.6-1.3v-2.2-8.1V43.1C51.9 42.4 52.7 41.8 53.5 41.8M53.5 41.3c-1.2 0-2.1.8-2.1 1.8v13.6 8.1V67c0 1 1 1.8 2.1 1.8s2.1-.8 2.1-1.8V56.3 43.1C55.7 42.1 54.7 41.3 53.5 41.3L53.5 41.3zM60.6 41.5c1 0 1.8.6 1.8 1.3v13.5 10.9c0 .7-.8 1.3-1.8 1.3s-1.8-.6-1.8-1.3v-2.3-8.3V42.8C58.8 42.1 59.7 41.5 60.6 41.5M60.6 41c-1.3 0-2.3.8-2.3 1.8v13.8 8.3 2.3c0 1 1 1.8 2.3 1.8s2.3-.8 2.3-1.8V56.3 42.8C63 41.8 61.9 41 60.6 41L60.6 41zM32.6 45.8v7.4h0c-1.2 0-2.2-.9-2.2-1.9v-3.7C30.4 46.6 31.4 45.8 32.6 45.8L32.6 45.8M34 44.4h-1.4c-2 0-3.6 1.5-3.6 3.3v3.7c0 1.8 1.6 3.3 3.6 3.3H34V44.4L34 44.4zM67.4 45.8c1.2 0 2.2.9 2.2 1.9v3.7c0 1-1 1.9-2.2 1.9h0L67.4 45.8 67.4 45.8M67.4 44.4H66v10.2h1.4c2 0 3.6-1.5 3.6-3.3v-3.7C71 45.9 69.4 44.4 67.4 44.4L67.4 44.4zM54.3 24.4c1.2 0 2.3 1.3 2.3 2.8v.3H43.4v-.3c0-1.5 1-2.8 2.3-2.8L54.3 24.4M54.3 23h-8.7c-2 0-3.7 1.9-3.7 4.2v1.7h16v-1.7C58 24.9 56.3 23 54.3 23L54.3 23zM68.2 39H31.5c-.1 0-.3-.1-.3-.3s.1-.3.3-.3h36.7c.1 0 .3.1.3.3S68.4 39 68.2 39zM61.5 32.8h-31c-.1 0-.3-.1-.3-.3s.1-.3.3-.3h31c.1 0 .3.1.3.3S61.6 32.8 61.5 32.8zM64.2 71.6H35.6c-.1 0-.3-.1-.3-.3s.1-.3.3-.3h28.5c.1 0 .3.1.3.3S64.3 71.6 64.2 71.6zM66.2 32.9h-3.1c-.1 0-.3-.1-.3-.3s.1-.3.3-.3h3.1c.1 0 .3.1.3.3S66.3 32.9 66.2 32.9zM37.5 58.8c-.1 0-.3-.1-.3-.3v-3.7c0-.1.1-.3.3-.3s.3.1.3.3v3.7C37.7 58.7 37.6 58.8 37.5 58.8z"
                      />
                      <g>
                        <path
                          fill="#472b29"
                          d="M69.5,36h-39c-0.3,0-0.5-0.2-0.5-0.5s0.2-0.5,0.5-0.5h39c0.3,0,0.5,0.2,0.5,0.5S69.8,36,69.5,36z"
                        />
                      </g>
                    </g>
                  </svg>
                </button>
              </div>
            )}
          </div>
          <Swiper
            direction={"vertical"}
            slidesPerView={"auto"}
            freeMode={true}
            scrollbar={true}
            mousewheel={true}
            modules={[FreeMode, Scrollbar, Mousewheel]}
            className="mySwiper max-h-180 rounded-md bg-white dark:bg-meta-4"
          >
            <SwiperSlide>
              <div className="grid items-center gap-2 px-2 py-2 lg:grid-cols-3 xl:grid-cols-4">
                {videos?.map((video) => (
                  <div className="relative" key={video.video_id}>
                    <div className="video_card relative z-99 h-50 w-full rounded-md bg-white text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark">
                      <div
                        onMouseDown={() => handleMouseDown(video)}
                        onMouseEnter={() => handleMouseEnter(video)}
                        onMouseUp={handleMouseUp}
                        onClick={() => {
                          toggleSelection(video);
                        }}
                        onTouchStart={() => handleTouchStart(video)}
                        onTouchMove={() => handleTouchMove(video)}
                        onTouchEnd={handleTouchEnd}
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
                          className="edition_dot absolute right-0 top-0 flex max-h-8 max-w-3 flex-col items-center  justify-center gap-1 p-3 text-black hover:bg-white hover:shadow-card dark:bg-meta-4 dark:text-white dark:hover:bg-boxdark"
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
                              `https://m27player.b-cdn.net/${video.video_id}/video.m3u8`,
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
                          onClick={() =>
                            handleMoveToCollectionsClick(video.video_id)
                          }
                          className=" flex w-full cursor-pointer flex-row items-start justify-start gap-2 rounded-sm px-2 py-0.5 hover:bg-white hover:shadow-card dark:hover:bg-boxdark"
                        >
                          {!video.collection_id && <MoveCollectionSVG />}
                          {video.collection_id && <ChangeCollectionIcon />}{" "}
                          <span>
                            {video.collection_id
                              ? "Chang collection"
                              : "Move to collection"}
                          </span>
                        </li>
                        {showCollectionSelector === video.video_id && (
                          <li className="w-full flex-row items-center justify-center px-2 pl-4">
                            <ul className="bg-back w-full rounded-md bg-boxdark">
                              <li className="w-full">
                                <select
                                  className="w-full bg-transparent py-2"
                                  onChange={(e) =>
                                    handleChange(e, video.video_id)
                                  }
                                  value={
                                    video.collection_id ||
                                    selectedCollection ||
                                    ""
                                  }
                                >
                                  {Collection?.map((item) => (
                                    <option
                                      className="bg-boxdark"
                                      value={item.collection_id}
                                      key={item.name}
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
                          onClick={() =>
                            handleMovieFileDownloadiing(video.video_id)
                          }
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
                      {video.video_status != "streaming" ? (
                        <CircularProgress />
                      ) : (
                        ""
                      )}
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
                          `https://m27player.b-cdn.net/${video.video_id}/video.m3u8`,
                        )
                      }
                    >
                      <h6
                        className="overflow-hidden text-ellipsis whitespace-nowrap"
                        title={video.title}
                      >
                        {video.title}
                      </h6>
                      <p
                        title={new Date(video.created_at).toLocaleDateString()}
                      >
                        Uploaded on:{" "}
                        {new Date(video.created_at).toLocaleDateString()}
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
                        <div
                          className="bg-yallow-200 absolute right-2 top-2 z-99 rounded-full px-1 py-0.5 text-sm"
                          onClick={() => handleRedownloading(video.video_id)}
                        >
                          Redownload
                        </div>
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
                        <div
                          className="bg-yallow-200 absolute right-2 top-2 z-99 rounded-full px-1 py-0.5 text-sm"
                          onClick={() => handleRedownloading(video.video_id)}
                        >
                          Redownload
                        </div>
                      </>
                    )}
                    {selectedData.some(
                      (item) => item.video_id === video.video_id,
                    ) && (
                      <div
                        className="absolute -left-1 -top-1 z-99 rounded-full bg-emerald-300 px-1 py-1 text-white"
                        title={video.video_status}
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
                ))}
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default ChartOne;
