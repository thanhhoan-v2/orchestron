"use client";

import { useEffect, useState } from "react";

export function Clock() {
	const [currentTime, setCurrentTime] = useState<Date | null>(null);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		setCurrentTime(new Date());
		
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	const formatTime = (date: Date) => {
		const day = date.getDate().toString().padStart(2, "0");
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const hours = date.getHours().toString().padStart(2, "0");
		const minutes = date.getMinutes().toString().padStart(2, "0");
		const seconds = date.getSeconds().toString().padStart(2, "0");

		// Vietnamese day names
		const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
		const dayName = dayNames[date.getDay()];

		return `[${dayName}-${day}-${month}]-[${hours}:${minutes}:${seconds}]`;
	};

	// Don't render anything until mounted to prevent hydration mismatch
	if (!mounted || !currentTime) {
		return (
			<div className="right-4 bottom-4 z-50 fixed">
				<div className="bg-background/80 shadow-lg backdrop-blur-sm px-3 py-2 border rounded-lg">
					<span className="font-mono text-foreground text-sm">
						[--]--[--:--:--]
					</span>
				</div>
			</div>
		);
	}

	return (
		<div className="right-4 bottom-4 z-50 fixed">
			<div className="bg-background/80 shadow-lg backdrop-blur-sm px-3 py-2 border rounded-lg">
				<span className="font-mono text-foreground text-sm">
					{formatTime(currentTime)}
				</span>
			</div>
		</div>
	);
}
