"use client";

import { useMutationState } from "@tanstack/react-query";
import { CheckCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface SavingStatusProps {
	className?: string;
}

export function SavingStatus({ className = "" }: SavingStatusProps) {
	const [showSuccess, setShowSuccess] = useState(false);
	
	// Get all pending mutations to determine saving status
	const mutations = useMutationState();
	
	// Check if any mutations are pending
	const hasPendingMutations = mutations.some(mutation => mutation.status === 'pending');
	
	// Check for recently completed mutations
	const recentlyCompleted = mutations.filter(m => 
		m.status === 'success' && 
		Date.now() - (m.submittedAt || 0) < 3000 // Show for 3 seconds
	);

	// Show success message briefly
	useEffect(() => {
		if (recentlyCompleted.length > 0) {
			setShowSuccess(true);
			const timer = setTimeout(() => setShowSuccess(false), 2000);
			return () => clearTimeout(timer);
		}
	}, [recentlyCompleted]);

	// Don't show anything if no mutations are pending and no recent activity
	if (!hasPendingMutations && !showSuccess) {
		return null;
	}

	return (
		<div className={`right-4 bottom-16 z-50 fixed ${className}`}>
			{/* Saving Status */}
			{hasPendingMutations && (
				<div className="bg-background/80 shadow-lg backdrop-blur-sm mb-2 px-3 py-2 border rounded-lg">
					<div className="flex items-center gap-2 text-sm">
						<Clock className="size-4 text-blue-500 animate-spin" />
						<span className="font-medium text-foreground">Saving...</span>
					</div>
				</div>
			)}

			{/* Success Message */}
			{showSuccess && (
				<div className="bg-green-500/80 shadow-lg backdrop-blur-sm mb-2 px-3 py-2 border border-green-500 rounded-lg">
					<div className="flex items-center gap-2 text-sm">
						<CheckCircle className="size-4 text-green-600" />
						<span className="font-medium text-white">Saved</span>
					</div>
				</div>
			)}
		</div>
	);
}
