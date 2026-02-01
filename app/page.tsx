'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

const EditorDemo = dynamic(() => import('@/components/editor-demo'), {
	ssr: false,
});

export default function Home() {
	const { theme, setTheme } = useTheme();
	const [copied, setCopied] = useState(false);
	const installCommand =
		'npx shadcn add http://inkcn.vercel.app/r/editor.json';

	const handleCopy = () => {
		navigator.clipboard.writeText(installCommand);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Top Nav */}
			<nav className="flex items-center justify-between px-6 py-4 mx-auto max-w-4xl">
				<span className="font-semibold text-sm">Inkcn</span>
				<div className="flex items-center gap-1">
					<Button variant="ghost" size="icon" asChild>
						<a
							href="https://github.com/MNANDO/inkcn"
							target="_blank"
							rel="noopener noreferrer"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
							</svg>
						</a>
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={() =>
							setTheme(theme === 'dark' ? 'light' : 'dark')
						}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="block dark:hidden"
						>
							<circle cx="12" cy="12" r="4" />
							<path d="M12 2v2" />
							<path d="M12 20v2" />
							<path d="m4.93 4.93 1.41 1.41" />
							<path d="m17.66 17.66 1.41 1.41" />
							<path d="M2 12h2" />
							<path d="M20 12h2" />
							<path d="m6.34 17.66-1.41 1.41" />
							<path d="m19.07 4.93-1.41 1.41" />
						</svg>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="hidden dark:block"
						>
							<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
						</svg>
					</Button>
				</div>
			</nav>

			<div className="mx-auto max-w-4xl px-6 pb-16 pt-12">
				{/* Header */}
				<header className="text-center mb-8">
					<h1 className="text-4xl font-bold tracking-tight mb-2">
						Welcome to Inkcn
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
						An extensible, block style rich text editor built on
						Shadcn/ui and Lexical. Open source, open code.
					</p>
					<div className="flex items-center justify-center gap-2 flex-wrap">
						<Badge variant="secondary">Lexical</Badge>
						<Badge variant="secondary">Notion</Badge>
						<Badge variant="secondary">Shadcn/ui</Badge>
					</div>
				</header>

				{/* Editor Placeholder */}
				<div className="min-h-100">
					<EditorDemo />
				</div>

				{/* Install Section */}
				<div className="text-center">
					<p className="text-sm text-muted-foreground mb-3">
						Add to your project
					</p>
					<div className="inline-flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2 font-mono text-sm">
						<span className="text-muted-foreground">$</span>
						<code>{installCommand}</code>
						<Button
							variant="ghost"
							size="icon-xs"
							className="ml-2"
							onClick={handleCopy}
						>
							{copied ? (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M20 6 9 17l-5-5" />
								</svg>
							) : (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<rect
										width="14"
										height="14"
										x="8"
										y="8"
										rx="2"
										ry="2"
									/>
									<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
								</svg>
							)}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
