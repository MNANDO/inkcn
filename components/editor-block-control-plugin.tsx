'use client';

import type { JSX } from 'react';

import { DraggableBlockPlugin_EXPERIMENTAL } from '@lexical/react/LexicalDraggableBlockPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
	$getNearestNodeFromDOMNode,
	$setSelection,
	$createRangeSelection,
	$createParagraphNode,
} from 'lexical';
import { useRef, useCallback, useState, useEffect } from 'react';
import { GripVertical, Plus } from 'lucide-react';

import { BlockPickerOption } from '../lib/BlockPickerOption';
import { BlockPickerMenu } from './block-picker-menu';

type BlockControlPluginProps = {
	anchorElem?: HTMLElement;
	options?: BlockPickerOption[];
};

export default function EditorBlockControlPlugin({
	anchorElem = document.body,
	options = [],
}: BlockControlPluginProps): JSX.Element {
	const [editor] = useLexicalComposerContext();
	const menuRef = useRef<HTMLDivElement>(null);
	const targetLineRef = useRef<HTMLDivElement>(null);
	const draggableBlockElemRef = useRef<HTMLElement | null>(null);
	const plusButtonRef = useRef<HTMLButtonElement>(null);

	const [showBlockPicker, setShowBlockPicker] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(0);

	const handleElementChanged = useCallback((element: HTMLElement | null) => {
		draggableBlockElemRef.current = element;
		setShowBlockPicker(false);
	}, []);

	const isOnMenu = useCallback((element: HTMLElement): boolean => {
		return !!menuRef.current?.contains(element);
	}, []);

	const handlePlusClick = useCallback(() => {
		editor.update(() => {
			const blockElem = draggableBlockElemRef.current;
			if (blockElem) {
				const node = $getNearestNodeFromDOMNode(blockElem);
				if (node) {
					const newParagraph = $createParagraphNode();
					node.insertAfter(newParagraph);
					const selection = $createRangeSelection();
					selection.anchor.set(newParagraph.getKey(), 0, 'element');
					selection.focus.set(newParagraph.getKey(), 0, 'element');
					$setSelection(selection);
				}
			}
		});
		setShowBlockPicker(true);
		setSelectedIndex(0);
	}, [editor]);

	const handleSelectOption = useCallback(
		(option: BlockPickerOption) => {
			editor.update(() => {
				option.insert({ editor, queryString: '' });
			});
			setShowBlockPicker(false);
		},
		[editor],
	);

	// Close on click outside
	useEffect(() => {
		if (!showBlockPicker) return;
		const handleClick = (e: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(e.target as Node)
			) {
				setShowBlockPicker(false);
			}
		};
		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, [showBlockPicker]);

	return (
		<>
			<DraggableBlockPlugin_EXPERIMENTAL
				anchorElem={anchorElem}
				menuRef={menuRef}
				targetLineRef={targetLineRef}
				onElementChanged={handleElementChanged}
				menuComponent={
					<div
						ref={menuRef}
						className="group flex items-center gap-0.5 rounded p-0.5 px-px opacity-0 absolute left-0 top-0 will-change-transform"
					>
						<button
							ref={plusButtonRef}
							type="button"
							className="flex items-center justify-center w-6 h-6 p-0 border-none bg-transparent cursor-pointer opacity-30 rounded group-hover:opacity-60 hover:opacity-100! hover:bg-neutral-200"
							aria-label="Add block"
							onClick={handlePlusClick}
						>
							<Plus size={18} />
						</button>
						<div className="flex items-center justify-center w-6 h-6 opacity-30 cursor-grab active:cursor-grabbing rounded group-hover:opacity-60 hover:opacity-100! hover:bg-neutral-200">
							<GripVertical size={18} />
						</div>
						{showBlockPicker && options.length > 0 && (
							<div className="absolute top-full left-0 z-50 mt-1">
								<BlockPickerMenu
									options={options}
									selectedIndex={selectedIndex}
									onSelectOption={handleSelectOption}
									onSetHighlightedIndex={setSelectedIndex}
								/>
							</div>
						)}
					</div>
				}
				targetLineComponent={
					<div
						ref={targetLineRef}
						className="ib-block-control-target-line pointer-events-none bg-sky-400 h-1 absolute left-0 top-0 opacity-0 will-change-transform"
					/>
				}
				isOnMenu={isOnMenu}
			/>
		</>
	);
}
