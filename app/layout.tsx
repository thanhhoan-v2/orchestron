import { Clock } from "@/components/common/clock";
import { GlobalShortcuts } from "@/components/common/global-shortcuts";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "口は災いの元",
	description:
		"Orchestron is a platform for managing your tasks and bookmarks.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<QueryProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<LoadingProvider>
							<GlobalShortcuts />
							<main>{children}</main>
							<Clock />
						</LoadingProvider>
					</ThemeProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
