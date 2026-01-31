'use client';

import { mergeRegister } from '@lexical/utils';
import {
	$getSelection,
	COMMAND_PRIORITY_LOW,
	FORMAT_TEXT_COMMAND,
	getDOMSelection,
	LexicalEditor,
	SELECTION_CHANGE_COMMAND,
	TextFormatType,
} from 'lexical';
import { JSX, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import {
	Bold,
	Italic,
	Underline,
	Strikethrough,
	ChevronDown,
} from 'lucide-react';

import { getDOMRangeRect, setFloatingElemPosition } from '../lib/editor-utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useEditorToolbar } from '../hooks/use-editor-toolbar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { BlockPickerOption } from '../lib/BlockPickerOption';

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
	const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null);

	const { isBold, isItalic, isUnderline, isStrikethrough, blockType } = state;

	const currentBlock = options.find((opt) => opt.key === blockType);

	// Callback ref to position toolbar immediately when element is created
	const setPopupRef = useCallback(
		(elem: HTMLDivElement | null) => {
			popupCharStylesEditorRef.current = elem;
			if (elem) {
				// Position immediately when ref is set
				editor.getEditorState().read(() => {
					const selection = $getSelection();
					const nativeSelection = getDOMSelection(editor._window);
					const rootElement = editor.getRootElement();

					if (
						selection !== null &&
						nativeSelection !== null &&
						!nativeSelection.isCollapsed &&
						rootElement !== null &&
						rootElement.contains(nativeSelection.anchorNode)
					) {
						const rangeRect = getDOMRangeRect(
							nativeSelection,
							rootElement,
						);
						setFloatingElemPosition(
							rangeRect,
							elem,
							anchorElem,
							false,
						);
					}
				});
			}
		},
		[editor, anchorElem],
	);

	function mouseMoveListener(e: MouseEvent) {
		if (
			popupCharStylesEditorRef.current &&
			(e.buttons === 1 || e.buttons === 2)
		) {
			if (
				popupCharStylesEditorRef.current.style.pointerEvents !== 'none'
			) {
				const elementUnderMouse = document.elementFromPoint(
					e.clientX,
					e.clientY,
				);
				if (
					elementUnderMouse &&
					!popupCharStylesEditorRef.current.contains(
						elementUnderMouse,
					)
				) {
					popupCharStylesEditorRef.current.style.pointerEvents =
						'none';
				}
			}
		}
	}

	function mouseUpListener() {
		if (!popupCharStylesEditorRef.current) return;
		if (popupCharStylesEditorRef.current.style.pointerEvents !== 'auto') {
			popupCharStylesEditorRef.current.style.pointerEvents = 'auto';
		}
	}

	useEffect(() => {
		if (!popupCharStylesEditorRef.current) return;

		document.addEventListener('mousemove', mouseMoveListener);
		document.addEventListener('mouseup', mouseUpListener);

		return () => {
			document.removeEventListener('mousemove', mouseMoveListener);
			document.removeEventListener('mouseup', mouseUpListener);
		};
	}, []);

	const $updateTextFormatEditorToolbar = useCallback(() => {
		const selection = $getSelection();
		const popupElem = popupCharStylesEditorRef.current;
		const nativeSelection = getDOMSelection(editor._window);

		if (popupElem === null) return;

		const rootElement = editor.getRootElement();
		if (
			selection !== null &&
			nativeSelection !== null &&
			!nativeSelection.isCollapsed &&
			rootElement !== null &&
			rootElement.contains(nativeSelection.anchorNode)
		) {
			const rangeRect = getDOMRangeRect(nativeSelection, rootElement);
			setFloatingElemPosition(rangeRect, popupElem, anchorElem, false);
		}
	}, [editor, anchorElem]);

	useEffect(() => {
		const scrollerElem = anchorElem.parentElement;

		const update = () => {
			editor.getEditorState().read(() => {
				$updateTextFormatEditorToolbar();
			});
		};

		window.addEventListener('resize', update);
		scrollerElem?.addEventListener('scroll', update);

		return () => {
			window.removeEventListener('resize', update);
			scrollerElem?.removeEventListener('scroll', update);
		};
	}, [editor, $updateTextFormatEditorToolbar, anchorElem]);

	useEffect(() => {
		editor.getEditorState().read(() => {
			$updateTextFormatEditorToolbar();
		});

		return mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					$updateTextFormatEditorToolbar();
				});
			}),
			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				() => {
					$updateTextFormatEditorToolbar();
					return false;
				},
				COMMAND_PRIORITY_LOW,
			),
		);
	}, [editor, $updateTextFormatEditorToolbar]);

	if (!state.isVisible) return null;

	const clearSelection = () => {
		window.getSelection()?.removeAllRanges();
	};

	const handleValueChange = (values: string[]) => {
		const formats: TextFormatType[] = [
			'bold',
			'italic',
			'underline',
			'strikethrough',
		];
		formats.forEach((format) => {
			const isActive =
				format === 'bold'
					? isBold
					: format === 'italic'
						? isItalic
						: format === 'underline'
							? isUnderline
							: isStrikethrough;
			const shouldBeActive = values.includes(format);
			if (isActive !== shouldBeActive) {
				editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
			}
		});
	};

	// Filter to only block-type options (exclude alignment, dividers)
	const blockOptions = options.filter(
		(opt) =>
			opt.category === 'basic' ||
			opt.category === 'headings' ||
			opt.category === 'lists' ||
			opt.category === 'quotes',
	);

	return createPortal(
		<div
			ref={setPopupRef}
			className="absolute z-50 flex items-center gap-0.5 rounded-md border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-150"
		>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
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
								clearSelection();
							}}
							className={blockType === option.key ? 'bg-accent' : ''}
						>
							<span className="mr-2 h-4 w-4">{option.icon}</span>
							{option.title}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
			{editor.isEditable() && (
				<ToggleGroup
					type="multiple"
					spacing={1}
					value={[
						...(isBold ? ['bold'] : []),
						...(isItalic ? ['italic'] : []),
						...(isUnderline ? ['underline'] : []),
						...(isStrikethrough ? ['strikethrough'] : []),
					]}
					onValueChange={handleValueChange}
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
			)}
		</div>,
		anchorElem,
	);
}
