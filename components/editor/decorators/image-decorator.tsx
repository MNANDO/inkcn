'use client';

import type { LexicalCommand, NodeKey } from 'lexical';
import type { JSX } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import {
	$getNodeByKey,
	$getSelection,
	$isNodeSelection,
	$setSelection,
	CLICK_COMMAND,
	COMMAND_PRIORITY_LOW,
	createCommand,
	DRAGSTART_COMMAND,
	KEY_ESCAPE_COMMAND,
	SELECTION_CHANGE_COMMAND,
} from 'lexical';
import {
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { $isImageNode } from '../nodes/image-node';

export const RIGHT_CLICK_IMAGE_COMMAND: LexicalCommand<MouseEvent> =
	createCommand('RIGHT_CLICK_IMAGE_COMMAND');

// --- Image cache for suspense ---

type ImageStatus =
	| { error: true }
	| { error: false; width: number; height: number };

const imageCache = new Map<string, Promise<ImageStatus> | ImageStatus>();

function useSuspenseImage(src: string): ImageStatus {
	let cached = imageCache.get(src);
	if (cached && 'error' in cached && typeof cached.error === 'boolean') {
		return cached;
	}
	if (!cached) {
		cached = new Promise<ImageStatus>((resolve) => {
			const img = new Image();
			img.src = src;
			img.onload = () =>
				resolve({
					error: false,
					height: img.naturalHeight,
					width: img.naturalWidth,
				});
			img.onerror = () => resolve({ error: true });
		}).then((result) => {
			imageCache.set(src, result);
			return result;
		});
		imageCache.set(src, cached);
		throw cached;
	}
	throw cached;
}

// --- Sub-components ---

function BrokenImage(): JSX.Element {
	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			src="/images/image-broken.svg"
			style={{ height: 200, opacity: 0.2, width: 200 }}
			draggable="false"
			alt="Broken image"
		/>
	);
}

function LazyImage({
	altText,
	className,
	imageRef,
	src,
	width,
	height,
	maxWidth,
	onError,
}: {
	altText: string;
	className: string | null;
	height: 'inherit' | number;
	imageRef: React.RefObject<HTMLImageElement | null>;
	maxWidth: number;
	src: string;
	width: 'inherit' | number;
	onError: () => void;
}): JSX.Element {
	const status = useSuspenseImage(src);

	useEffect(() => {
		if (status.error) {
			onError();
		}
	}, [status.error, onError]);

	if (status.error) {
		return <BrokenImage />;
	}

	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			className={className || undefined}
			src={src}
			alt={altText}
			ref={imageRef}
			style={{
				height,
				maxWidth,
				width,
			}}
			onError={onError}
			draggable="false"
		/>
	);
}

// --- Image Resizer ---

function ImageResizer({
	imageRef,
	maxWidth,
	onResizeStart,
	onResizeEnd,
}: {
	imageRef: React.RefObject<HTMLImageElement | null>;
	maxWidth: number;
	onResizeStart: () => void;
	onResizeEnd: (
		width: 'inherit' | number,
		height: 'inherit' | number,
	) => void;
}) {
	const controlWrapperRef = useRef<HTMLDivElement>(null);
	const startXRef = useRef(0);
	const startYRef = useRef(0);
	const startWidthRef = useRef(0);
	const startHeightRef = useRef(0);
	const ratioRef = useRef(1);
	const directionRef = useRef<'ne' | 'nw' | 'se' | 'sw'>('se');

	const handlePointerDown = (
		event: React.PointerEvent,
		direction: 'ne' | 'nw' | 'se' | 'sw',
	) => {
		const image = imageRef.current;
		if (!image) return;

		event.preventDefault();
		directionRef.current = direction;
		startXRef.current = event.clientX;
		startYRef.current = event.clientY;

		const { width, height } = image.getBoundingClientRect();
		startWidthRef.current = width;
		startHeightRef.current = height;
		ratioRef.current = width / height;

		onResizeStart();

		const onPointerMove = (e: PointerEvent) => {
			const dir = directionRef.current;
			const diffX = e.clientX - startXRef.current;
			const diffY = e.clientY - startYRef.current;

			let newWidth = startWidthRef.current;
			let newHeight = startHeightRef.current;

			if (dir.includes('e')) newWidth += diffX;
			if (dir.includes('w')) newWidth -= diffX;
			if (dir.includes('s')) newHeight += diffY;
			if (dir.includes('n')) newHeight -= diffY;

			// Maintain aspect ratio for corner handles
			if (dir.length === 2) {
				const widthRatio = newWidth / startWidthRef.current;
				const heightRatio = newHeight / startHeightRef.current;
				const ratio = Math.max(widthRatio, heightRatio);
				newWidth = startWidthRef.current * ratio;
				newHeight = startHeightRef.current * ratio;
			}

			// Clamp
			newWidth = Math.max(100, Math.min(newWidth, maxWidth));
			newHeight = Math.max(100, newHeight);

			image.style.width = `${newWidth}px`;
			image.style.height = `${newHeight}px`;
		};

		const onPointerUp = () => {
			document.removeEventListener('pointermove', onPointerMove);
			document.removeEventListener('pointerup', onPointerUp);

			const finalWidth = imageRef.current?.width || startWidthRef.current;
			const finalHeight =
				imageRef.current?.height || startHeightRef.current;
			onResizeEnd(finalWidth, finalHeight);
		};

		document.addEventListener('pointermove', onPointerMove);
		document.addEventListener('pointerup', onPointerUp);
	};

	const handleStyle =
		'absolute bg-primary border border-background rounded-sm w-2 h-2 z-10';

	return (
		<div ref={controlWrapperRef} className="absolute inset-0">
			<div
				className={`${handleStyle} -top-1 -left-1 cursor-nw-resize`}
				onPointerDown={(e) => handlePointerDown(e, 'nw')}
			/>
			<div
				className={`${handleStyle} -top-1 -right-1 cursor-ne-resize`}
				onPointerDown={(e) => handlePointerDown(e, 'ne')}
			/>
			<div
				className={`${handleStyle} -bottom-1 -left-1 cursor-sw-resize`}
				onPointerDown={(e) => handlePointerDown(e, 'sw')}
			/>
			<div
				className={`${handleStyle} -bottom-1 -right-1 cursor-se-resize`}
				onPointerDown={(e) => handlePointerDown(e, 'se')}
			/>
		</div>
	);
}

