"use client";

import { Badge } from "@/components/ui/badge";
import {
  Bookmark,
  Calendar,
  Globe,
  Keyboard,
  Plus,
  Search,
} from "lucide-react";
import { useState } from "react";

export function ShortcutsHelp() {
	const [isVisible, setIsVisible] = useState(true);

	if (!isVisible) {
		return (
			<button
				onClick={() => setIsVisible(true)}
				className="right-4 bottom-4 z-50 fixed bg-background shadow-lg hover:shadow-xl p-2 border rounded-full transition-shadow"
				title="Show keyboard shortcuts"
			>
				<Keyboard className="w-4 h-4" />
			</button>
		);
	}

	return (
		<div className="right-4 bottom-4 z-50 fixed shadow-lg w-72">
			<div className="p-4">
				<div className="space-y-2 text-xs">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							<Search className="w-3 h-3" />
							<span>Search</span>
						</div>
						<Badge variant="outline" className="text-xs">
							S
						</Badge>
					</div>

					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							<Globe className="w-3 h-3" />
							<span>Daily.dev</span>
						</div>
						<Badge variant="outline" className="text-xs">
							D
						</Badge>
					</div>

					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							<Plus className="w-3 h-3" />
							<span>New Todo</span>
						</div>
						<Badge variant="outline" className="text-xs">
							1
						</Badge>
					</div>

					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							<Bookmark className="w-3 h-3" />
							<span>New Bookmark</span>
						</div>
						<Badge variant="outline" className="text-xs">
							2
						</Badge>
					</div>

					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2">
							<Calendar className="w-3 h-3" />
							<span>New Reminder</span>
						</div>
						<Badge variant="outline" className="text-xs">
							3
						</Badge>
					</div>
				</div>
			</div>
		</div>
	);
}
