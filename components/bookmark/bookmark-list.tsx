"use client";

import { TreeDataItem, TreeView } from "@/components/common/tree-view";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Bookmark } from "@/lib/db";
import {
	useBookmarks,
	useCreateBookmark,
	useDeleteBookmark,
	useMoveBookmark,
	useParentOptions,
	useUpdateBookmark,
} from "@/lib/hooks/use-bookmarks";
import {
	Bookmark as BookmarkIcon,
	Folder,
	Link,
	Pen,
	Plus,
	RefreshCw,
	X,
} from "lucide-react";
import { useState } from "react";
import { BookmarkForm } from "./bookmark-form";

export function BookmarkList() {
	const [, setSelectedBookmark] = useState<TreeDataItem | undefined>();
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
	const [deletingBookmark, setDeletingBookmark] = useState<Bookmark | null>(
		null
	);
	const [preSelectedParentId, setPreSelectedParentId] = useState<
		string | undefined
	>();

	// Edit form state
	const [editTitle, setEditTitle] = useState("");
	const [editUrl, setEditUrl] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [editParentId, setEditParentId] = useState<string | undefined>();
	const [editIcon, setEditIcon] = useState("");
	const [editColor, setEditColor] = useState("#3b82f6");

	// React Query hooks
	const { data: bookmarks = [], isLoading } = useBookmarks();
	const { data: parentOptions = [] } = useParentOptions();
	const createBookmarkMutation = useCreateBookmark();
	const updateBookmarkMutation = useUpdateBookmark();
	const deleteBookmarkMutation = useDeleteBookmark();
	const moveBookmarkMutation = useMoveBookmark();

	const handleCreateBookmark = async (bookmarkData: {
		title: string;
		url?: string;
		description?: string;
		parent_id?: string;
		icon?: string;
		color?: string;
	}) => {
		createBookmarkMutation.mutate(bookmarkData);
	};

	const handleCreateDialogClose = () => {
		setCreateDialogOpen(false);
		setPreSelectedParentId(undefined);
	};

	const handleEditBookmark = (bookmark: Bookmark) => {
		setEditingBookmark(bookmark);
		setEditTitle(bookmark.title);
		setEditUrl(bookmark.url || "");
		setEditDescription(bookmark.description || "");
		setEditParentId(bookmark.parent_id);
		setEditIcon(bookmark.icon || "");
		setEditColor(bookmark.color || "#3b82f6");
		setEditDialogOpen(true);
	};

	const handleDeleteBookmark = (bookmark: Bookmark) => {
		setDeletingBookmark(bookmark);
		setDeleteDialogOpen(true);
	};

	const handleCreateInFolder = (folderId: string) => {
		setPreSelectedParentId(folderId);
		setCreateDialogOpen(true);
	};

	const confirmEdit = () => {
		if (!editingBookmark) return;

		updateBookmarkMutation.mutate({
			id: editingBookmark.id,
			title: editTitle.trim(),
			url: editUrl.trim() || undefined,
			description: editDescription.trim() || undefined,
			parent_id: editParentId === "root" ? undefined : editParentId,
			icon: editIcon.trim() || undefined,
			color: editColor || undefined,
		});

		setEditDialogOpen(false);
		setEditingBookmark(null);
	};

	const confirmDelete = () => {
		if (!deletingBookmark) return;

		deleteBookmarkMutation.mutate(deletingBookmark.id);
		setDeleteDialogOpen(false);
		setDeletingBookmark(null);
	};

	const handleReorderBookmarks = (
		sourceItem: TreeDataItem,
		targetItem: TreeDataItem
	) => {
		console.log("Drag and drop:", sourceItem.name, "to", targetItem.name);

		// Prevent dragging item onto itself
		if (sourceItem.id === targetItem.id) {
			return;
		}

		// Helper function to check if target is a descendant of source
		const isDescendant = (
			parentId: string,
			potentialDescendantId: string,
			bookmarkList: Bookmark[]
		): boolean => {
			const findDescendants = (id: string): string[] => {
				const descendants: string[] = [];
				for (const bookmark of bookmarkList) {
					if (bookmark.parent_id === id) {
						descendants.push(bookmark.id);
						descendants.push(...findDescendants(bookmark.id));
					}
				}
				return descendants;
			};
			return findDescendants(parentId).includes(potentialDescendantId);
		};

		// Find the actual bookmark data for source and target
		const findBookmarkById = (
			id: string,
			bookmarkList: Bookmark[]
		): Bookmark | null => {
			for (const bookmark of bookmarkList) {
				if (bookmark.id === id) return bookmark;
				if (bookmark.children) {
					const found = findBookmarkById(id, bookmark.children);
					if (found) return found;
				}
			}
			return null;
		};

		const sourceBookmark = findBookmarkById(sourceItem.id, bookmarks);
		const targetBookmark =
			targetItem.id === "" ? null : findBookmarkById(targetItem.id, bookmarks);

		if (!sourceBookmark) {
			console.error("Source bookmark not found");
			return;
		}

		// Handle drop to root level (empty target)
		if (targetItem.id === "") {
			console.log("Moving to root level");
			moveBookmarkMutation.mutate({
				sourceId: sourceItem.id,
				targetId: "",
				insertIndex: 0,
			});
			return;
		}

		if (!targetBookmark) {
			console.error("Target bookmark not found");
			return;
		}

		// Determine if we're moving to a different parent or reordering within same parent
		const targetParentId = targetBookmark.parent_id;
		const targetIsFolder = !targetBookmark.url;

		if (targetIsFolder) {
			// Check if we're trying to move a folder into itself or its descendant
			if (
				targetItem.id !== "" &&
				isDescendant(sourceItem.id, targetItem.id, bookmarks)
			) {
				console.warn("Cannot move folder into itself or its descendant");
				return;
			}

			// Dropping INTO a folder - move to become child of target
			console.log("Moving into folder:", targetBookmark.title);
			moveBookmarkMutation.mutate({
				sourceId: sourceItem.id,
				targetId: targetItem.id,
				newParentId: targetItem.id,
				insertIndex: 0, // Add at beginning of folder
			});
		} else {
			// Dropping next to a link/bookmark - move to same parent as target
			console.log("Moving next to item:", targetBookmark.title);

			// Find the target's siblings to determine insertion index
			const targetParent = targetParentId
				? findBookmarkById(targetParentId, bookmarks)
				: null;
			const siblings = targetParent
				? targetParent.children || []
				: bookmarks.filter((b) => !b.parent_id);

			const targetIndex = siblings.findIndex(
				(sibling) => sibling.id === targetItem.id
			);
			const insertIndex = targetIndex >= 0 ? targetIndex + 1 : 0;

			moveBookmarkMutation.mutate({
				sourceId: sourceItem.id,
				targetId: targetItem.id,
				newParentId: targetParentId,
				insertIndex,
			});
		}
	};

	// Convert bookmarks to tree data structure
	const convertToTreeData = (bookmarks: Bookmark[]): TreeDataItem[] => {
		return bookmarks.map((bookmark) => {
			// If it's a URL (leaf node), don't give it children even if empty array
			const isUrl = !!bookmark.url;
			const hasChildren = bookmark.children && bookmark.children.length > 0;

			return {
				id: bookmark.id,
				name: bookmark.title,
				icon: isUrl ? Link : Folder,
				// Only set children if it's not a URL AND has actual children
				children:
					!isUrl && hasChildren
						? convertToTreeData(bookmark.children!)
						: undefined,
				draggable: true,
				droppable: !isUrl, // URLs can't be drop targets
				href: bookmark.url, // Use Next.js Link for URLs
				onClick: () => {
					if (bookmark.url) {
						// For URLs with href, this will be a Next.js navigation
						// You can still add custom onClick behavior here if needed
					}
				},
				actions: (
					<div className="flex gap-1">
						{/* Show plus button only for folders (no URL) */}
						{!isUrl && (
							<div
								className="inline-flex justify-center items-center hover:bg-accent p-1 rounded-sm w-6 h-6 transition-colors cursor-pointer"
								role="button"
								tabIndex={0}
								onClick={(e) => {
									e.stopPropagation();
									handleCreateInFolder(bookmark.id);
								}}
								title="Add bookmark to this folder"
							>
								<Plus className="w-3 h-3" />
							</div>
						)}
						<div
							className="inline-flex justify-center items-center hover:bg-accent p-1 rounded-sm w-6 h-6 transition-colors cursor-pointer"
							role="button"
							tabIndex={0}
							onClick={(e) => {
								e.stopPropagation();
								handleEditBookmark(bookmark);
							}}
							title="Edit"
						>
							<Pen className="w-3 h-3" />
						</div>
						<div
							className="inline-flex justify-center items-center hover:bg-destructive p-1 rounded-sm w-6 h-6 hover:text-destructive-foreground transition-colors cursor-pointer"
							role="button"
							tabIndex={0}
							onClick={(e) => {
								e.stopPropagation();
								handleDeleteBookmark(bookmark);
							}}
							title="Delete"
						>
							<X className="w-3 h-3" />
						</div>
					</div>
				),
			};
		});
	};

	const treeData = convertToTreeData(bookmarks);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center p-8 w-full">
				<div className="flex flex-col justify-center items-center gap-3 p-8">
					<RefreshCw className="mr-2 w-6 h-6 animate-spin" />
					<div>Loading bookmarks</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="py-5 h-[50vh] overflow-y-auto">
				<div className="flex justify-between items-end pb-2 border-b-2">
					<h2 className="font-bold text-xl">Bookmarks</h2>
					<Button variant='outline' onClick={() => setCreateDialogOpen(true)}>
						<Plus className="size-4" />
						Add Bookmark
					</Button>
				</div>
				<div>
					{treeData.length === 0 ? (
						<div className="py-8 text-muted-foreground text-center">
							<BookmarkIcon className="opacity-50 mx-auto mb-4 w-12 h-12" />
							<p>No bookmarks yet. Create your first bookmark!</p>
						</div>
					) : (
						<TreeView
							data={treeData}
							onSelectChange={setSelectedBookmark}
							onDocumentDrag={handleReorderBookmarks}
							defaultLeafIcon={Link}
							defaultNodeIcon={Folder}
							className="min-h-[200px]"
						/>
					)}
				</div>
			</div>

			{/* Create Dialog */}
			<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New Bookmark</DialogTitle>
						<DialogDescription>
							Add a new bookmark or folder to your collection.
						</DialogDescription>
					</DialogHeader>
					<BookmarkForm
						onSubmit={handleCreateBookmark}
						loading={createBookmarkMutation.isPending}
						preSelectedParentId={preSelectedParentId}
						isDialogOpen={createDialogOpen}
						onOpenChange={(open) => {
							if (open) {
								setCreateDialogOpen(true);
							} else {
								handleCreateDialogClose();
							}
						}}
					/>
				</DialogContent>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Edit Bookmark</DialogTitle>
						<DialogDescription>
							Make changes to your bookmark here.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label htmlFor="edit-title">Title</Label>
							<Input
								id="edit-title"
								value={editTitle}
								onChange={(e) => setEditTitle(e.target.value)}
								placeholder="Bookmark title..."
							/>
						</div>

						<div>
							<Label htmlFor="edit-url">URL</Label>
							<Input
								id="edit-url"
								type="url"
								value={editUrl}
								onChange={(e) => setEditUrl(e.target.value)}
								placeholder="URL (optional)..."
							/>
						</div>

						<div>
							<Label htmlFor="edit-description">Description</Label>
							<Textarea
								id="edit-description"
								value={editDescription}
								onChange={(e) => setEditDescription(e.target.value)}
								placeholder="Description (optional)..."
								className="min-h-[80px]"
							/>
						</div>

						<div className="gap-4 grid grid-cols-2">
							<div>
								<Label htmlFor="edit-parent">Parent Folder</Label>
								<Select
									value={editParentId || "root"}
									onValueChange={(value) =>
										setEditParentId(value === "root" ? undefined : value)
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select parent (optional)" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="root">No parent (root level)</SelectItem>
										{parentOptions.map((option) => (
											<SelectItem key={option.id} value={option.id}>
												{Array(option.level).fill("  ").join("")}
												{option.title}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label htmlFor="edit-color">Color</Label>
								<div className="flex items-center gap-2">
									<input
										id="edit-color"
										type="color"
										value={editColor}
										onChange={(e) => setEditColor(e.target.value)}
										className="border rounded w-10 h-10 cursor-pointer"
									/>
									<Input
										placeholder="Icon (optional)"
										value={editIcon}
										onChange={(e) => setEditIcon(e.target.value)}
										className="flex-1"
									/>
								</div>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							onClick={confirmEdit}
							disabled={!editTitle.trim() || updateBookmarkMutation.isPending}
						>
							{updateBookmarkMutation.isPending ? "Updating..." : "Update"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Delete Bookmark</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete &quot;{deletingBookmark?.title}
							&quot;?
							{deletingBookmark?.children &&
								deletingBookmark.children.length > 0 && (
									<span className="block mt-2 text-destructive">
										This will also delete all its children.
									</span>
								)}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDeleteDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={confirmDelete}
							disabled={deleteBookmarkMutation.isPending}
						>
							{deleteBookmarkMutation.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
