"use client";

import { Badge } from "@/components/ui/badge";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Bookmark as BookmarkType } from "@/lib/db";
import { useBookmarks } from "@/lib/hooks/use-bookmarks";
import useDebounce from "@/lib/hooks/use-debounce";
import { generateSearchSuggestions } from "@/lib/search-suggestions";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Bookmark, ExternalLink, Globe, Lightbulb, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface OmniSearchProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

// Helper function to build full path for a bookmark
function buildBookmarkPath(bookmark: BookmarkType, allBookmarks: BookmarkType[]): string {
	if (!bookmark.parent_id) {
		return bookmark.title;
	}
	
	const parent = allBookmarks.find(b => b.id === bookmark.parent_id);
	if (!parent) {
		return bookmark.title;
	}
	
	const parentPath = buildBookmarkPath(parent, allBookmarks);
	return `${parentPath}/${bookmark.title}`;
}

// Helper function to flatten bookmark hierarchy for search
function flattenBookmarks(bookmarks: BookmarkType[]): BookmarkType[] {
	const flattened: BookmarkType[] = [];
	
	function flatten(bookmarkList: BookmarkType[]) {
		for (const bookmark of bookmarkList) {
			flattened.push(bookmark);
			if (bookmark.children && bookmark.children.length > 0) {
				flatten(bookmark.children);
			}
		}
	}
	
	flatten(bookmarks);
	return flattened;
}

