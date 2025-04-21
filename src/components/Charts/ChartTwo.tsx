import { ApexOptions } from "apexcharts";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const options: ApexOptions = {
  colors: ["#c1210e", "#088989"],
  chart: {
    fontFamily: "Satoshi, sans-serif",
    type: "bar",
    height: 335,
    stacked: true,
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
  },
  xaxis: {
    categories: ["Transmitted", "Received"],
  },
  legend: {
    position: "top",
    horizontalAlign: "left",
  },
  fill: {
    opacity: 1,
  },
};

const ChartTwo: React.FC = () => {
  const [series, setSeries] = useState([
    {
      name: "Bandwidth",
      data: [0, 0], // Initial data
    },
  ]);

  useEffect(() => {
    const fetchBandwidthData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BAS_API_DOMAIN}/bandwidth-metrics`
        );
        const data = await response.json();
        setSeries([
          {
            name: "Bandwidth",
            data: [data.tx_sec, data.rx_sec], // Bandwidth data in bytes per second
          },
        ]);
      } catch (error) {
        console.error("Error fetching bandwidth data:", error);
      }
    };

    fetchBandwidthData();

    const intervalId = setInterval(fetchBandwidthData, 50000); // Fetch data every 5 seconds

    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, []);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-6">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Bandwidth Used
          </h4>
        </div>
      </div>

      <div>
        <div id="chartTwo" className="-mb-9 -ml-5">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={350}
            width={"100%"}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartTwo;
