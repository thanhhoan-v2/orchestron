"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface LoadingContextType {
	isLoading: boolean;
	setIsLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
	const context = useContext(LoadingContext);
	if (context === undefined) {
		throw new Error("useLoading must be used within a LoadingProvider");
	}
	return context;
}

interface LoadingProviderProps {
	children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
	const [isLoading, setIsLoading] = useState(true);

	// Set loading to false after a brief delay to allow components to initialize
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 100);

		return () => clearTimeout(timer);
	}, []);

	return (
		<LoadingContext.Provider value={{ isLoading, setIsLoading }}>
			{children}
		</LoadingContext.Provider>
	);
}
