"use client"; // Mark the component as a client component

import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of the collection context state
interface CollectionContextType {
  isCollectionVisible: boolean;
  showCollection: () => void;
  hideCollection: () => void;
  toggleCollection: () => void;
}

// Create the context with an initial undefined value
const HandleCollectionsContext = createContext<
  CollectionContextType | undefined
>(undefined);

// Create the provider component
export const HandleCollectionsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isCollectionVisible, setCollectionVisible] = useState(false);

  const showCollection = () => {
    setCollectionVisible(true);
  };

  const hideCollection = () => {
    setCollectionVisible(false);
  };

  const toggleCollection = () => {
    setCollectionVisible((prevVisible) => !prevVisible);
  };

  return (
    <HandleCollectionsContext.Provider
      value={{
        isCollectionVisible,
        showCollection,
        hideCollection,
        toggleCollection,
      }}
    >
      {children}
    </HandleCollectionsContext.Provider>
  );
};

// Hook to use the HandleCollectionsContext
export const useHandleCollections = () => {
  const context = useContext(HandleCollectionsContext);
  if (!context) {
    throw new Error(
      "useHandleCollections must be used within a HandleCollectionsProvider"
    );
  }
  return context;
};
