import React, { useState } from "react";
import SwitcherThree from "@/components/Switchers/SwitcherThree";
import CircularIntegration from "../buttons/save_progress";

type AddDomainFormProps = {
  handleDomainAdded: () => void;
};

const AddDomainForm: React.FC<AddDomainFormProps> = ({ handleDomainAdded }) => {
  const [domain, setDomain] = useState<string>("");
  const [isAllowed, setIsAllowed] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/add-domain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          AccessKey: `${process.env.ACCESS_POST_API_KEY}`,
        },
        body: JSON.stringify({ domain, isAllowed }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess("Domain added successfully!");
        setDomain("");
        setIsAllowed(true);
        handleDomainAdded(); // Notify parent about successful domain addition
      } else {
        setError(result.message || "Failed to add domain");
      }
    } catch (error) {
      setError("An error occurred while adding the domain");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-8">
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Add Allow Domain
          </h3>
        </div>
        <div className="flex flex-col gap-5.5 p-6.5">
          <form onSubmit={handleSubmit}>
            <div>
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Domain
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="domain.com"
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Allow
              </label>
              <SwitcherThree
                checked={isAllowed}
                onChange={() => setIsAllowed((prev) => !prev)}
              />
            </div>
            <button type="submit" className="mt-4">
              <CircularIntegration
                loading={loading}
                successMessage={success}
                errorMessage={error}
              />
              {loading && <span className="ml-2">Adding...</span>}
            </button>
            {/* Optionally, you can remove error and success messages from here if they are handled in CircularIntegration */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDomainForm;
