"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useParentOptions } from "@/lib/hooks/use-bookmarks";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface BookmarkFormProps {
	onSubmit: (bookmark: {
		title: string;
		url?: string;
		description?: string;
		parent_id?: string;
		icon?: string;
		color?: string;
	}) => void;
	loading?: boolean;
	preSelectedParentId?: string;
	isDialogOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function BookmarkForm({
	onSubmit,
	loading,
	preSelectedParentId,
	isDialogOpen,
	onOpenChange,
}: BookmarkFormProps) {
	const [title, setTitle] = useState("");
	const [url, setUrl] = useState("");
	const [description, setDescription] = useState("");
	const [parentId, setParentId] = useState<string | undefined>();
	const [icon, setIcon] = useState("");
	const [color, setColor] = useState("#3b82f6");
	const [isOpen, setIsOpen] = useState(false);

	const { data: parentOptions = [], isLoading: parentOptionsLoading } =
		useParentOptions();

	// Handle external dialog control and pre-selected parent
	useEffect(() => {
		if (isDialogOpen !== undefined) {
			setIsOpen(isDialogOpen);
		}
	}, [isDialogOpen]);

	useEffect(() => {
		if (preSelectedParentId !== undefined) {
			setParentId(preSelectedParentId);
		}
	}, [preSelectedParentId]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;

		onSubmit({
			title: title.trim(),
			url: url.trim() || undefined,
			description: description.trim() || undefined,
			parent_id: parentId,
			icon: icon.trim() || undefined,
			color: color || undefined,
		});

		// Reset form
		setTitle("");
		setUrl("");
		setDescription("");
		setParentId(preSelectedParentId);
		setIcon("");
		setColor("#3b82f6");

		// Close dialog
		if (onOpenChange) {
			onOpenChange(false);
		} else {
			setIsOpen(false);
		}
	};

	if (!isOpen) {
		return (
			<Button
				onClick={() => {
					if (onOpenChange) {
						onOpenChange(true);
					} else {
						setIsOpen(true);
					}
				}}
				className="justify-center gap-2 border-b-2 w-full"
				size="lg"
				variant="ghost"
			>
				<Plus className="w-4 h-4" />
			</Button>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<Input
					placeholder="Bookmark title..."
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					className="text-lg"
					required
				/>
			</div>

			<div>
				<Input
					placeholder="URL (optional)..."
					type="url"
					value={url}
					onChange={(e) => setUrl(e.target.value)}
				/>
			</div>

			<div>
				<Textarea
					placeholder="Description (optional)..."
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					className="min-h-[80px]"
				/>
			</div>

			<div className="gap-4 grid grid-cols-2">
				<div>
					<label className="block mb-2 font-medium text-sm">
						Parent Folder
					</label>
					<Select
						value={parentId || "root"}
						onValueChange={(value) =>
							setParentId(value === "root" ? undefined : value)
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
					<label className="block mb-2 font-medium text-sm">Color</label>
					<div className="flex items-center gap-2">
						<input
							type="color"
							value={color}
							onChange={(e) => setColor(e.target.value)}
							className="border rounded w-10 h-10 cursor-pointer"
						/>
						<Input
							placeholder="Icon (optional)"
							value={icon}
							onChange={(e) => setIcon(e.target.value)}
							className="flex-1"
						/>
					</div>
				</div>
			</div>

			<div className="flex gap-2">
				<Button
					type="submit"
					disabled={!title.trim() || loading || parentOptionsLoading}
					className="flex-1"
				>
					{loading ? "Creating..." : "Create Bookmark"}
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={() => {
						if (onOpenChange) {
							onOpenChange(false);
						} else {
							setIsOpen(false);
						}
					}}
				>
					Cancel
				</Button>
			</div>
		</form>
	);
}