// --- Main Component ---

export default function ImageDecorator({
	src,
	altText,
	nodeKey,
	width,
	height,
	maxWidth,
	resizable,
}: {
	altText: string;
	height: 'inherit' | number;
	maxWidth: number;
	nodeKey: NodeKey;
	resizable: boolean;
	src: string;
	width: 'inherit' | number;
}): JSX.Element {
	const imageRef = useRef<HTMLImageElement | null>(null);
	const [isSelected, setSelected, clearSelection] =
		useLexicalNodeSelection(nodeKey);
	const [isResizing, setIsResizing] = useState(false);
	const [editor] = useLexicalComposerContext();
	const activeEditorRef = useRef<
		ReturnType<typeof useLexicalComposerContext>[0] | null
	>(null);
	const [isLoadError, setIsLoadError] = useState(false);
	const isEditable = useLexicalEditable();

	const isInNodeSelection = useMemo(
		() =>
			isSelected &&
			editor.getEditorState().read(() => {
				const selection = $getSelection();
				return $isNodeSelection(selection) && selection.has(nodeKey);
			}),
		[editor, isSelected, nodeKey],
	);

	const $onEscape = useCallback(() => {
		if (isSelected && isInNodeSelection) {
			$setSelection(null);
			editor.update(() => {
				setSelected(false);
				const parentRootElement = editor.getRootElement();
				if (parentRootElement !== null) {
					parentRootElement.focus();
				}
			});
			return true;
		}
		return false;
	}, [editor, isSelected, isInNodeSelection, setSelected]);

	const onClick = useCallback(
		(payload: MouseEvent) => {
			if (isResizing) {
				return true;
			}
			if (payload.target === imageRef.current) {
				if (payload.shiftKey) {
					setSelected(!isSelected);
				} else {
					clearSelection();
					setSelected(true);
				}
				return true;
			}
			return false;
		},
		[isResizing, isSelected, setSelected, clearSelection],
	);

	const onRightClick = useCallback(
		(event: MouseEvent): void => {
			editor.getEditorState().read(() => {
				const latestSelection = $getSelection();
				const domElement = event.target as HTMLElement;
				if (
					domElement.tagName === 'IMG' &&
					$isNodeSelection(latestSelection) &&
					latestSelection.getNodes().length === 1
				) {
					editor.dispatchCommand(RIGHT_CLICK_IMAGE_COMMAND, event);
				}
			});
		},
		[editor],
	);

	useEffect(() => {
		return mergeRegister(
			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				(_, activeEditor) => {
					activeEditorRef.current = activeEditor;
					return false;
				},
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand(
				DRAGSTART_COMMAND,
				(event) => {
					if (event.target === imageRef.current) {
						event.preventDefault();
						return true;
					}
					return false;
				},
				COMMAND_PRIORITY_LOW,
			),
		);
	}, [editor]);

	useEffect(() => {
		let rootCleanup = () => {};
		return mergeRegister(
			editor.registerCommand<MouseEvent>(
				CLICK_COMMAND,
				onClick,
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand<MouseEvent>(
				RIGHT_CLICK_IMAGE_COMMAND,
				onClick,
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand(
				KEY_ESCAPE_COMMAND,
				$onEscape,
				COMMAND_PRIORITY_LOW,
			),
			editor.registerRootListener((rootElement) => {
				rootCleanup();
				rootCleanup = () => {};
				if (rootElement) {
					rootElement.addEventListener('contextmenu', onRightClick);
					rootCleanup = () =>
						rootElement.removeEventListener(
							'contextmenu',
							onRightClick,
						);
				}
			}),
			() => rootCleanup(),
		);
	}, [editor, $onEscape, onClick, onRightClick]);

	const onResizeEnd = (
		nextWidth: 'inherit' | number,
		nextHeight: 'inherit' | number,
	) => {
		setTimeout(() => {
			setIsResizing(false);
		}, 200);

		editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if ($isImageNode(node)) {
				node.setWidthAndHeight(nextWidth, nextHeight);
			}
		});
	};

	const onResizeStart = () => {
		setIsResizing(true);
	};

	const draggable = isInNodeSelection && !isResizing;
	const isFocused = (isSelected || isResizing) && isEditable;

	return (
		<Suspense fallback={null}>
			<div draggable={draggable} className="relative inline-block">
				{isLoadError ? (
					<BrokenImage />
				) : (
					<LazyImage
						className={
							isFocused
								? `focused ${isInNodeSelection ? 'draggable' : ''}`
								: null
						}
						src={src}
						altText={altText}
						imageRef={imageRef}
						width={width}
						height={height}
						maxWidth={maxWidth}
						onError={() => setIsLoadError(true)}
					/>
				)}
				{resizable && isInNodeSelection && isFocused && (
					<ImageResizer
						imageRef={imageRef}
						maxWidth={maxWidth}
						onResizeStart={onResizeStart}
						onResizeEnd={onResizeEnd}
					/>
				)}
			</div>
		</Suspense>
	);
}
