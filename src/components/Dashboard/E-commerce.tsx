"use client";
import dynamic from "next/dynamic";
import ChartOne, { Collection } from "../Charts/ChartOne";
import React, { useEffect, useState } from "react";
import ChartTwo from "../Charts/ChartTwo";
import ChatCard from "../Chat/ChatCard";
import TableOne from "../Tables/TableOne";
import CardDataStats from "../CardDataStats";
import AddDomainForm from "../FormElements/addDomain";
import UploadingVideos from "../Chat/upload_videos";
import VideoDetail from "../model/VideoDetial";
import { PlusIcon } from "../icons/icons";
import { useRouter } from "next/navigation";
import { useHandleCollections } from "@/app/appContext/popUpCategoryAdd";
import PopAddcollection from "../popUpmodel/AddCollection";

const MapOne = dynamic(() => import("@/components/Maps/MapOne"), {
  ssr: false,
});

const ChartThree = dynamic(() => import("@/components/Charts/ChartThree"), {
  ssr: false,
});

const ECommerce: React.FC = () => {
  const router = useRouter();
  const [domains, setDomains] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [videos, setVideos] = useState([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const {
    isCollectionVisible,
    showCollection,
    hideCollection,
    toggleCollection,
  } = useHandleCollections();

  //fetch collection
  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BAS_API_DOMAIN}/collections`,
          {
            headers: {
              "api-key": `${process.env.NEXT_PUBLIC_ACCESS_GET_API_KEY}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          console.log(data.collection);
          setCollections(data.collections);
        }
      } catch (error) {
        console.error(`Failed to fetch progress for video:`, error);
      }
    };

    fetchCollection();
  }, [refresh]);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const res = await fetch("/api/domains");
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        setDomains(data);
      } catch (error) {
        console.error("Failed to fetch domains:", error);
      }
    };

    fetchDomains();
  }, [refresh]);

  const handleDomainAdded = () => {
    setRefresh(!refresh); // Toggle refresh state to trigger useEffect
  };

  //handle category click
  const handleCleckedCategory = (category_id: string) => {
    router.push(`/collection/${category_id}`);
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BAS_API_DOMAIN}/laste_videos`,
          {
            method: "GET",
            headers: {
              "api-key":
                process.env.NEXT_PUBLIC_ACCESS_GET_API_KEY || "1234567",
            },
          }
        );
        const data = await response.json();
        setVideos(data.processed_videos);
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      }
    };

    fetchVideos(); // Fetch immediately on mount

    const intervalId = setInterval(() => {
      fetchVideos();
    }, 120000); // 120000 ms = 2 minutes

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [refresh]);

  //handle add video refresh functions
  const handleAddVideo = () => {
    setRefresh(!refresh);
  };
  const HandleRefresh = () => {
    setRefresh(!refresh); // Toggle refresh state to trigger useEffect
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-1 md:grid-cols-3 md:gap-1 xl:grid-cols-5 2xl:gap-1">
        {collections.map((item) => (
          <CardDataStats
            title={`${item.total_files} files`}
            total={item.name}
            rate=""
            modleClick={() => handleCleckedCategory(item.collection_id)}
          >
            <svg
              fill="#ffff"
              height="16"
              width="22"
              version="1.1"
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 482.14 482.14"
              xmlSpace="preserve"
            >
              <g>
                <path
                  d="M302.597,0H108.966C80.66,0,57.651,23.026,57.651,51.315v379.509c0,28.289,23.009,51.316,51.315,51.316h264.206
                    c28.273,0,51.316-23.026,51.316-51.316V121.449L302.597,0z M373.172,450.698H108.966c-10.97,0-19.89-8.905-19.89-19.874V51.315
                    c0-10.953,8.92-19.858,19.89-19.858l181.874-0.188v67.217c0,19.653,15.949,35.604,35.587,35.604l65.878-0.189l0.727,296.925
                    C393.032,441.793,384.142,450.698,373.172,450.698z"
                />
                <path
                  d="M232.497,91.228c0-4.654-3.774-8.429-8.429-8.429h-97.47c-4.655,0-8.429,3.775-8.429,8.429v97.459
                    c0,4.654,3.774,8.429,8.429,8.429h97.47c4.655,0,8.429-3.774,8.429-8.429V91.228z"
                />
                <path
                  d="M232.497,412.747c0,4.656,3.774,8.43,8.429,8.43h113.587c4.655,0,8.429-3.773,8.429-8.43V323.47
                    c0-4.655-3.774-8.429-8.429-8.429H240.926c-4.655,0-8.429,3.774-8.429,8.429V412.747z M256.703,339.249h82.033v57.723h-82.033
                    V339.249z"
                />
                <path
                  d="M344.111,216.862H131.629c-6.683,0-12.103,5.421-12.103,12.104c0,6.683,5.421,12.104,12.103,12.104h212.482
                    c6.683,0,12.103-5.421,12.103-12.104C356.214,222.283,350.793,216.862,344.111,216.862z"
                />
                <path
                  d="M260.739,192.654h83.372c6.683,0,12.103-5.421,12.103-12.104c0-6.683-5.421-12.104-12.103-12.104h-83.372
                    c-6.684,0-12.105,5.421-12.105,12.104C248.634,187.233,254.055,192.654,260.739,192.654z"
                />
                <path
                  d="M344.111,265.277H131.629c-6.683,0-12.103,5.421-12.103,12.104c0,6.683,5.421,12.104,12.103,12.104h212.482
                    c6.683,0,12.103-5.421,12.103-12.104C356.214,270.698,350.793,265.277,344.111,265.277z"
                />
                <path
                  d="M198.863,313.693h-67.233c-6.683,0-12.103,5.421-12.103,12.104c0,6.684,5.421,12.104,12.103,12.104h67.233
                    c6.683,0,12.105-5.421,12.105-12.104C210.967,319.114,205.546,313.693,198.863,313.693z"
                />
                <path
                  d="M198.863,362.109h-67.233c-6.683,0-12.103,5.421-12.103,12.103c0,6.683,5.421,12.104,12.103,12.104h67.233
                    c6.683,0,12.105-5.421,12.105-12.104C210.967,367.53,205.546,362.109,198.863,362.109z"
                />
              </g>
            </svg>
          </CardDataStats>
        ))}
        <div
          onClick={showCollection}
          className="flex flex-row items-center justify-center rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark"
        >
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <PlusIcon />
          </div>
        </div>
      </div>

      <div className="mt-1 grid grid-cols-12 gap-1 md:mt-1 md:gap-1 2xl:mt-1 2xl:gap-1">
        <ChartThree />
        <ChartTwo />
        <ChartOne
          Collection={collections}
          videos={videos}
          handleAddVideo={handleAddVideo}
        />
        {/* <ChatCard handleAddVideo={handleAddVideo} /> */}
        <UploadingVideos handleAddVideo={handleAddVideo} />
        <AddDomainForm handleDomainAdded={handleDomainAdded} />
        <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
          <TableOne handleDomainAdded={handleDomainAdded} domains={domains} />
        </div>
      </div>
      <VideoDetail refresh={refresh} setRefresh={setRefresh} />
      <PopAddcollection HandleRefresh={HandleRefresh} />
    </>
  );
};

export default ECommerce;
