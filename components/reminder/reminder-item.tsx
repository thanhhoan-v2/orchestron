"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reminder } from "@/lib/db";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, Calendar, Trash2 } from "lucide-react";
import { useState } from "react";

interface ReminderItemProps {
	reminder: Reminder;
	onUpdate: (id: string, updates: Partial<Reminder>) => void;
	onDelete: (id: string) => void;
	onMoveUp: (id: string) => void;
	onMoveDown: (id: string) => void;
	loading?: boolean;
	deleting?: boolean;
	canMoveUp: boolean;
	canMoveDown: boolean;
}

export function ReminderItem({
	reminder,
	onDelete,
	onMoveUp,
	onMoveDown,
	deleting = false,
	canMoveUp,
	canMoveDown,
}: ReminderItemProps) {
	const [isHovered, setIsHovered] = useState(false);

	const getDaysRemainingBadge = (daysRemaining: number) => {
		if (daysRemaining < 0) {
			return (
				<Badge variant="destructive" className="text-xs">
					{Math.abs(daysRemaining)} days overdue
				</Badge>
			);
		} else if (daysRemaining === 0) {
			return (
				<Badge variant="destructive" className="text-xs">
					Due today
				</Badge>
			);
		} else if (daysRemaining <= 7) {
			return (
				<Badge
					variant="secondary"
					className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs"
				>
					{daysRemaining} days left
				</Badge>
			);
		} else {
			return (
				<Badge variant="outline" className="text-xs">
					{daysRemaining} days left
				</Badge>
			);
		}
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
				<div className="flex justify-between items-center">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-2">
							<h3 className="font-medium text-sm truncate">{reminder.title}</h3>
							{getDaysRemainingBadge(reminder.days_remaining)}
						</div>
						<div className="flex items-center gap-1 text-muted-foreground text-xs">
							<Calendar className="w-3 h-3" />
							<span>{format(new Date(reminder.due_date), "PPP")}</span>
						</div>
					</div>

					{/* Actions */}
					<div
						className={`flex gap-1 transition-opacity duration-200 ${
							isHovered ? "opacity-100" : "opacity-0"
						}`}
					>
						{/* Move up */}
						<Button
							variant="ghost"
							size="sm"
							className="p-0 w-8 h-8"
							onClick={() => onMoveUp(reminder.id)}
							disabled={!canMoveUp}
							title="Move up"
						>
							<ArrowUp className="w-3 h-3" />
						</Button>

						{/* Move down */}
						<Button
							variant="ghost"
							size="sm"
							className="p-0 w-8 h-8"
							onClick={() => onMoveDown(reminder.id)}
							disabled={!canMoveDown}
							title="Move down"
						>
							<ArrowDown className="w-3 h-3" />
						</Button>

						{/* Delete */}
						<Button
							variant="ghost"
							size="sm"
							className="hover:bg-destructive/10 p-0 w-8 h-8 text-destructive hover:text-destructive"
							onClick={() => onDelete(reminder.id)}
							disabled={deleting}
							title="Delete reminder"
						>
							<Trash2 className="w-3 h-3" />
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
