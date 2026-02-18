'use client';

import type { JSX } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $wrapNodeInElement, mergeRegister } from '@lexical/utils';
import {
	$createParagraphNode,
	$createRangeSelection,
	$getSelection,
	$insertNodes,
	$isNodeSelection,
	$isRootOrShadowRoot,
	$setSelection,
	COMMAND_PRIORITY_EDITOR,
	COMMAND_PRIORITY_HIGH,
	COMMAND_PRIORITY_LOW,
	createCommand,
	DRAGOVER_COMMAND,
	DRAGSTART_COMMAND,
	DROP_COMMAND,
	isHTMLElement,
	LexicalCommand,
	LexicalEditor,
} from 'lexical';
import {
	ChangeEvent,
	DragEvent as ReactDragEvent,
	FormEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';

import {
	$createImageNode,
	$isImageNode,
	ImageNode,
	ImagePayload,
} from './nodes/image-node';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type InsertImagePayload = Readonly<ImagePayload>;

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
	createCommand('INSERT_IMAGE_COMMAND');

export const OPEN_INSERT_IMAGE_DIALOG_COMMAND: LexicalCommand<void> =
	createCommand('OPEN_INSERT_IMAGE_DIALOG');

const TRANSPARENT_IMAGE =
	'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

let dragImage: HTMLImageElement | null = null;
function getDragImage(): HTMLImageElement {
	if (!dragImage) {
		dragImage = document.createElement('img');
		dragImage.src = TRANSPARENT_IMAGE;
	}
	return dragImage;
}

interface ImagePluginProps {
	onUploadImage?: (file: File) => Promise<string>;
}

export default function ImagePlugin({
	onUploadImage,
}: ImagePluginProps = {}): JSX.Element | null {
	const [editor] = useLexicalComposerContext();
	const [showDialog, setShowDialog] = useState(false);

	useEffect(() => {
		if (!editor.hasNodes([ImageNode])) {
			throw new Error('ImagePlugin: ImageNode not registered on editor');
		}

		return mergeRegister(
			editor.registerCommand<InsertImagePayload>(
				INSERT_IMAGE_COMMAND,
				(payload) => {
					const imageNode = $createImageNode(payload);
					$insertNodes([imageNode]);
					if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
						$wrapNodeInElement(
							imageNode,
							$createParagraphNode,
						).selectEnd();
					}
					return true;
				},
				COMMAND_PRIORITY_EDITOR,
			),
			editor.registerCommand(
				OPEN_INSERT_IMAGE_DIALOG_COMMAND,
				() => {
					setShowDialog(true);
					return true;
				},
				COMMAND_PRIORITY_EDITOR,
			),
			editor.registerCommand<DragEvent>(
				DRAGSTART_COMMAND,
				(event) => $onDragStart(event),
				COMMAND_PRIORITY_HIGH,
			),
			editor.registerCommand<DragEvent>(
				DRAGOVER_COMMAND,
				(event) => $onDragover(event),
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand<DragEvent>(
				DROP_COMMAND,
				(event) => $onDrop(event, editor),
				COMMAND_PRIORITY_HIGH,
			),
		);
	}, [editor]);

	return (
		<InsertImageDialog
			editor={editor}
			open={showDialog}
			onOpenChange={setShowDialog}
			onUploadImage={onUploadImage}
		/>
	);
}

function $onDragStart(event: DragEvent): boolean {
	const node = $getImageNodeInSelection();
	if (!node) {
		return false;
	}
	const dataTransfer = event.dataTransfer;
	if (!dataTransfer) {
		return false;
	}
	dataTransfer.setData('text/plain', '_');
	dataTransfer.setDragImage(getDragImage(), 0, 0);
	dataTransfer.setData(
		'application/x-lexical-drag',
		JSON.stringify({
			data: {
				altText: node.__altText,
				height: node.__height,
				key: node.getKey(),
				maxWidth: node.__maxWidth,
				src: node.__src,
				width: node.__width,
			},
			type: 'image',
		}),
	);
	return true;
}

function $onDragover(event: DragEvent): boolean {
	const node = $getImageNodeInSelection();
	if (!node) {
		return false;
	}
	if (!canDropImage(event)) {
		event.preventDefault();
	}
	return false;
}

function $onDrop(event: DragEvent, editor: LexicalEditor): boolean {
	const node = $getImageNodeInSelection();
	if (!node) {
		return false;
	}
	const data = getDragImageData(event);
	if (!data) {
		return false;
	}
	event.preventDefault();
	if (canDropImage(event)) {
		const range = getDragSelection(event);
		node.remove();
		const rangeSelection = $createRangeSelection();
		if (range !== null && range !== undefined) {
			rangeSelection.applyDOMRange(range);
		}
		$setSelection(rangeSelection);
		editor.dispatchCommand(INSERT_IMAGE_COMMAND, data);
	}
	return true;
}

function $getImageNodeInSelection(): ImageNode | null {
	const selection = $getSelection();
	if (!$isNodeSelection(selection)) {
		return null;
	}
	const nodes = selection.getNodes();
	const node = nodes[0];
	return $isImageNode(node) ? node : null;
}

function getDragImageData(event: DragEvent): InsertImagePayload | null {
	const dragData = event.dataTransfer?.getData('application/x-lexical-drag');
	if (!dragData) {
		return null;
	}
	const { type, data } = JSON.parse(dragData);
	if (type !== 'image') {
		return null;
	}
	return data;
}

declare global {
	interface DragEvent {
		rangeOffset?: number;
		rangeParent?: Node;
	}
}

function canDropImage(event: DragEvent): boolean {
	const target = event.target;
	return !!(
		isHTMLElement(target) &&
		!target.closest('code, span.editor-image') &&
		isHTMLElement(target.parentElement) &&
		target.parentElement.closest('div.ContentEditable__root')
	);
}

function getDragSelection(event: DragEvent): Range | null | undefined {
	let range;
	const target = event.target;
	const targetDocument =
		target instanceof Node ? (target.ownerDocument ?? document) : document;
	if (typeof targetDocument.caretPositionFromPoint === 'function') {
		const pos = targetDocument.caretPositionFromPoint(
			event.clientX,
			event.clientY,
		);
		if (pos) {
			range = targetDocument.createRange();
			range.setStart(pos.offsetNode, pos.offset);
			range.collapse(true);
		}
	} else if (event.rangeParent) {
		const domSelection = targetDocument.getSelection();
		if (domSelection !== null) {
			domSelection.collapse(event.rangeParent, event.rangeOffset || 0);
			range = domSelection.getRangeAt(0);
		}
	} else {
		throw Error('Cannot get the selection when dragging');
	}
	return range;
}

interface InsertImageDialogProps {
	editor: LexicalEditor;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUploadImage?: (file: File) => Promise<string>;
}

export function InsertImageDialog({
	editor,
	open,
	onOpenChange,
	onUploadImage,
}: InsertImageDialogProps) {
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [altText, setAltText] = useState('');
	const [isUploading, setIsUploading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const reset = useCallback(() => {
		setFile(null);
		setPreview(null);
		setAltText('');
		setIsUploading(false);
		setIsDragging(false);
	}, []);

	function handleOpenChange(next: boolean) {
		if (!next) reset();
		onOpenChange(next);
	}

	function handleFile(f: File) {
		setFile(f);
		setPreview(URL.createObjectURL(f));
	}

	function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
		const f = e.target.files?.[0];
		if (f) handleFile(f);
	}

	function handleDrop(e: ReactDragEvent) {
		e.preventDefault();
		setIsDragging(false);
		const f = e.dataTransfer.files[0];
		if (f?.type.startsWith('image/')) handleFile(f);
	}

	function handleDragOver(e: ReactDragEvent) {
		e.preventDefault();
		setIsDragging(true);
	}

	function handleDragLeave(e: ReactDragEvent) {
		e.preventDefault();
		setIsDragging(false);
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (!file || !onUploadImage) return;

		setIsUploading(true);
		try {
			const src = await onUploadImage(file);
			editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
				src,
				altText: altText.trim(),
			});
			handleOpenChange(false);
		} finally {
			setIsUploading(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Upload Image</DialogTitle>
					<DialogDescription>
						Drag and drop an image or click to browse.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="grid gap-4">
					<input
						ref={inputRef}
						type="file"
						accept="image/*"
						onChange={handleFileChange}
						className="hidden"
					/>
					{preview ? (
						<button
							type="button"
							onClick={() => inputRef.current?.click()}
							className="relative overflow-hidden rounded-md border"
						>
							<img
								src={preview}
								alt="Preview"
								className="max-h-48 w-full object-contain"
							/>
						</button>
					) : (
						<button
							type="button"
							onClick={() => inputRef.current?.click()}
							onDrop={handleDrop}
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							className={`flex h-32 flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed text-sm transition-colors ${
								isDragging
									? 'border-primary bg-primary/5'
									: 'border-muted-foreground/25 hover:border-muted-foreground/50'
							}`}
						>
							<span className="text-muted-foreground">
								Drop an image here, or click to browse
							</span>
						</button>
					)}
					<Input
						placeholder="Alt text (optional)"
						value={altText}
						onChange={(e) => setAltText(e.target.value)}
					/>
					<DialogFooter>
						<Button
							type="submit"
							disabled={!file || isUploading}
						>
							{isUploading ? 'Uploading...' : 'Upload'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
