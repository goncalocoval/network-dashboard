'use client';

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "../axiosInstance";

interface Props {
  setLoading: (loading: boolean) => void;
  setResponseMessage: (message: string) => void;
}

export default function SearchHandler({ setLoading, setResponseMessage }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const id = searchParams.get("id");
    const status = searchParams.get("status") as "allow" | "block";

    const updateDeviceStatus = async () => {
      if (!id || !status) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.patch(
          `/api/devices/${id}/status`,
          { allowed: status === "allow" },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = response.data;
        setResponseMessage(
          `Device "${data.name}" has been ${status === "allow" ? "allowed" : "blocked"} on the network.`
        );

        setTimeout(() => {
          router.push("/dashboard");
        }, 5000);
      } catch (error) {
        console.error("Error updating device status:", error);
        setResponseMessage("An error occurred while updating the device status.");
      } finally {
        setLoading(false);
      }
    };

    updateDeviceStatus();
  }, [router, searchParams, setLoading, setResponseMessage]);

  return null;
}