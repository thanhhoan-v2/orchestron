"use client";

import { cn } from "@/lib/utils";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cva } from "class-variance-authority";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuTrigger,
} from "../ui/context-menu";

const treeVariants = cva(
	"group before:left-0 before:-z-10 before:absolute before:bg-accent/70 before:opacity-0 hover:before:opacity-100 px-2 before:rounded-lg before:w-full before:h-[2rem]"
);

const selectedTreeVariants = cva(
	"before:bg-accent/70 before:opacity-100 text-accent-foreground"
);

const dragOverVariants = cva(
	"before:bg-primary/20 before:opacity-100 text-primary-foreground"
);

interface TreeDataItem {
	id: string;
	name: string;
	icon?: React.ComponentType<{ className?: string }>;
	selectedIcon?: React.ComponentType<{ className?: string }>;
	openIcon?: React.ComponentType<{ className?: string }>;
	children?: TreeDataItem[];
	actions?: React.ReactNode;
	onClick?: () => void;
	draggable?: boolean;
	droppable?: boolean;
	disabled?: boolean;
	href?: string;
}

type TreeProps = React.HTMLAttributes<HTMLDivElement> & {
	data: TreeDataItem[] | TreeDataItem;
	initialSelectedItemId?: string;
	selectedItemId?: string;
	onSelectChange?: (item: TreeDataItem | undefined) => void;
	expandAll?: boolean;
	defaultNodeIcon?: React.ComponentType<{ className?: string }>;
	defaultLeafIcon?: React.ComponentType<{ className?: string }>;
	onDocumentDrag?: (sourceItem: TreeDataItem, targetItem: TreeDataItem) => void;
};

const TreeView = React.forwardRef<HTMLDivElement, TreeProps>(
	(
		{
			data,
			initialSelectedItemId,
			selectedItemId: externalSelectedItemId,
			onSelectChange,
			expandAll,
			defaultLeafIcon,
			defaultNodeIcon,
			className,
			onDocumentDrag,
			...props
		},
		ref
	) => {
		const [internalSelectedItemId, setInternalSelectedItemId] = React.useState<
			string | undefined
		>(initialSelectedItemId);

		// Use external selectedItemId if provided, otherwise use internal state
		const selectedItemId =
			externalSelectedItemId !== undefined
				? externalSelectedItemId
				: internalSelectedItemId;

		const [draggedItem, setDraggedItem] = React.useState<TreeDataItem | null>(
			null
		);

		const handleSelectChange = React.useCallback(
			(item: TreeDataItem | undefined) => {
				setInternalSelectedItemId(item?.id);
				if (onSelectChange) {
					onSelectChange(item);
				}
			},
			[onSelectChange]
		);

		const handleDragStart = React.useCallback((item: TreeDataItem) => {
			setDraggedItem(item);
		}, []);

		const handleDrop = React.useCallback(
			(targetItem: TreeDataItem) => {
				if (draggedItem && onDocumentDrag && draggedItem.id !== targetItem.id) {
					onDocumentDrag(draggedItem, targetItem);
				}
				setDraggedItem(null);
			},
			[draggedItem, onDocumentDrag]
		);

		const expandedItemIds = React.useMemo(() => {
			if (!initialSelectedItemId) {
				return [] as string[];
			}

			const ids: string[] = [];

			function walkTreeItems(
				items: TreeDataItem[] | TreeDataItem,
				targetId: string
			) {
				if (items instanceof Array) {
					for (let i = 0; i < items.length; i++) {
						ids.push(items[i]!.id);
						if (walkTreeItems(items[i]!, targetId) && !expandAll) {
							return true;
						}
						if (!expandAll) ids.pop();
					}
				} else if (!expandAll && items.id === targetId) {
					return true;
				} else if (items.children) {
					return walkTreeItems(items.children, targetId);
				}
			}

			walkTreeItems(data, initialSelectedItemId);
			return ids;
		}, [data, expandAll, initialSelectedItemId]);

		return (
			<div className={cn("overflow-hidden relative p-2", className)}>
				<TreeItem
					data={data}
					ref={ref}
					selectedItemId={selectedItemId}
					handleSelectChange={handleSelectChange}
					expandedItemIds={expandedItemIds}
					defaultLeafIcon={defaultLeafIcon}
					defaultNodeIcon={defaultNodeIcon}
					handleDragStart={handleDragStart}
					handleDrop={handleDrop}
					draggedItem={draggedItem}
					{...props}
				/>
				<div
					className="w-full h-[48px]"
					onDrop={() => {
						handleDrop({ id: "", name: "parent_div" });
					}}
				></div>
			</div>
		);
	}
);
TreeView.displayName = "TreeView";

type TreeItemProps = TreeProps & {
	selectedItemId?: string;
	handleSelectChange: (item: TreeDataItem | undefined) => void;
	expandedItemIds: string[];
	defaultNodeIcon?: React.ComponentType<{ className?: string }>;
	defaultLeafIcon?: React.ComponentType<{ className?: string }>;
	handleDragStart?: (item: TreeDataItem) => void;
	handleDrop?: (item: TreeDataItem) => void;
	draggedItem: TreeDataItem | null;
};

