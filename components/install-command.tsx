'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function InstallCommand() {
	const [copied, setCopied] = useState(false);

	const installCommand =
		'npx shadcn add http://inkcn.vercel.app/r/editor.json';

	const handleCopy = () => {
		navigator.clipboard.writeText(installCommand);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
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
	);
}
