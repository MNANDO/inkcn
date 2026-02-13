import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Inkcn - Rich Text Editor for shadcn/ui',
	description:
		'A Notion-style rich text editor built with Lexical, distributed as a shadcn/ui registry component. Open source, copy-paste ready, and fully customizable.',
	metadataBase: new URL('https://inkcn.vercel.app'),
	keywords: [
		'rich text editor',
		'shadcn',
		'shadcn/ui',
		'lexical',
		'react',
		'nextjs',
		'notion',
		'block editor',
		'wysiwyg',
	],
	openGraph: {
		title: 'Inkcn - Rich Text Editor for shadcn/ui',
		description:
			'A Notion-style rich text editor built with Lexical, distributed as a shadcn/ui registry component.',
		url: 'https://inkcn.vercel.app',
		siteName: 'Inkcn',
		locale: 'en_US',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Inkcn - Rich Text Editor for shadcn/ui',
		description:
			'A Notion-style rich text editor built with Lexical, distributed as a shadcn/ui registry component.',
	},
	alternates: {
		canonical: 'https://inkcn.vercel.app',
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
