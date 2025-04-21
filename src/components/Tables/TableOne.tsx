import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";

type Domain = {
  domain_name: string;
  id: number;
};

type TableOneProps = {
  domains: Domain[];
  handleDomainAdded: () => void;
};

const TableOne = ({ domains, handleDomainAdded }: TableOneProps) => {
  const handleDeletDn = async (domain_id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BAS_API_DOMAIN}/api_poster/delete_allow_&_block_domain/${domain_id}`,
        {
          method: "delete",
          headers: {
            "api-key": `${process.env.NEXT_PUBLIC_ACCESS_POST_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        console.error("External server error");
      } else {
        handleDomainAdded();
      }
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
    }
  };

  return (
    <div className="rounded-sm bg-white px-5 pb-2.5 pt-6 dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Allow Access Domain
      </h4>
      <hr />
      <div className="mt-2 flex flex-col">
        <div className="flex flex-col items-start gap-2 justify-center">
          {domains.map((domain) => (
            <div
              key={domain.id} // Use domain.id as the key
              className="flex w-fit flex-row flex-nowrap items-center justify-start gap-2 rounded-full bg-slate-300 px-3 py-2 text-sm font-medium text-black dark:border dark:border-strokedark dark:bg-transparent dark:text-white"
            >
              <div>{domain.domain_name}</div> {/* Display domain_name */}
              <div
                onClick={() => handleDeletDn(`${domain.id}`)}
                className="flex h-5 w-5 flex-col items-center justify-center rounded-full bg-red text-black dark:text-white"
              >
                <svg
                  className="h-4 w-4 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableOne;
