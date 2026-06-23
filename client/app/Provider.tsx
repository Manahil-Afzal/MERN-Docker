"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./utils/theme-provider";
import { Toaster } from "react-hot-toast";

interface ProviderProps {
    children: ReactNode;
}

export function Providers({ children }: ProviderProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    return (
        <Provider store={store}>
            <SessionProvider>
                <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
                    {children}
                    {mounted ? (
                        <Toaster
                            position="bottom-right"
                            reverseOrder={false}
                            gutter={10}
                            toastOptions={{
                                duration: 4000,
                                className: "site-toast",
                                success: {
                                    className: "site-toast site-toast-success",
                                    iconTheme: {
                                        primary: "#7542ed",
                                        secondary: "#ffffff",
                                    },
                                },
                                error: {
                                    className: "site-toast site-toast-error",
                                    iconTheme: {
                                        primary: "#ef4444",
                                        secondary: "#ffffff",
                                    },
                                },
                            }}
                        />
                    ) : null}
                </ThemeProvider>
            </SessionProvider>
        </Provider>
    );
}