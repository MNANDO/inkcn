'use client';

import { EditorView } from '@/components/editor/editor-view';
import { useCreateEditor } from '@/components/editor/hooks/use-create-editor';
import { Button } from '@/components/ui/button';

export default function Home() {
	const editor = useCreateEditor();

	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto max-w-4xl px-6 py-16">
				{/* Header */}
				<header className="text-center mb-16">
					<h1 className="text-4xl font-bold tracking-tight mb-4">
						Inkcn
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						A beautiful, extensible rich text editor built with
						shadcn/ui. Install it in your project with a single
						command.
					</p>
				</header>

				{/* Editor Placeholder */}
				<div className="mb-12 min-h-100">
					<EditorView editor={editor} />
				</div>

				{/* Install Section */}
				<div className="text-center">
					<p className="text-sm text-muted-foreground mb-3">
						Add to your project
					</p>
					<div className="inline-flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2 font-mono text-sm">
						<span className="text-muted-foreground">$</span>
						<code>npx shadcn add https://inkcn.vercel.app</code>
						<Button variant="ghost" size="icon-xs" className="ml-2">
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
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
