"use client"; // Ensure this is at the top to mark as a client component

import { VideoProvider } from "@/app/appContext/videoDetail";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import SearchPage from "@/components/searchPage";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // Ensure these imports are from next/navigation
import { Video } from "@/components/Charts/ChartOne";
import Loading from "./loading";

const Page: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || ""; // Get the search query
  const pageParam = searchParams.get("_page") || 1; // Get the page query parameter
  const initialPage = pageParam ? parseInt(pageParam, 10) : 1;

  const [results, setResults] = useState<Video[]>([]); // Ensure proper type for results
  const [current_page, setPage] = useState<number>(initialPage);
  const [pageCount, setPageCount] = useState<number>(0);

  useEffect(() => {
    if (query) {
      // Fetch only if the query is not empty
      fetch(
        `https://m27.shop/api/search?query=${encodeURIComponent(query)}${
          initialPage ? `&page=${initialPage}` : ""
        }`,
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error("Network response was not ok");
          }
          return res.json();
        })
        .then((data) => {
          setResults(data.videos); // Set the results
          setPageCount(data.pagination.last_page); // Set the total page count
          setPage(data.pagination.current_page); // Set the current page
          setIsLoading(false);
        })
        .catch((err) => console.error("Error fetching videos:", err));
    } else {
      // Clear videos when query is empty
      setResults([]);
    }
  }, [query, initialPage]);

  const handlePagination = (
    event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    router.push(`/search?query=${encodeURIComponent(query)}&_page=${value}`);
    setPage(value);
    setIsLoading(true);
  };

  if (isLoading) {
    return (
      <DefaultLayout>
        <Loading />
      </DefaultLayout>
    );
  }
  // Handle no results case
  if (results.length === 0) {
    return (
      <DefaultLayout>
        <div className="w-full">
          <h5 className="mb-3 font-semibold text-[#B45454]">
            No results found for: {query}
          </h5>
          <ul>
            <li className="leading-relaxed text-[#CD5D5D]">
              Please try a different search term.
            </li>
          </ul>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <SearchPage
        pageCount={pageCount}
        current_page={current_page}
        query={query}
        results={results || []}
        handlePagination={handlePagination}
      />
    </DefaultLayout>
  );
};

export default Page;
