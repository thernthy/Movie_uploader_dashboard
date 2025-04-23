import React, { useState } from "react";
import { useHandleCollections } from "@/app/appContext/popUpCategoryAdd"; // Import the context
type ComponentPropType = {
  HandleRefresh: () => void;
};

const PopAddcollection: React.FC<ComponentPropType> = ({ HandleRefresh }) => {
  // Access the context values
  const { isCollectionVisible, hideCollection } = useHandleCollections();
  const [collectionName, setCollectionName] = useState("");
  const [message, setMessage] = useState("");
  // Function to handle clicks outside the modal content to close it
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // If the target is the overlay (main container) itself, hide the collection
    if (event.target === event.currentTarget) {
      hideCollection();
    }
  };

  // Render the modal only if `isCollectionVisible` is true
  if (!isCollectionVisible) {
    return null;
  }
  const handleCreateCollection = async () => {
    const response = await fetch(
      "https://encodingzipuploader.m27.shop/created_collection.php",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": "thernthy862003",
        },
        body: JSON.stringify({ collection_name: collectionName }),
      },
    );

    const data = await response.json();
    if (response.status === 201 || response.status === 409) {
      setMessage(data.message || "Collection created successfully");
      if (data.message === "Collection created successfully") {
        hideCollection();
        HandleRefresh();
      }
    } else {
      setMessage(data.error || "Failed to create collection");
    }
  };

  if (!isCollectionVisible) {
    return null;
  }

  return (
    <div
      className="overlay fixed inset-0 z-99 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleOverlayClick} // Detect click on the overlay
    >
      <div className="modal-content flex max-h-125 min-h-115 min-w-59 flex-col items-center justify-center gap-10 rounded-md bg-black px-6 py-6 dark:bg-white md:min-w-171.5">
        <div className="logo mb-1 flex w-full flex-col items-center justify-center gap-4 text-center">
          <img
            src="https://cdn-icons-png.flaticon.com/128/7931/7931221.png"
            alt="logo"
            style={{ width: "10%", height: "auto" }}
          />
          <h3>
            <b>Video Collection</b>
            {message && (
              <p>
                {collectionName} {message}
              </p>
            )}
          </h3>
        </div>
        <div className="inp w-full">
          <input
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            type="text"
            className="text-black-900 placeholder-gray-900 border-1 w-full rounded-md border  px-4 py-2 focus:outline-none"
            placeholder="video description ...."
            style={{
              background: "transparent",
              borderColor: "rgba(128, 128, 128, 0.48)",
            }}
          />
        </div>
        <div className="mt-4 flex w-full justify-around">
          <button
            onClick={handleCreateCollection}
            className="w-2/5 rounded-full bg-orange-400 px-4 py-2 text-white"
          >
            Create
          </button>
          <button
            className="w-2/5 rounded-full border px-4 py-2"
            onClick={() => hideCollection()}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopAddcollection;
