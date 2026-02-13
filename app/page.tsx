import EditorDemo from '@/components/editor-demo';
import InstallCommand from '@/components/install-command';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Home() {
	return (
		<div className="min-h-screen bg-background" role="document">
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
					<ThemeToggle />
				</div>
			</nav>

			<main className="mx-auto max-w-4xl px-6 pb-16 pt-12">
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
					<InstallCommand />
				</div>
			</main>
		</div>
	);
}
