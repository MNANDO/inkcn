import { EditorThemeClasses } from 'lexical';
import './editor-theme.css';

export const editorTheme: EditorThemeClasses = {
	blockCursor: 'EditorTheme__blockCursor',
	embedBlock: {
		base: 'select-none',
		focus: 'outline outline-2 outline-blue-500',
	},
	hashtag: 'bg-primary/10 text-primary px-1 rounded',
	heading: {
		h1: 'text-[2.25em] font-bold leading-[1.2] mt-[1em] mb-[0.25em] text-foreground',
		h2: 'text-[1.75em] font-semibold leading-[1.25] mt-[0.8em] mb-[0.15em] text-foreground',
		h3: 'text-[1.375em] font-semibold leading-[1.3] mt-[0.6em] mb-[0.1em] text-foreground',
		h4: 'text-base font-semibold leading-[1.3] mt-[0.5em] mb-px text-foreground',
		h5: 'text-sm font-semibold leading-[1.3] mt-[0.5em] mb-px text-foreground',
		h6: 'text-xs font-semibold leading-[1.3] mt-[0.5em] mb-px text-foreground',
	},
	hr: 'EditorTheme__hr mt-2 mb-2',
	image: 'editor-image',
	indent: '[--lexical-indent-base-value:24px]',
	link: 'text-foreground underline decoration-muted-foreground/50 underline-offset-[3px] hover:decoration-foreground cursor-pointer',
	list: {
		checklist: '',
		listitem:
			'm-0 pl-[0.2em] leading-[1.65] text-foreground marker:text-foreground',
		listitemChecked: 'EditorTheme__listItemChecked',
		listitemUnchecked: 'EditorTheme__listItemUnchecked',
		nested: {
			listitem: 'list-none before:hidden after:hidden',
		},
		olDepth: [
			'm-0 mb-2 pl-6 list-outside list-decimal',
			'm-0 mb-2 pl-6 list-outside list-[lower-alpha]',
			'm-0 mb-2 pl-6 list-outside list-[lower-roman]',
			'm-0 mb-2 pl-6 list-outside list-decimal',
			'm-0 mb-2 pl-6 list-outside list-[lower-alpha]',
		],
		ul: 'm-0 mb-2 pl-6 list-outside list-disc',
	},
	paragraph: 'm-0 mb-2 relative leading-[1.65] text-foreground',
	quote: 'mt-1 mb-2 pl-4 border-l-[3px] border-foreground/20 text-foreground',
	tab: 'EditorTheme__tabNode',
	text: {
		bold: 'font-semibold',
		capitalize: 'capitalize',
		code: 'bg-muted/80 rounded px-[0.4em] py-[0.2em] font-mono text-[85%] text-destructive',
		highlight: 'bg-yellow-100 dark:bg-yellow-500/30 px-0.5 -mx-0.5',
		italic: 'italic',
		lowercase: 'lowercase',
		strikethrough: 'line-through',
		subscript: 'text-[0.8em] align-sub',
		superscript: 'text-[0.8em] align-super',
		underline: 'underline',
		underlineStrikethrough: 'underline line-through',
		uppercase: 'uppercase',
	},
};
