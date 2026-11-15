import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { ToasterProvider } from "~/components/toaster-provider";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

// Suppress AI SDK deprecation warnings
if (typeof process !== "undefined") {
	process.env.AI_SDK_LOG_WARNINGS = "false";
}

// Prevent flash of wrong theme on SSR
function ThemeScript() {
	return (
		<script
			dangerouslySetInnerHTML={{
				__html: `
					(function() {
						try {
							const saved = localStorage.getItem('dark');
							const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
							if (saved === 'true' || (!saved && prefersDark)) {
								document.documentElement.classList.add('dark');
							}
						} catch (e) {}
					})();
				`,
			}}
		/>
	);
}

function DarkModeToggle() {
	const [mounted, setMounted] = useState(false);
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		setMounted(true);
		const saved = localStorage.getItem('dark');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const initial = saved === 'true' || (!saved && prefersDark);
		setIsDark(initial);
	}, []);

	const toggle = () => {
		const next = !isDark;
		setIsDark(next);
		localStorage.setItem('dark', String(next));
		if (next) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	};

	if (!mounted) {
		return (
			<button
				className="p-2 rounded-lg bg-muted hover:bg-muted/50 transition-colors"
				aria-label="Toggle dark mode"
				disabled
			>
				<Sun className="w-5 h-5" aria-hidden="true" />
			</button>
		);
	}

	return (
		<button
			onClick={toggle}
			className="p-2 rounded-lg bg-muted hover:bg-muted/50 transition-colors focus-ring"
			aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
			aria-pressed={isDark}
		>
			{isDark ? (
				<Sun className="w-5 h-5 text-honey" aria-hidden="true" />
			) : (
				<Moon className="w-5 h-5 text-charcoal" aria-hidden="true" />
			)}
		</button>
	);
}

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
				<ThemeScript />
			</head>
			<body>
				{children}
				<ToasterProvider />
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="pt-16 p-4 container mx-auto">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