export function OmniSearch({ open, onOpenChange }: OmniSearchProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const { data: bookmarks = [] } = useBookmarks();

	// Debounce the search query to improve performance
	const debouncedSearchQuery = useDebounce(searchQuery, 100);

	// Flatten bookmarks for easier searching
	const flattenedBookmarks = flattenBookmarks(bookmarks);

	// Filter bookmarks based on debounced search query
	const filteredBookmarks = flattenedBookmarks.filter(
		(bookmark: BookmarkType) =>
			// Only include bookmarks that have a URL (exclude folder-type bookmarks)
			bookmark.url &&
			(bookmark.title
				.toLowerCase()
				.includes(debouncedSearchQuery.toLowerCase()) ||
				(bookmark.description &&
					bookmark.description
						.toLowerCase()
						.includes(debouncedSearchQuery.toLowerCase())) ||
				bookmark.url.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
				// Also search in the full path
				buildBookmarkPath(bookmark, flattenedBookmarks)
					.toLowerCase()
					.includes(debouncedSearchQuery.toLowerCase()))
	);

	// Generate smart suggestions based on debounced query
	const suggestions = generateSearchSuggestions(debouncedSearchQuery);

	// Create search results array
	const searchResults = [
		// AI search option (when user types "ai:")
		...(debouncedSearchQuery.startsWith("ai:") &&
		debouncedSearchQuery.slice(3).trim()
			? [
					{
						id: "ai-search",
						type: "ai" as const,
						title: `Ask Claude AI: "${debouncedSearchQuery.slice(3).trim()}"`,
						url: `https://claude.ai/new?q=${encodeURIComponent(
							debouncedSearchQuery.slice(3).trim()
						)}`,
						icon: Lightbulb,
						description: "Press Enter to open Claude AI",
						emoji: "🤖",
						color: "#10b981",
					},
			  ]
			: []),
		// Google search option (always available when there's a query, except for AI searches)
		...(debouncedSearchQuery.trim() && !debouncedSearchQuery.startsWith("ai:")
			? [
					{
						id: "google-search",
						type: "google" as const,
						title: `Search Google for "${debouncedSearchQuery}"`,
						url: `https://www.google.com/search?q=${encodeURIComponent(
							debouncedSearchQuery
						)}`,
						icon: Globe,
						description: "Search on Google",
						emoji: undefined,
						color: undefined,
					},
			  ]
			: []),
		// Smart suggestions (only when they provide specific value beyond general web search)
		...suggestions
			.filter(suggestion => {
				// Only show suggestions that are more specific than a general web search
				// For example, show "github" suggestion but not generic domain suggestions
				const isSpecificService = suggestion.type === "domain" || 
					suggestion.type === "url" || 
					suggestion.type === "port";
				return isSpecificService;
			})
			.map((suggestion) => ({
				id: suggestion.id,
				type: "suggestion" as const,
				title: suggestion.title,
				url: suggestion.suggested,
				icon: Lightbulb,
				description: suggestion.description,
				emoji: suggestion.icon,
				color: undefined,
			})),
		// Bookmark results
		...filteredBookmarks.slice(0, 6).map((bookmark: BookmarkType) => ({
			id: bookmark.id,
			type: "bookmark" as const,
			title: buildBookmarkPath(bookmark, flattenedBookmarks),
			url: bookmark.url || "#",
			icon: Bookmark,
			description: bookmark.description || bookmark.url || "Bookmark",
			color: bookmark.color,
			emoji: undefined,
		})),
	];

	// Handle result selection
	const handleSelect = useCallback(
		(result: {
			id: string;
			type: string;
			title: string;
			url: string;
			description: string;
			emoji?: string;
			color?: string;
		}) => {
			if (result.url && result.url !== "#") {
				window.open(result.url, "_blank", "noopener,noreferrer");
			}
			onOpenChange(false);
		},
		[onOpenChange]
	);

	// Handle special AI search
	const handleAISearch = useCallback(() => {
		if (debouncedSearchQuery.startsWith("ai:")) {
			const aiQuery = debouncedSearchQuery.slice(3).trim(); // Remove "ai:" prefix
			if (aiQuery) {
				const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(
					aiQuery
				)}`;
				window.open(claudeUrl, "_blank", "noopener,noreferrer");
				onOpenChange(false);
			}
		}
	}, [debouncedSearchQuery, onOpenChange]);

	// Handle keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!open) return;

			switch (e.key) {
				case "ArrowDown":
				case "n":
					if (e.ctrlKey || e.key === "ArrowDown") {
						e.preventDefault();
						setSelectedIndex((prev) =>
							prev < searchResults.length - 1 ? prev + 1 : prev
						);
					}
					break;
				case "ArrowUp":
				case "p":
					if (e.ctrlKey || e.key === "ArrowUp") {
						e.preventDefault();
						setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
					}
					break;
				case "Enter":
					e.preventDefault();
					// Check for AI search first
					if (debouncedSearchQuery.startsWith("ai:")) {
						handleAISearch();
					} else if (searchResults[selectedIndex]) {
						handleSelect(searchResults[selectedIndex]);
					}
					break;
				case "Escape":
					onOpenChange(false);
					break;
				case "c":
					if (e.ctrlKey) {
						e.preventDefault();
						onOpenChange(false);
					}
					break;
			}
		};

		if (open) {
			document.addEventListener("keydown", handleKeyDown);
			return () => document.removeEventListener("keydown", handleKeyDown);
		}
	}, [
		open,
		searchResults,
		selectedIndex,
		onOpenChange,
		handleSelect,
		debouncedSearchQuery,
		handleAISearch,
	]);

	// Reset selection when search changes
	useEffect(() => {
		setSelectedIndex(0);
	}, [debouncedSearchQuery]);

	// Reset search when modal closes
	useEffect(() => {
		if (!open) {
			setSearchQuery("");
			setSelectedIndex(0);
		}
	}, [open]);

	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<VisuallyHidden>
				<DialogTitle>Search</DialogTitle>
			</VisuallyHidden>
			<DialogContent className="p-0 max-w-2xl">
				<Command className="shadow-md border rounded-lg" shouldFilter={false}>
					<div className="flex items-center border-b">
						{/* <Search className="opacity-50 mr-2 w-4 h-4 shrink-0" /> */}
						<CommandInput
							placeholder="Search anything"
							value={searchQuery}
							onValueChange={handleSearchChange}
							className="flex items-center bg-transparent py-3 border-0 outline-none w-full h-11 placeholder:text-muted-foreground text-sm"
						/>
					</div>
					<CommandList className="max-h-96 overflow-y-auto">
						{searchResults.length === 0 && debouncedSearchQuery && (
							<CommandEmpty>No results found.</CommandEmpty>
						)}
						{searchResults.length === 0 && !debouncedSearchQuery && (
							<CommandEmpty>
								<div className="py-6 text-center">
									<Search className="mx-auto mb-2 w-8 h-8 text-muted-foreground" />
									<p className="text-muted-foreground text-sm">
										Type to search bookmarks or the web
									</p>
									<div className="space-y-1 mt-4 text-muted-foreground text-xs">
										<p>
											<kbd className="bg-muted px-1.5 py-0.5 rounded font-semibold text-xs">
												Ctrl+C
											</kbd>{" "}
											to open search
										</p>
										<p>
											<kbd className="bg-muted px-1.5 py-0.5 rounded font-semibold text-xs">
												Ctrl+N
											</kbd>{" "}
											or{" "}
											<kbd className="bg-muted px-1.5 py-0.5 rounded font-semibold text-xs">
												Ctrl+P
											</kbd>{" "}
											to navigate
										</p>
										<p>
											<kbd className="bg-muted px-1.5 py-0.5 rounded font-semibold text-xs">
												Enter
											</kbd>{" "}
											to select
										</p>
										<p>
											<kbd className="bg-muted px-1.5 py-0.5 rounded font-semibold text-xs">
												Esc
											</kbd>{" "}
											or{" "}
											<kbd className="bg-muted px-1.5 py-0.5 rounded font-semibold text-xs">
												Ctrl+C
											</kbd>{" "}
											to close
										</p>
									</div>
								</div>
							</CommandEmpty>
						)}
						{searchResults.length > 0 && (
							<>
								{/* AI Search Group */}
								{debouncedSearchQuery.startsWith("ai:") &&
									debouncedSearchQuery.slice(3).trim() && (
										<CommandGroup heading="AI Assistant">
											{searchResults
												.filter((result) => result.type === "ai")
												.map((result, index) => {
													const Icon = result.icon;
													const isSelected = index === selectedIndex;

													return (
														<CommandItem
															key={result.id}
															onSelect={() => handleSelect(result)}
															className={cn(
																"flex items-center gap-3 p-3 cursor-pointer",
																isSelected && "bg-accent text-accent-foreground"
															)}
														>
															<div
																className="flex justify-center items-center rounded-md w-8 h-8"
																style={{
																	backgroundColor: "#10b981",
																	color: "white",
																}}
															>
																{result.emoji ? (
																	<span className="text-sm">
																		{result.emoji}
																	</span>
																) : (
																	<Icon className="w-4 h-4" />
																)}
															</div>
															<div className="flex-1 min-w-0">
																<div className="font-medium truncate">
																	{result.title}
																</div>
																<div className="text-muted-foreground text-sm truncate">
																	{result.description}
																</div>
															</div>
															<div className="flex items-center gap-2">
																<Badge
																	variant="default"
																	className="bg-emerald-100 border-emerald-200 text-emerald-800 text-xs"
																>
																	AI
																</Badge>
																<ExternalLink className="w-3 h-3 text-muted-foreground" />
															</div>
														</CommandItem>
													);
												})}
										</CommandGroup>
									)}

								{/* Web Search and Bookmarks Group - Now First */}
								{(debouncedSearchQuery.trim() ||
									filteredBookmarks.length > 0) && (
									<CommandGroup
										heading={
											debouncedSearchQuery
												? "Web Search & Bookmarks"
												: "Bookmarks"
										}
									>
										{searchResults
											.filter(
												(result) =>
													result.type !== "suggestion" && result.type !== "ai"
											)
											.map((result, index) => {
												const Icon = result.icon;
												const aiOffset =
													debouncedSearchQuery.startsWith("ai:") &&
													debouncedSearchQuery.slice(3).trim()
														? 1
														: 0;
												const adjustedIndex = aiOffset + index;
												const isSelected = adjustedIndex === selectedIndex;

												return (
													<CommandItem
														key={result.id}
														onSelect={() => handleSelect(result)}
														className={cn(
															"flex items-center gap-3 p-3 cursor-pointer",
															isSelected && "bg-accent text-accent-foreground"
														)}
													>
														<div
															className="flex justify-center items-center rounded-md w-8 h-8"
															style={{
																backgroundColor:
																	result.color ||
																	(result.type === "google"
																		? "#4285f4"
																		: "#6b7280"),
																color: "white",
															}}
														>
															<Icon className="w-4 h-4" />
														</div>
														<div className="flex-1 min-w-0">
															<div className="font-medium truncate">
																{result.title}
															</div>
															<div className="text-muted-foreground text-sm truncate">
																{result.description}
															</div>
														</div>
														<div className="flex items-center gap-2">
															{result.type === "google" && (
																<Badge variant="secondary" className="text-xs">
																	Web Search
																</Badge>
															)}
															{result.type === "bookmark" && (
																<Badge variant="outline" className="text-xs">
																	Bookmark
																</Badge>
															)}
															<ExternalLink className="w-3 h-3 text-muted-foreground" />
														</div>
													</CommandItem>
												);
											})}
									</CommandGroup>
								)}

								{/* Smart Suggestions Group - Now Second */}
								{suggestions.length > 0 && (
									<CommandGroup heading="Smart Suggestions">
										{searchResults
											.filter((result) => result.type === "suggestion")
											.map((result, index) => {
												const Icon = result.icon;
												const aiOffset =
													debouncedSearchQuery.startsWith("ai:") &&
													debouncedSearchQuery.slice(3).trim()
														? 1
														: 0;
												const webSearchOffset = debouncedSearchQuery.trim() && !debouncedSearchQuery.startsWith("ai:") ? 1 : 0;
												const adjustedIndex = aiOffset + webSearchOffset + index;
												const isSelected = adjustedIndex === selectedIndex;

												return (
													<CommandItem
														key={result.id}
														onSelect={() => handleSelect(result)}
														className={cn(
															"flex items-center gap-3 p-3 cursor-pointer",
															isSelected && "bg-accent text-accent-foreground"
														)}
													>
														<div
															className="flex justify-center items-center rounded-md w-8 h-8"
															style={{
																backgroundColor: "#f59e0b",
																color: "white",
															}}
														>
															{result.emoji ? (
																<span className="text-sm">{result.emoji}</span>
															) : (
																<Icon className="w-4 h-4" />
															)}
														</div>
														<div className="flex-1 min-w-0">
															<div className="font-medium truncate">
																{result.title}
															</div>
															<div className="text-muted-foreground text-sm truncate">
																{result.description}
															</div>
														</div>
														<div className="flex items-center gap-2">
															<Badge
																variant="default"
																className="bg-amber-100 border-amber-200 text-amber-800 text-xs"
															>
																Suggestion
															</Badge>
															<ExternalLink className="w-3 h-3 text-muted-foreground" />
														</div>
													</CommandItem>
												);
											})}
									</CommandGroup>
								)}
							</>
						)}
					</CommandList>
				</Command>
			</DialogContent>
		</Dialog>
	);
}
