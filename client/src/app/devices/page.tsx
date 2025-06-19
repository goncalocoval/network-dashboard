'use client';

import { useState } from "react";
import SearchHandler from "./search";

export default function DevicesPage() {
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  return (
    <>
      <SearchHandler setLoading={setLoading} setResponseMessage={setResponseMessage} />
      {loading ? (
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <p className="text-lg font-medium text-gray-700 animate-pulse">
            Loading...
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="bg-white shadow-md rounded-lg p-6 max-w-md text-center">
            {responseMessage && (
              responseMessage.includes("allowed") ? (
                <p className="text-lg font-semibold text-green-600 mb-4">
                  {responseMessage}
                </p>
              ) : (
                <p className="text-lg font-semibold text-red-600 mb-4">
                  {responseMessage}
                </p>
              )
            )}
            <p className="text-sm text-gray-500">
              You will be redirected to the dashboard shortly.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export const dynamic = 'force-dynamic';