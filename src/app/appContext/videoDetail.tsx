// src/app/appContext/videoDetail.tsx

"use client"; // Mark the component as a client component

import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of the video details context state
interface VideoDetails {
  video_id: string;
  title: string;
  video_play_url: string;
}

interface VideoContextType {
  video: VideoDetails | null;
  setVideo: (video: VideoDetails) => void;
  clearVideo: () => void;
  isModalVisible: boolean;
  showModal: () => void;
  hideModal: () => void;
}

// Create the context with an initial undefined value
const VideoContext = createContext<VideoContextType | undefined>(undefined);

// Create the provider component
export const VideoProvider = ({ children }: { children: ReactNode }) => {
  const [video, setVideoState] = useState<VideoDetails | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const setVideo = (video: VideoDetails) => {
    setVideoState(video);
    showModal(); // Show modal when a video is set
  };

  const clearVideo = () => {
    setVideoState(null);
    hideModal(); // Hide modal when the video is cleared
  };

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  return (
    <VideoContext.Provider
      value={{
        video,
        setVideo,
        clearVideo,
        isModalVisible,
        showModal,
        hideModal,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

// Hook to use the VideoContext
export const useVideo = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideo must be used within a VideoProvider");
  }
  return context;
};
