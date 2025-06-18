"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "../axiosInstance";

export default function DevicesPage() {
    const [responseMessage, setResponseMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login"); // Redireciona para a página de login se não houver token
            return;
        }

        const id = searchParams.get("id");
        const status = searchParams.get("status") as "allow" | "block";

        if (id && status) {
            updateDeviceStatus(id, status);
        } else {
            setLoading(false); // Remove o estado de loading se não houver parâmetros
        }
    }, [router, searchParams]);

    const updateDeviceStatus = async (id: string, status: "allow" | "block") => {
        setLoading(true); // Ativa o estado de loading enquanto o request é processado
        try {
            const response = await axios.patch(
                `/api/devices/${id}/status`,
                {
                    allowed: status === "allow",
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            const data = response.data;
            setResponseMessage(
                `Device "${data.name}" has been ${
                    status === "allow" ? "allowed" : "blocked"
                } on the network.`
            );

            // Redireciona para a dashboard após 5 segundos
            setTimeout(() => {
                router.push("/dashboard");
            }, 5000);
        } catch (error) {
            console.error("Error updating device status:", error);
            setResponseMessage(
                "An error occurred while updating the device status."
            );
        } finally {
            setLoading(false); // Desativa o estado de loading após o request
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <p className="text-lg font-medium text-gray-700 animate-pulse">
                    Loading...
                </p>
            </div>
        );
    }

    return (
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
    );
}
