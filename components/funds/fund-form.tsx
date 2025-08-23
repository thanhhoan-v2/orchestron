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
import { DollarSignIcon, Plus, SettingsIcon } from "lucide-react";
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

	// New state for quick-add amounts form
	const [showQuickAddForm, setShowQuickAddForm] = useState(false);
	const [newQuickAddAmount, setNewQuickAddAmount] = useState("");

	// Quick add amount management
	const [showQuickAddManagement, setShowQuickAddManagement] = useState(false);

	// Hooks for saved money
	const { data: currentSavedMoney, isLoading: isLoadingSavedMoney } =
		useSavedMoney();
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
			await updateSavedMoney.mutateAsync({ amount: savedMoney.trim() });

			// Reset form and close dialog
			setSavedMoney("");
			setSavedMoneyDialogOpen(false);
		} catch (error) {
			console.error("Failed to update saved money:", error);
		}
	};

	const handleAddQuickAddAmount = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newQuickAddAmount.trim()) return;

		// Validate that amount contains only valid characters
		if (!/^[\d,\.]+$/.test(newQuickAddAmount.trim())) return;

		try {
			// Get current quick-add amounts and add the new one
			const currentAmounts = currentSavedMoney?.quick_add_amounts || [];
			const newAmounts = [...currentAmounts, newQuickAddAmount.trim()];

			// Update saved money with new quick-add amounts
			await updateSavedMoney.mutateAsync({
				amount: currentSavedMoney?.amount || "0",
				quick_add_amounts: newAmounts,
			});

			// Reset form
			setNewQuickAddAmount("");
			setShowQuickAddForm(false);
		} catch (error) {
			console.error("Failed to add quick-add amount:", error);
		}
	};

	const handleRemoveQuickAddAmount = async (amountToRemove: string) => {
		try {
			// Get current quick-add amounts and remove the specified one
			const currentAmounts = currentSavedMoney?.quick_add_amounts || [];
			const newAmounts = currentAmounts.filter(
				(amount) => amount !== amountToRemove
			);

			// Update saved money with updated quick-add amounts
			await updateSavedMoney.mutateAsync({
				amount: currentSavedMoney?.amount || "0",
				quick_add_amounts: newAmounts,
			});
		} catch (error) {
			console.error("Failed to remove quick-add amount:", error);
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

	const getQuickAddAmountDisplay = (amount: string) => {
		const numericValue = parseFloat(amount.replace(/,/g, ""));
		return isNaN(numericValue) ? "0" : numericValue.toLocaleString("vi-VN");
	};

	return (
		<>
			<div className="flex justify-between items-center pb-2 border-b-2">
				<h2 className="font-bold text-xl">Funds</h2>
				<div className="flex gap-2">
					<Dialog
						open={savedMoneyDialogOpen}
						onOpenChange={handleSavedMoneyDialogChange}
					>
						<DialogTrigger asChild>
							<Button variant="ghost" title="Store Current Saved Money">
								<DollarSignIcon className="w-4 h-4" />
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[425px]">
							<DialogHeader>
								<DialogTitle>Savings</DialogTitle>
							</DialogHeader>

							{/* Display current saved money */}
							<div>
								<p className="font-bold text-2xl">
									{isLoadingSavedMoney
										? "Loading..."
										: `${getCurrentSavedMoneyDisplay()} VND`}
								</p>
							</div>

							{/* Dynamic quick-add buttons */}
							{currentSavedMoney?.quick_add_amounts &&
								currentSavedMoney.quick_add_amounts.length > 0 && (
									<div className="mb-4">
										<div className="gap-2 grid grid-cols-2">
											{currentSavedMoney.quick_add_amounts.map(
												(amount, index) => (
													<Button
														key={index}
														variant="outline"
														size="sm"
														onClick={() => {
															// Get current amount and add the quick-add amount to the input field
															const currentAmount =
																currentSavedMoney?.amount || "0";
															const currentNumeric = parseFloat(
																currentAmount.replace(/,/g, "")
															);
															const quickAddNumeric = parseFloat(
																amount.replace(/,/g, "")
															);
															const newAmount = (
																currentNumeric + quickAddNumeric
															).toString();

															// Update the input field with the new amount
															setSavedMoney(newAmount);
														}}
														className="text-sm"
													>
														+ {getQuickAddAmountDisplay(amount)} VND
													</Button>
												)
											)}
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													setShowQuickAddManagement(!showQuickAddManagement)
												}
											>
												<SettingsIcon className="size-4" />
											</Button>
										</div>
									</div>
								)}

							<form onSubmit={handleSavedMoneySubmit} className="space-y-4">
								<div>
									<label
										htmlFor="saved-money-input"
										className="block mb-2 font-medium text-sm"
									>
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
										{updateSavedMoney.isPending
											? "Updating..."
											: "Update Saved Money"}
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

							{/* Quick-add amounts management */}
							{showQuickAddManagement && (
								<div className="mt-6 pt-4 border-t">
									{/* Display current quick-add amounts */}
									{currentSavedMoney?.quick_add_amounts &&
										currentSavedMoney.quick_add_amounts.length > 0 && (
											<div className="space-y-2 mb-3">
												{currentSavedMoney.quick_add_amounts.map(
													(amount, index) => (
														<div
															key={index}
															className="flex justify-between items-center bg-muted p-2 rounded"
														>
															<span className="font-medium">
																{getQuickAddAmountDisplay(amount)} VND
															</span>
															<Button
																variant="ghost"
																size="sm"
																onClick={() =>
																	handleRemoveQuickAddAmount(amount)
																}
																className="text-destructive hover:text-destructive"
															>
																Remove
															</Button>
														</div>
													)
												)}
											</div>
										)}

									{/* Quick-add form */}
									<form
										onSubmit={handleAddQuickAddAmount}
										className="space-y-3"
									>
										<div>
											<label
												htmlFor="quick-add-input"
												className="block mb-1 font-medium text-sm"
											>
												New Quick-Add Amount
											</label>
											<div className="relative">
												<Input
													id="quick-add-input"
													placeholder="0"
													value={newQuickAddAmount}
													onChange={(e) => {
														const value = e.target.value;
														const formatted = formatVND(value);
														setNewQuickAddAmount(formatted);
													}}
													className="pr-12"
													required
												/>
												<div className="right-0 absolute inset-y-0 flex items-center pr-3 pointer-events-none">
													<span className="text-muted-foreground text-sm">
														VND
													</span>
												</div>
											</div>
											{newQuickAddAmount && (
												<p className="mt-1 text-muted-foreground text-sm">
													{getQuickAddAmountDisplay(newQuickAddAmount)} VND
												</p>
											)}
										</div>
										<div className="flex gap-2">
											<Button
												type="submit"
												size="sm"
												disabled={
													!newQuickAddAmount.trim() ||
													!/^[\d,\.]+$/.test(newQuickAddAmount.trim()) ||
													updateSavedMoney.isPending
												}
												className="flex-1"
											>
												{updateSavedMoney.isPending
													? "Adding..."
													: "Add Amount"}
											</Button>
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => {
													setShowQuickAddForm(false);
													setNewQuickAddAmount("");
												}}
											>
												Cancel
											</Button>
										</div>
									</form>
								</div>
							)}
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
