'use client';

import type { JSX } from 'react';

import { DraggableBlockPlugin_EXPERIMENTAL } from '@lexical/react/LexicalDraggableBlockPlugin';
import { useRef, useCallback } from 'react';
import { GripVertical, Plus } from 'lucide-react';

type BlockControlPluginProps = {
	anchorElem?: HTMLElement;
};

export default function EditorBlockControlPlugin({
	anchorElem = document.body,
}: BlockControlPluginProps): JSX.Element {
	const menuRef = useRef<HTMLDivElement>(null);
	const targetLineRef = useRef<HTMLDivElement>(null);
	const draggableBlockElemRef = useRef<HTMLElement | null>(null);

	const handleElementChanged = useCallback((element: HTMLElement | null) => {
		draggableBlockElemRef.current = element;
	}, []);

	const isOnMenu = useCallback((element: HTMLElement): boolean => {
		return !!menuRef.current?.contains(element);
	}, []);

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
							type="button"
							className="flex items-center justify-center w-6 h-6 p-0 border-none bg-transparent cursor-pointer opacity-30 rounded group-hover:opacity-60 hover:opacity-100! hover:bg-neutral-200"
							aria-label="Add block"
						>
							<Plus size={18} />
						</button>
						<div className="flex items-center justify-center w-6 h-6 opacity-30 cursor-grab active:cursor-grabbing rounded group-hover:opacity-60 hover:opacity-100! hover:bg-neutral-200">
							<GripVertical size={18} />
						</div>
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
