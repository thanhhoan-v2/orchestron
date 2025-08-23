"use client";

import { useState } from "react";
import { KeyboardHandler } from "./keyboard-handler";
import { OmniSearch } from "./omni-search";
import { QuickCreateModals } from "./quick-create-modals";

export function GlobalShortcuts() {
	const [searchOpen, setSearchOpen] = useState(true);
	const [bookmarkOpen, setBookmarkOpen] = useState(false);
	const [reminderOpen, setReminderOpen] = useState(false);

	const handleSearchOpen = () => {
		setSearchOpen(true);
	};

	const handleDailyDev = () => {
		window.open("https://app.daily.dev", "_blank", "noopener,noreferrer");
	};

	const handleNewBookmark = () => {
		setBookmarkOpen(true);
	};

	const handleNewReminder = () => {
		setReminderOpen(true);
	};

	return (
		<>
			<KeyboardHandler
				onSearchOpen={handleSearchOpen}
				onDailyDev={handleDailyDev}
				onNewBookmark={handleNewBookmark}
				onNewReminder={handleNewReminder}
			/>

			<OmniSearch open={searchOpen} onOpenChange={setSearchOpen} />

			<QuickCreateModals
				bookmarkOpen={bookmarkOpen}
				reminderOpen={reminderOpen}
				onBookmarkOpenChange={setBookmarkOpen}
				onReminderOpenChange={setReminderOpen}
			/>
		</>
	);
}
