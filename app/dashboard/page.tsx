"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearTokens } from "@/lib/auth";
import { CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const hasToken = Object.keys(window.localStorage).some((key) =>
            key.toLowerCase().includes("token") && Boolean(window.localStorage.getItem(key))
        );

        if (!hasToken) {
            router.replace(CONFIG.ROUTES.LOGIN);
            return;
        }

        setIsChecking(false);
    }, [router]);

    if (isChecking) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-sm text-muted-foreground">Verifying session...</p>
            </div>
        );
    }

    const handleLogout = () => {
        clearTokens();
        router.push(CONFIG.ROUTES.LOGIN);
    };

    return (
        <div className="min-h-screen p-8 bg-background">
            <div className="max-w-4xl mx-auto space-y-6">
                <header className="flex justify-between items-center border-b pb-4">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <Button variant="destructive" onClick={handleLogout}>
                        Logout
                    </Button>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle>Welcome back!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            You are authenticated. Your active JWT session is stored in LocalStorage.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