const TreeItem = React.forwardRef<HTMLDivElement, TreeItemProps>(
	(
		{
			className,
			data,
			selectedItemId,
			handleSelectChange,
			expandedItemIds,
			defaultNodeIcon,
			defaultLeafIcon,
			handleDragStart,
			handleDrop,
			draggedItem,
			...props
		},
		ref
	) => {
		if (!(data instanceof Array)) {
			data = [data];
		}
		return (
			<div ref={ref} role="tree" className={className} {...props}>
				<ul>
					{data.map((item) => (
						<li key={item.id}>
							{item.children ? (
								<TreeNode
									item={item}
									selectedItemId={selectedItemId}
									expandedItemIds={expandedItemIds}
									handleSelectChange={handleSelectChange}
									defaultNodeIcon={defaultNodeIcon}
									defaultLeafIcon={defaultLeafIcon}
									handleDragStart={handleDragStart}
									handleDrop={handleDrop}
									draggedItem={draggedItem}
								/>
							) : (
								<TreeLeaf
									item={item}
									selectedItemId={selectedItemId}
									handleSelectChange={handleSelectChange}
									defaultLeafIcon={defaultLeafIcon}
									handleDragStart={handleDragStart}
									handleDrop={handleDrop}
									draggedItem={draggedItem}
								/>
							)}
						</li>
					))}
				</ul>
			</div>
		);
	}
);
TreeItem.displayName = "TreeItem";

const TreeNode = ({
	item,
	handleSelectChange,
	expandedItemIds,
	selectedItemId,
	defaultNodeIcon,
	defaultLeafIcon,
	handleDragStart,
	handleDrop,
	draggedItem,
}: {
	item: TreeDataItem;
	handleSelectChange: (item: TreeDataItem | undefined) => void;
	expandedItemIds: string[];
	selectedItemId?: string;
	defaultNodeIcon?: React.ComponentType<{ className?: string }>;
	defaultLeafIcon?: React.ComponentType<{ className?: string }>;
	handleDragStart?: (item: TreeDataItem) => void;
	handleDrop?: (item: TreeDataItem) => void;
	draggedItem: TreeDataItem | null;
}) => {
	const [value, setValue] = React.useState(
		expandedItemIds.includes(item.id) ? [item.id] : []
	);
	const [isDragOver, setIsDragOver] = React.useState(false);

	const onDragStart = (e: React.DragEvent) => {
		if (!item.draggable) {
			e.preventDefault();
			return;
		}
		e.dataTransfer.setData("text/plain", item.id);
		handleDragStart?.(item);
	};

	const onDragOver = (e: React.DragEvent) => {
		if (item.droppable !== false && draggedItem && draggedItem.id !== item.id) {
			e.preventDefault();
			setIsDragOver(true);
		}
	};

	const onDragLeave = () => {
		setIsDragOver(false);
	};

	const onDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
		handleDrop?.(item);
	};

	return (
		<AccordionPrimitive.Root
			type="multiple"
			value={value}
			onValueChange={(s) => setValue(s)}
		>
			<AccordionPrimitive.Item value={item.id}>
				<AccordionTrigger
					className={cn(
						treeVariants(),
						selectedItemId === item.id && selectedTreeVariants(),
						isDragOver && dragOverVariants()
					)}
					onClick={() => {
						handleSelectChange(item);
						item.onClick?.();
					}}
					draggable={!!item.draggable}
					onDragStart={onDragStart}
					onDragOver={onDragOver}
					onDragLeave={onDragLeave}
					onDrop={onDrop}
				>
					<TreeIcon
						item={item}
						isSelected={selectedItemId === item.id}
						isOpen={value.includes(item.id)}
						default={defaultNodeIcon}
					/>
					<span className="text-sm truncate">{item.name}</span>
					<TreeActions isSelected={selectedItemId === item.id}>
						{item.actions}
					</TreeActions>
				</AccordionTrigger>
				<AccordionContent className="ml-4 pl-1 border-l">
					<TreeItem
						data={item.children ? item.children : item}
						selectedItemId={selectedItemId}
						handleSelectChange={handleSelectChange}
						expandedItemIds={expandedItemIds}
						defaultLeafIcon={defaultLeafIcon}
						defaultNodeIcon={defaultNodeIcon}
						handleDragStart={handleDragStart}
						handleDrop={handleDrop}
						draggedItem={draggedItem}
					/>
				</AccordionContent>
			</AccordionPrimitive.Item>
		</AccordionPrimitive.Root>
	);
};

const TreeLeaf = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & {
		item: TreeDataItem;
		selectedItemId?: string;
		handleSelectChange: (item: TreeDataItem | undefined) => void;
		defaultLeafIcon?: React.ComponentType<{ className?: string }>;
		handleDragStart?: (item: TreeDataItem) => void;
		handleDrop?: (item: TreeDataItem) => void;
		draggedItem: TreeDataItem | null;
	}
