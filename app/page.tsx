import { lazy, Suspense } from "react";

export const experimental_ppr = true;

const BookmarkList = lazy(() =>
	import("@/components/bookmark/bookmark-list").then((module) => ({
		default: module.BookmarkList,
	}))
);
const FundsList = lazy(() =>
	import("@/components/funds/funds-list").then((module) => ({
		default: module.FundsList,
	}))
);
const GoalList = lazy(() =>
	import("@/components/goal/goal-list").then((module) => ({
		default: module.GoalList,
	}))
);
const ReminderList = lazy(() =>
	import("@/components/reminder/reminder-list").then((module) => ({
		default: module.ReminderList,
	}))
);
const TodoList = lazy(() =>
	import("@/components/todo/todo-list").then((module) => ({
		default: module.TodoList,
	}))
);

const LoadingFallback = () => <div></div>;

export default function Home() {
	return (
		<>
			<div className="gap-4 grid grid-cols-3 px-5">
				<div className="flex flex-col gap-4">
					<Suspense fallback={<LoadingFallback />}>
						<GoalList />
					</Suspense>
					<Suspense fallback={<LoadingFallback />}>
						<ReminderList />
					</Suspense>
				</div>

				<div className="flex flex-col">
					<Suspense fallback={<LoadingFallback />}>
						<TodoList />
					</Suspense>
				</div>

				<div className="flex flex-col gap-4">
					<Suspense fallback={<LoadingFallback />}>
						<BookmarkList />
					</Suspense>
					<Suspense fallback={<LoadingFallback />}>
						<FundsList />
					</Suspense>
				</div>
			</div>
		</>
	);
}
