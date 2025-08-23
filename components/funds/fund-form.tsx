"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSavedMoney, useUpdateSavedMoney } from "@/lib/hooks/use-funds";
import { Plus, Save } from "lucide-react";
import { useState } from "react";

interface FundFormProps {
	onSubmit: (fund: { title: string; price: string }) => void;
	loading?: boolean;
}

export function FundForm({ onSubmit, loading }: FundFormProps) {
	const [title, setTitle] = useState("");
	const [price, setPrice] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	
	// New state for saved money dialog
	const [savedMoneyDialogOpen, setSavedMoneyDialogOpen] = useState(false);
	const [savedMoney, setSavedMoney] = useState("");

	// Hooks for saved money
	const { data: currentSavedMoney, isLoading: isLoadingSavedMoney } = useSavedMoney();
	const updateSavedMoney = useUpdateSavedMoney();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim() || !price.trim()) return;

		// Validate that price contains only valid characters
		if (!/^[\d,\.]+$/.test(price.trim())) return;

		onSubmit({
			title: title.trim(),
			price: price.trim(),
		});

		// Reset form
		setTitle("");
		setPrice("");
		setIsOpen(false);
	};

	const handleSavedMoneySubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!savedMoney.trim()) return;

		// Validate that saved money contains only valid characters
		if (!/^[\d,\.]+$/.test(savedMoney.trim())) return;

		try {
			await updateSavedMoney.mutateAsync(savedMoney.trim());
			
			// Reset form and close dialog
			setSavedMoney("");
			setSavedMoneyDialogOpen(false);
		} catch (error) {
			console.error("Failed to update saved money:", error);
		}
	};

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (!open) {
			// Reset form when dialog closes
			setTitle("");
			setPrice("");
		}
	};

	const handleSavedMoneyDialogChange = (open: boolean) => {
		setSavedMoneyDialogOpen(open);
		if (!open) {
			// Reset form when dialog closes
			setSavedMoney("");
		}
	};

	const formatVND = (value: string) => {
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
		const formatted = formatVND(value);
		setPrice(formatted);
	};

	const handleSavedMoneyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		const formatted = formatVND(value);
		setSavedMoney(formatted);
	};

	const getPriceDisplayValue = () => {
		if (!price) return "";
		// Remove commas for calculation, but keep decimals
		const numericValue = parseFloat(price.replace(/,/g, ""));
		return isNaN(numericValue) ? "" : numericValue.toLocaleString("vi-VN");
	};

	const getSavedMoneyDisplayValue = () => {
		if (!savedMoney) return "";
		// Remove commas for calculation, but keep decimals
		const numericValue = parseFloat(savedMoney.replace(/,/g, ""));
		return isNaN(numericValue) ? "" : numericValue.toLocaleString("vi-VN");
	};

	const getCurrentSavedMoneyDisplay = () => {
		if (!currentSavedMoney?.amount) return "0";
		const numericValue = parseFloat(currentSavedMoney.amount.replace(/,/g, ""));
		return isNaN(numericValue) ? "0" : numericValue.toLocaleString("vi-VN");
	};

	return (
		<>
			<div className="flex justify-between items-center pb-2 border-b-2">
				<h2 className="font-bold text-xl">Funds</h2>
				<div className="flex gap-2">
					<Dialog open={savedMoneyDialogOpen} onOpenChange={handleSavedMoneyDialogChange}>
						<DialogTrigger asChild>
							<Button 
								variant="ghost" 
								title="Store Current Saved Money"
							>
								<Save className="w-4 h-4" />
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[425px]">
							<DialogHeader>
								<DialogTitle>Store Current Saved Money</DialogTitle>
							</DialogHeader>
							
							{/* Display current saved money */}
							<div className="bg-muted mb-4 p-3 rounded-lg">
								<p className="mb-1 text-muted-foreground text-sm">Current Saved Money:</p>
								<p className="font-bold text-2xl">
									{isLoadingSavedMoney ? "Loading..." : `${getCurrentSavedMoneyDisplay()} VND`}
								</p>
							</div>

							<form onSubmit={handleSavedMoneySubmit} className="space-y-4">
								<div>
									<label htmlFor="saved-money-input" className="block mb-2 font-medium text-sm">
										New Amount
									</label>
									<div className="relative">
										<Input
											id="saved-money-input"
											placeholder="0"
											value={savedMoney}
											onChange={handleSavedMoneyChange}
											className="pr-12 text-lg"
											required
										/>
										<div className="right-0 absolute inset-y-0 flex items-center pr-3 pointer-events-none">
											<span className="text-muted-foreground text-sm">VND</span>
										</div>
									</div>
									{savedMoney && (
										<p className="mt-1 text-muted-foreground text-sm">
											{getSavedMoneyDisplayValue()} VND
										</p>
									)}
								</div>

								<div className="flex gap-2">
									<Button
										type="submit"
										disabled={
											!savedMoney.trim() ||
											!/^[\d,\.]+$/.test(savedMoney.trim()) ||
											updateSavedMoney.isPending
										}
										className="flex-1"
									>
										{updateSavedMoney.isPending ? "Updating..." : "Update Saved Money"}
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() => setSavedMoneyDialogOpen(false)}
									>
										Cancel
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>

					<Dialog open={isOpen} onOpenChange={handleOpenChange}>
						<DialogTrigger asChild>
							<Button variant="ghost">
								<Plus className="w-4 h-4" />
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[425px]">
							<DialogHeader>
								<DialogTitle>Create New Fund Goal</DialogTitle>
							</DialogHeader>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<Input
										placeholder="Product title..."
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										className="text-lg"
										required
									/>
								</div>

								<div>
									<div className="relative">
										<Input
											placeholder="0"
											value={price}
											onChange={handlePriceChange}
											className="pr-12 text-lg"
											required
										/>
										<div className="right-0 absolute inset-y-0 flex items-center pr-3 pointer-events-none">
											<span className="text-muted-foreground text-sm">VND</span>
										</div>
									</div>
									{price && (
										<p className="mt-1 text-muted-foreground text-sm">
											{getPriceDisplayValue()} VND
										</p>
									)}
								</div>

								<div className="flex gap-2">
									<Button
										type="submit"
										disabled={
											!title.trim() ||
											!price.trim() ||
											!/^[\d,\.]+$/.test(price.trim()) ||
											loading
										}
										className="flex-1"
									>
										{loading ? "Creating..." : "Create Fund Goal"}
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsOpen(false)}
									>
										Cancel
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</>
	);
}