>(
	(
		{
			className,
			item,
			selectedItemId,
			handleSelectChange,
			defaultLeafIcon,
			handleDragStart,
			handleDrop,
			draggedItem,
			...props
		},
		ref
	) => {
		const [isDragOver, setIsDragOver] = React.useState(false);

		const onDragStart = (e: React.DragEvent<HTMLElement>) => {
			if (!item.draggable || item.disabled) {
				e.preventDefault();
				return;
			}
			e.dataTransfer.setData("text/plain", item.id);
			handleDragStart?.(item);
		};

		const onDragOver = (e: React.DragEvent<HTMLElement>) => {
			if (
				item.droppable !== false &&
				!item.disabled &&
				draggedItem &&
				draggedItem.id !== item.id
			) {
				e.preventDefault();
				setIsDragOver(true);
			}
		};

		const onDragLeave = () => {
			setIsDragOver(false);
		};

		const onDrop = (e: React.DragEvent<HTMLElement>) => {
			if (item.disabled) return;
			e.preventDefault();
			setIsDragOver(false);
			handleDrop?.(item);
		};

		const leafContent = (
			<>
				<TreeIcon
					item={item}
					isSelected={selectedItemId === item.id}
					default={defaultLeafIcon}
				/>
				<span className="flex-grow text-sm truncate">{item.name}</span>
				<TreeActions isSelected={selectedItemId === item.id && !item.disabled}>
					{item.actions}
				</TreeActions>
			</>
		);

		const commonClassName = cn(
			"ml-5 flex text-left items-center py-2 cursor-pointer before:right-1 underline underline-offset-4",
			treeVariants(),
			className,
			selectedItemId === item.id && selectedTreeVariants(),
			isDragOver && dragOverVariants(),
			item.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
		);

		const handleClick = () => {
			if (item.disabled) return;
			handleSelectChange(item);
			item.onClick?.();
		};

		if (item.href && !item.disabled) {
			const linkHandlers = {
				onDragStart: (e: React.DragEvent<HTMLAnchorElement>) => {
					onDragStart(e);
				},
				onDragOver: (e: React.DragEvent<HTMLAnchorElement>) => onDragOver(e),
				onDragLeave: () => onDragLeave(),
				onDrop: (e: React.DragEvent<HTMLAnchorElement>) => onDrop(e),
				onClick: () => {
					handleClick();
				},
			};

			return (
				<ContextMenu>
					<ContextMenuTrigger asChild>
						<Link
							href={item.href}
							className={commonClassName}
							draggable={!!item.draggable}
							target="_blank"
							{...linkHandlers}
						>
							{leafContent}
						</Link>
					</ContextMenuTrigger>
					<ContextMenuContent>{item.actions}</ContextMenuContent>
				</ContextMenu>
			);
		}

		return (
			<div
				ref={ref}
				className={commonClassName}
				onClick={handleClick}
				draggable={!!item.draggable && !item.disabled}
				onDragStart={onDragStart}
				onDragOver={onDragOver}
				onDragLeave={onDragLeave}
				onDrop={onDrop}
				{...props}
			>
				{leafContent}
			</div>
		);
	}
);
TreeLeaf.displayName = "TreeLeaf";

const AccordionTrigger = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
	<AccordionPrimitive.Header>
		<AccordionPrimitive.Trigger
			ref={ref}
			className={cn(
				"flex flex-1 w-full items-center py-2 transition-all first:[&[data-state=open]>svg]:rotate-90",
				className
			)}
			{...props}
		>
			<ChevronRight className="mr-1 w-4 h-4 transition-transform duration-200 text-accent-foreground/50 shrink-0" />
			{children}
		</AccordionPrimitive.Trigger>
	</AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
	<AccordionPrimitive.Content
		ref={ref}
		className={cn(
			"overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
			className
		)}
		{...props}
	>
		<div className="pt-0 pb-1">{children}</div>
	</AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

const TreeIcon = ({
	item,
	isOpen,
	isSelected,
	default: defaultIcon,
}: {
	item: TreeDataItem;
	isOpen?: boolean;
	isSelected?: boolean;
	default?: React.ComponentType<{ className?: string }>;
}) => {
	let Icon = defaultIcon;
	if (isSelected && item.selectedIcon) {
		Icon = item.selectedIcon;
	} else if (isOpen && item.openIcon) {
		Icon = item.openIcon;
	} else if (item.icon) {
		Icon = item.icon;
	}
	return Icon ? <Icon className="mr-2 w-4 h-4 shrink-0" /> : <></>;
};

const TreeActions = ({
	children,
	isSelected,
}: {
	children: React.ReactNode;
	isSelected: boolean;
}) => {
	return (
		<div
			className={cn(
				isSelected ? "block" : "hidden",
				"absolute right-3 group-hover:block"
			)}
		>
			{children}
		</div>
	);
};

export { TreeView, type TreeDataItem };
