"use client";

import { BookmarkList } from "@/components/bookmark/bookmark-list";
import { FundsList } from "@/components/funds/funds-list";
import { GoalList } from "@/components/goal/goal-list";
import { ReminderList } from "@/components/reminder/reminder-list";
import { TodoList } from "@/components/todo/todo-list";

export default function Home() {
	return (
		<>
			<div className="gap-4 grid grid-cols-3 px-5">
				<div className="flex flex-col gap-4">
					<TodoList />
					<ReminderList />
				</div>

				<div className="flex flex-col">
					<GoalList />
					{/* <Image
						src="/ascii-art-1.png"
						alt="ascii-art-1"
						width={400}
						height={80}
					/>
					<div className="font-bold text-xl">Welcome, Hoàn.</div>
					<Button asChild>
						<Link href="https://app.daily.dev">Tech news</Link>
					</Button> */}
				</div>

				<div className="flex flex-col gap-4">
					<BookmarkList />
					<FundsList />
				</div>
			</div>

			{/* <ShortcutsHelp /> */}
		</>
	);
}
