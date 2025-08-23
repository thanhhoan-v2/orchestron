"use client";

import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import useDebounce from "@/lib/hooks/use-debounce";
import {
	Bookmark,
	Calendar,
	Globe,
	Plus,
	Search,
	Send,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface Action {
	id: string;
	label: string;
	icon: React.ReactNode;
	description?: string;
	short?: string;
	end?: string;
}

interface SearchResult {
	actions: Action[];
}

const ANIMATION_VARIANTS = {
	container: {
		hidden: { opacity: 0, height: 0 },
		show: {
			opacity: 1,
			height: "auto",
			transition: {
				height: { duration: 0.4 },
				staggerChildren: 0.1,
			},
		},
		exit: {
			opacity: 0,
			height: 0,
			transition: {
				height: { duration: 0.3 },
				opacity: { duration: 0.2 },
			},
		},
	},
	item: {
		hidden: { opacity: 0, y: 20 },
		show: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.3 },
		},
		exit: {
			opacity: 0,
			y: -10,
			transition: { duration: 0.2 },
		},
	},
} as const;



interface ActionSearchBarProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onNewTodo: () => void;
	onNewBookmark: () => void;
	onNewReminder: () => void;
	onDailyDev: () => void;
}

export function ActionSearchBar({
	open,
	onOpenChange,
	onNewTodo,
	onNewBookmark,
	onNewReminder,
	onDailyDev,
}: ActionSearchBarProps) {
	// Create actions based on app functionality
	const appActions: Action[] = useMemo(() => [
		{
			id: "new-todo",
			label: "New Todo",
			icon: <Plus className="w-4 h-4 text-blue-500" />,
			description: "Create a new todo item",
			short: "1",
			end: "Create",
		},
		{
			id: "new-bookmark",
			label: "New Bookmark",
			icon: <Bookmark className="w-4 h-4 text-green-500" />,
			description: "Create a new bookmark",
			short: "2",
			end: "Create",
		},
		{
			id: "new-reminder",
			label: "New Reminder",
			icon: <Calendar className="w-4 h-4 text-purple-500" />,
			description: "Create a new reminder",
			short: "3",
			end: "Create",
		},
		{
			id: "daily-dev",
			label: "Open Daily.dev",
			icon: <Globe className="w-4 h-4 text-orange-500" />,
			description: "Open Daily.dev in new tab",
			short: "D",
			end: "Navigate",
		},
	], []);

	const actions = appActions;
	const [query, setQuery] = useState("");
	const [result, setResult] = useState<SearchResult | null>(null);
	const [selectedAction, setSelectedAction] = useState<Action | null>(null);
	const [activeIndex, setActiveIndex] = useState(-1);
	const debouncedQuery = useDebounce(query, 200);

	const filteredActions = useMemo(() => {
		if (!debouncedQuery) return actions;

		const normalizedQuery = debouncedQuery.toLowerCase().trim();
		return actions.filter((action) => {
			const searchableText = `${action.label} ${
				action.description || ""
			}`.toLowerCase();
			return searchableText.includes(normalizedQuery);
		});
	}, [debouncedQuery, actions]);

	useEffect(() => {
		if (!open) {
			setResult(null);
			setActiveIndex(-1);
			return;
		}

		setResult({ actions: filteredActions });
		setActiveIndex(-1);
	}, [filteredActions, open]);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setQuery(e.target.value);
			setActiveIndex(-1);
		},
		[]
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (!result?.actions.length) return;

			switch (e.key) {
				case "ArrowDown":
					e.preventDefault();
					setActiveIndex((prev) =>
						prev < result.actions.length - 1 ? prev + 1 : 0
					);
					break;
				case "ArrowUp":
					e.preventDefault();
					setActiveIndex((prev) =>
						prev > 0 ? prev - 1 : result.actions.length - 1
					);
					break;
				case "Enter":
					e.preventDefault();
					if (activeIndex >= 0 && result.actions[activeIndex]) {
						setSelectedAction(result.actions[activeIndex]);
					}
					break;
				case "Escape":
					onOpenChange(false);
					setActiveIndex(-1);
					break;
			}
		},
		[result?.actions, activeIndex, onOpenChange]
	);

	const handleActionClick = useCallback((action: Action) => {
		// Execute the appropriate action
		switch (action.id) {
			case "new-todo":
				onNewTodo();
				break;
			case "new-bookmark":
				onNewBookmark();
				break;
			case "new-reminder":
				onNewReminder();
				break;
			case "daily-dev":
				onDailyDev();
				break;
		}
		onOpenChange(false);
	}, [onNewTodo, onNewBookmark, onNewReminder, onDailyDev, onOpenChange]);

	// Handle Enter key on selected action
	useEffect(() => {
		if (selectedAction) {
			handleActionClick(selectedAction);
		}
	}, [selectedAction, handleActionClick]);

	// Reset when modal closes
	useEffect(() => {
		if (!open) {
			setQuery("");
			setActiveIndex(-1);
			setSelectedAction(null);
		}
	}, [open]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<VisuallyHidden>
				<DialogTitle>Action Search</DialogTitle>
			</VisuallyHidden>
			<DialogContent className="p-0 max-w-2xl">
				<div className="mx-auto w-full max-w-xl">
					<div className="relative flex flex-col justify-start items-center min-h-[300px]">
						<div className="top-0 z-10 sticky bg-background pt-4 pb-1 w-full max-w-sm">
							<label
								className="block mb-1 font-medium text-gray-500 dark:text-gray-400 text-xs"
								htmlFor="search"
							>
								Search Commands
							</label>
							<div className="relative">
								<Input
									type="text"
									placeholder="Type a command..."
									value={query}
									onChange={handleInputChange}
									onKeyDown={handleKeyDown}
									role="combobox"
									aria-expanded={open && !!result}
									aria-autocomplete="list"
									aria-activedescendant={
										activeIndex >= 0
											? `action-${result?.actions[activeIndex]?.id}`
											: undefined
									}
									id="search"
									autoComplete="off"
									autoFocus
									className="py-1.5 pr-9 pl-3 rounded-lg focus-visible:ring-offset-0 h-9 text-sm"
								/>
								<div className="top-1/2 right-3 absolute w-4 h-4 -translate-y-1/2">
									<AnimatePresence mode="popLayout">
										{query.length > 0 ? (
											<motion.div
												key="send"
												initial={{ y: -20, opacity: 0 }}
												animate={{ y: 0, opacity: 1 }}
												exit={{ y: 20, opacity: 0 }}
												transition={{ duration: 0.2 }}
											>
												<Send className="w-4 h-4 text-gray-400 dark:text-gray-500" />
											</motion.div>
										) : (
											<motion.div
												key="search"
												initial={{ y: -20, opacity: 0 }}
												animate={{ y: 0, opacity: 1 }}
												exit={{ y: 20, opacity: 0 }}
												transition={{ duration: 0.2 }}
											>
												<Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							</div>
						</div>

						<div className="w-full max-w-sm">
							<AnimatePresence>
								{open && result && (
									<motion.div
										className="bg-white dark:bg-black shadow-xs mt-1 border dark:border-gray-800 rounded-md w-full overflow-hidden"
										variants={ANIMATION_VARIANTS.container}
										role="listbox"
										aria-label="Search results"
										initial="hidden"
										animate="show"
										exit="exit"
									>
										{result.actions.length === 0 ? (
											<div className="px-3 py-4 text-center text-gray-500 text-sm">
												No commands found
											</div>
										) : (
											<>
												<motion.ul role="none">
													{result.actions.map((action) => (
														<motion.li
															key={action.id}
															id={`action-${action.id}`}
															className={`px-3 py-2 flex items-center justify-between hover:bg-gray-200 dark:hover:bg-zinc-900 cursor-pointer rounded-md ${
																activeIndex === result.actions.indexOf(action)
																	? "bg-gray-100 dark:bg-zinc-800"
																	: ""
															}`}
															variants={ANIMATION_VARIANTS.item}
															layout
															onClick={() => handleActionClick(action)}
															role="option"
															aria-selected={
																activeIndex === result.actions.indexOf(action)
															}
														>
															<div className="flex justify-between items-center gap-2">
																<div className="flex items-center gap-2">
																	<span className="text-gray-500" aria-hidden="true">
																		{action.icon}
																	</span>
																	<span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
																		{action.label}
																	</span>
																	{action.description && (
																		<span className="text-gray-400 text-xs">
																			{action.description}
																		</span>
																	)}
																</div>
															</div>
															<div className="flex items-center gap-2">
																{action.short && (
																	<span
																		className="text-gray-400 text-xs"
																		aria-label={`Keyboard shortcut: ${action.short}`}
																	>
																		{action.short}
																	</span>
																)}
																{action.end && (
																	<span className="text-gray-400 text-xs text-right">
																		{action.end}
																	</span>
																)}
															</div>
														</motion.li>
													))}
												</motion.ul>
												<div className="mt-2 px-3 py-2 border-gray-100 dark:border-gray-800 border-t">
													<div className="flex justify-between items-center text-gray-500 text-xs">
														<span>Use arrow keys to navigate</span>
														<span>ESC to cancel</span>
													</div>
												</div>
											</>
										)}
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}


