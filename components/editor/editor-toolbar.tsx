'use client';

import { $getSelection, $isRangeSelection, LexicalEditor } from 'lexical';
import { JSX } from 'react';
import { createPortal } from 'react-dom';

import {
	Bold,
	Italic,
	Underline,
	Strikethrough,
	ChevronDown,
	Baseline,
} from 'lucide-react';

import { filterBlockOptions } from './lib/editor-utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { BlockPickerOption } from './lib/BlockPickerOption';
import { useEditorToolbar } from './hooks/use-editor-toolbar';
import { useFloatingToolbarPosition } from './hooks/use-floating-toolbar-position';
import { useTextFormatToggle } from './hooks/use-text-format-toggle';

export default function EditorToolbar({
	editor,
	anchorElem,
	options,
}: {
	editor: LexicalEditor;
	anchorElem: HTMLElement;
	options: BlockPickerOption[];
}): JSX.Element | null {
	const state = useEditorToolbar(editor);
	const { setPopupRef } = useFloatingToolbarPosition({ editor, anchorElem });
	const { handleValueChange: onTextStyleToggle, currentValues } =
		useTextFormatToggle(editor, state);

	if (!state.isVisible) return null;

	const currentBlock = options.find((opt) => opt.key === state.blockType);
	const blockOptions = filterBlockOptions(options);

	return createPortal(
		<div
			ref={setPopupRef}
			className="absolute z-50 flex items-center gap-0.5 rounded-md border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-150"
		>
			{/* Block picker dropdown */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost">
						{currentBlock?.icon}
						<span>{currentBlock?.title ?? 'Paragraph'}</span>
						<ChevronDown className="h-3 w-3" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start">
					{blockOptions.map((option) => (
						<DropdownMenuItem
							key={option.key}
							onSelect={() => {
								option.insert({ editor, queryString: '' });
								editor.update(() => {
									const selection = $getSelection();
									if ($isRangeSelection(selection)) {
										selection.focus.set(
											selection.anchor.key,
											selection.anchor.offset,
											selection.anchor.type,
										);
									}
								});
							}}
							className={
								state.blockType === option.key
									? 'bg-accent'
									: ''
							}
						>
							<span className="mr-2 h-4 w-4">{option.icon}</span>
							{option.title}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Text format toggles */}
			<ToggleGroup
				type="multiple"
				spacing={1}
				value={currentValues}
				onValueChange={onTextStyleToggle}
			>
				<ToggleGroupItem
					value="bold"
					title="Bold"
					aria-label="Format text as bold"
				>
					<Bold className="h-2 w-2" />
				</ToggleGroupItem>

				<ToggleGroupItem
					value="italic"
					title="Italic"
					aria-label="Format text as italics"
				>
					<Italic className="h-2 w-2" />
				</ToggleGroupItem>

				<ToggleGroupItem
					value="underline"
					title="Underline"
					aria-label="Format text to underlined"
				>
					<Underline className="h-2 w-2" />
				</ToggleGroupItem>

				<ToggleGroupItem
					value="strikethrough"
					title="Strikethrough"
					aria-label="Format text with a strikethrough"
				>
					<Strikethrough className="h-2 w-2" />
				</ToggleGroupItem>
			</ToggleGroup>

			{/* Color picker dropdown */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						style={state.bgColor ? { backgroundColor: state.bgColor } : undefined}
					>
						<Baseline
							className="h-3 w-3"
							style={state.fontColor ? { color: state.fontColor } : undefined}
						/>
					</Button>
				</DropdownMenuTrigger>
			</DropdownMenu>
		</div>,
		anchorElem,
	);
}
