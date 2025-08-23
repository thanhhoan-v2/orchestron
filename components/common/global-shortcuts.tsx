"use client";

import { useLoading } from "@/components/providers/loading-provider";
import { useState } from "react";
import { KeyboardHandler } from "./keyboard-handler";
import { OmniSearch } from "./omni-search";
import { QuickCreateModals } from "./quick-create-modals";

export function GlobalShortcuts() {
	const { isLoading } = useLoading();
	const [searchOpen, setSearchOpen] = useState(false);
	const [bookmarkOpen, setBookmarkOpen] = useState(false);
	const [reminderOpen, setReminderOpen] = useState(false);

	const handleSearchOpen = () => {
		if (!isLoading) {
			setSearchOpen(true);
		}
	};

	const handleDailyDev = () => {
		window.open("https://app.daily.dev", "_blank", "noopener,noreferrer");
	};

	const handleNewBookmark = () => {
		if (!isLoading) {
			setBookmarkOpen(true);
		}
	};

	const handleNewReminder = () => {
		if (!isLoading) {
			setReminderOpen(true);
		}
	};

	return (
		<>
			<KeyboardHandler
				onSearchOpen={handleSearchOpen}
				onDailyDev={handleDailyDev}
				onNewBookmark={handleNewBookmark}
				onNewReminder={handleNewReminder}
			/>

			{!isLoading && (
				<OmniSearch open={searchOpen} onOpenChange={setSearchOpen} />
			)}

			{!isLoading && (
				<QuickCreateModals
					bookmarkOpen={bookmarkOpen}
					reminderOpen={reminderOpen}
					onBookmarkOpenChange={setBookmarkOpen}
					onReminderOpenChange={setReminderOpen}
				/>
			)}
		</>
	);
}
