"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Fund } from "@/lib/db";
import { useSavedMoney } from "@/lib/hooks/use-funds";
import { Check, DollarSign, PenIcon, X, XIcon } from "lucide-react";
import { useState } from "react";

interface FundItemProps {
	fund: Fund;
	onUpdate: (id: string, updates: Partial<Fund>) => void;
	onDelete: (id: string) => void;
	onMoveUp: (id: string) => void;
	onMoveDown: (id: string) => void;
	loading?: boolean;
	deleting?: boolean;
	canMoveUp: boolean;
	canMoveDown: boolean;
}

export function FundItem({
	fund,
	onUpdate,
	onDelete,
	onMoveUp,
	onMoveDown,
	loading = false,
	deleting = false,
	canMoveUp,
	canMoveDown,
}: FundItemProps) {
	const [isHovered, setIsHovered] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editTitle, setEditTitle] = useState(fund.title);
	const [editPrice, setEditPrice] = useState(fund.price);

	// Hook to get current saved money
	const { data: currentSavedMoney } = useSavedMoney();

	const formatPrice = (price: string) => {
		// Remove commas for calculation, but keep decimals
		const numericValue = parseFloat(price.replace(/,/g, ""));
		if (isNaN(numericValue)) return price;

		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		}).format(numericValue);
	};

	const calculateProgress = () => {
		if (!currentSavedMoney?.amount) return 0;

		const savedAmount = parseFloat(currentSavedMoney.amount.replace(/,/g, ""));
		const targetAmount = parseFloat(fund.price.replace(/,/g, ""));

		if (isNaN(savedAmount) || isNaN(targetAmount) || targetAmount === 0)
			return 0;

		const progress = (savedAmount / targetAmount) * 100;
		return Math.min(progress, 100); // Cap at 100%
	};

	const getProgressColor = (progress: number) => {
		if (progress >= 100) return "bg-green-500";
		if (progress >= 75) return "bg-blue-500";
		if (progress >= 50) return "bg-yellow-500";
		if (progress >= 25) return "bg-orange-500";
		return "bg-gray-300";
	};

	const progress = calculateProgress();
	const progressColor = getProgressColor(progress);

	const formatPriceInput = (value: string) => {
		// Only allow digits, commas, and one decimal point
		let cleaned = value.replace(/[^\d,\.]/g, "");

		// Ensure only one decimal point
		const parts = cleaned.split(".");
		if (parts.length > 2) {
			cleaned = parts[0] + "." + parts.slice(1).join("");
		}

		return cleaned;
	};

	const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		const formatted = formatPriceInput(value);
		setEditPrice(formatted);
	};

	const handleSaveEdit = () => {
		if (!editTitle.trim() || !editPrice.trim()) return;

		// Validate that price contains only valid characters
		if (!/^[\d,\.]+$/.test(editPrice.trim())) return;

		onUpdate(fund.id, {
			title: editTitle.trim(),
			price: editPrice.trim(),
		});
		setIsEditing(false);
	};

	const handleCancelEdit = () => {
		setEditTitle(fund.title);
		setEditPrice(fund.price);
		setIsEditing(false);
	};

	const handleEditClick = () => {
		setEditTitle(fund.title);
		setEditPrice(fund.price);
		setIsEditing(true);
	};

	return (
		<Card
			className={`transition-all duration-200 ${
				deleting ? "opacity-50 pointer-events-none" : ""
			} ${isHovered ? "shadow-md" : ""}`}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<CardContent className="px-5">
				<div className="flex flex-col">
					<div className="flex-1 min-w-0">
						{isEditing ? (
							<div className="space-y-2">
								<Input
									value={editTitle}
									onChange={(e) => setEditTitle(e.target.value)}
									className="text-sm"
									placeholder="Product title..."
								/>
								<div className="relative">
									<Input
										value={editPrice}
										onChange={handlePriceChange}
										className="pr-12 text-sm"
										placeholder="0"
									/>
									<div className="right-0 absolute inset-y-0 flex items-center pr-3 pointer-events-none">
										<span className="text-muted-foreground text-xs">VND</span>
									</div>
								</div>
							</div>
						) : (
							<>
								<div className="flex justify-between items-center gap-2 mb-2">
									<h3 className="font-bold text-lg truncate">{fund.title}</h3>
									<div className="flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity duration-200">
										<Button
											variant="ghost"
											size="sm"
											className="p-0 w-8 h-8"
											onClick={handleEditClick}
										>
											<PenIcon className="w-3 h-3" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											className="p-0 w-8 h-8"
											onClick={() => onDelete(fund.id)}
										>
											<XIcon className="w-3 h-3" />
										</Button>
									</div>
								</div>
								<div className="flex items-center gap-1 text-muted-foreground text-xs">
									<DollarSign className="w-3 h-3" />
									<span className="opacity-0 hover:opacity-100 font-mono font-semibold text-green-600 dark:text-green-400 text-base transition-opacity">
										{formatPrice(fund.price)}
									</span>
								</div>

								{/* Progress Bar */}
								<div className="space-y-2 mt-3">
									<div className="flex justify-between items-center text-xs">
										<span className="text-muted-foreground">Progress</span>
										<span className="font-medium">{progress.toFixed(1)}%</span>
									</div>
									<div className="bg-gray-200 dark:bg-gray-700 rounded-full w-full h-2">
										<div
											className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
											style={{ width: `${progress}%` }}
										></div>
									</div>
									<div className="flex justify-between items-center text-muted-foreground text-xs">
										{/* <span>
											{currentSavedMoney?.amount
												? formatPrice(currentSavedMoney.amount)
												: "₫0"}{" "}
											saved
										</span> */}
										<span className="opacity-0 hover:opacity-100 transition-opacity">
											{progress >= 100
												? "Goal reached! 🎉"
												: `${formatPrice(
														(
															parseFloat(fund.price.replace(/,/g, "")) -
															(currentSavedMoney?.amount
																? parseFloat(
																		currentSavedMoney.amount.replace(/,/g, "")
																  )
																: 0)
														).toString()
												  )} to go`}
										</span>
									</div>
								</div>
							</>
						)}
					</div>

					{/* Actions */}
					<div
						className={`flex gap-1 items-end transition-opacity duration-200 ${
							isHovered || isEditing ? "opacity-100" : "opacity-0"
						}`}
					>
						{isEditing ? (
							<div className="flex items-center gap-1 mt-2">
								<Button
									variant="destructive"
									onClick={handleCancelEdit}
									title="Cancel editing"
								>
									<X className="w-3 h-3" />
									<span>Cancel</span>
								</Button>

								<Button
									variant="default"
									onClick={handleSaveEdit}
									disabled={
										!editTitle.trim() ||
										!editPrice.trim() ||
										!/^[\d,\.]+$/.test(editPrice.trim()) ||
										loading
									}
								>
									<Check className="w-3 h-3" />
									<span>Save Changes</span>
								</Button>
							</div>
						) : (
							<>
								{/* Edit */}
								{/* <Button
									variant="ghost"
									size="sm"
									className="p-0 w-8 h-8"
									onClick={handleEditClick}
									disabled={loading || deleting}
									title="Edit fund goal"
								>
									<Edit className="w-3 h-3" />
								</Button> */}

								{/* Delete */}
								{/* <Button
									variant="ghost"
									size="sm"
									className="hover:bg-destructive/10 p-0 w-8 h-8 text-destructive hover:text-destructive"
									onClick={() => onDelete(fund.id)}
									disabled={deleting || loading}
									title="Delete fund goal"
								>
									<Trash2 className="w-3 h-3" />
								</Button> */}
							</>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
