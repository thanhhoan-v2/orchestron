"use client";

import { Fund } from "@/lib/db";
import {
    useCreateFund,
    useDeleteFund,
    useFunds,
    useReorderFunds,
    useUpdateFund,
} from "@/lib/hooks/use-funds";
import { useState } from "react";
import { FundForm } from "./fund-form";
import { FundItem } from "./fund-item";

export function FundsList() {
	const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

	// React Query hooks
	const { data: funds = [], isLoading } = useFunds();
	const createFundMutation = useCreateFund();
	const updateFundMutation = useUpdateFund();
	const deleteFundMutation = useDeleteFund();
	const reorderFundsMutation = useReorderFunds();

	const handleCreateFund = async (fundData: {
		title: string;
		price: string;
	}) => {
		createFundMutation.mutate(fundData);
	};

	const handleUpdateFund = async (id: string, updates: Partial<Fund>) => {
		updateFundMutation.mutate({ id, updates });
	};

	const handleDeleteFund = async (id: string) => {
		// Prevent multiple delete attempts
		if (deletingIds.has(id)) return;

		// Mark as deleting
		setDeletingIds((prev) => new Set(prev).add(id));

		deleteFundMutation.mutate(id, {
			onSettled: () => {
				// Remove from deleting set regardless of success or failure
				setDeletingIds((prev) => {
					const newSet = new Set(prev);
					newSet.delete(id);
					return newSet;
				});
			},
		});
	};

	const handleMoveUp = async (fundId: string) => {
		const currentIndex = funds.findIndex((fund: Fund) => fund.id === fundId);
		if (currentIndex <= 0) return; // Already at top or not found

		const currentFund = funds[currentIndex];
		const previousFund = funds[currentIndex - 1];

		// Swap the order values between the two funds
		const fundOrders = [
			{ id: currentFund.id, order: previousFund.order },
			{ id: previousFund.id, order: currentFund.order },
		];

		reorderFundsMutation.mutate(fundOrders);
	};

	const handleMoveDown = async (fundId: string) => {
		const currentIndex = funds.findIndex((fund: Fund) => fund.id === fundId);
		if (currentIndex >= funds.length - 1 || currentIndex === -1) return; // Already at bottom or not found

		const currentFund = funds[currentIndex];
		const nextFund = funds[currentIndex + 1];

		// Swap the order values between the two funds
		const fundOrders = [
			{ id: currentFund.id, order: nextFund.order },
			{ id: nextFund.id, order: currentFund.order },
		];

		reorderFundsMutation.mutate(fundOrders);
	};

	if (isLoading) {
		return (
			<div className="space-y-6 mx-auto p-5 w-full">
				{/* Create Fund Form */}
				<FundForm
					onSubmit={handleCreateFund}
					loading={false}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6 mx-auto p-5 w-full">
			{/* Create Fund Form */}
			<FundForm
				onSubmit={handleCreateFund}
				loading={createFundMutation.isPending}
			/>

			{/* Fund List */}
			<div className="space-y-4 max-h-[800px] overflow-y-auto">
				{funds.length === 0 ? (
					<div>
						<div className="p-8 text-center">
							<div className="space-y-2">
								<h3 className="font-medium text-lg">No fund goals found</h3>
								<p className="text-muted-foreground">
									Create your first fund goal to get started!
								</p>
							</div>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						{funds.map((fund: Fund, index: number) => (
							<FundItem
								key={fund.id}
								fund={fund}
								onUpdate={handleUpdateFund}
								onDelete={handleDeleteFund}
								onMoveUp={handleMoveUp}
								onMoveDown={handleMoveDown}
								loading={updateFundMutation.isPending}
								deleting={deletingIds.has(fund.id)}
								canMoveUp={index > 0}
								canMoveDown={index < funds.length - 1}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
