'use client';

import { useCreateEditor } from '@/hooks/use-create-editor';
import { $createListItemNode, $createListNode } from '@lexical/list';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { EditorView } from '@/components/editor/editor-view';
import {
	createImageExtension,
	OPEN_INSERT_IMAGE_DIALOG_COMMAND,
} from './editor/extensions/image-extension';
import { ImageNode } from './editor/nodes/image-node';
import { BlockPickerOption } from '@/lib/BlockPickerOption';
import { Image } from 'lucide-react';

function prepopulatedRichText() {
	const root = $getRoot();
	if (root.getFirstChild() === null) {
		const heading = $createHeadingNode('h1');
		heading.append($createTextNode('Inkcn'));
		root.append(heading);

		const quote = $createQuoteNode();
		quote.append(
			$createTextNode(
				`A collection of beautifully crafted, copy-paste ready editor components built on top of shadcn/ui. Install any component directly into your project with a single command.`,
			),
		);
		root.append(quote);

		const paragraph = $createParagraphNode();
		paragraph.append(
			$createTextNode(
				'This is a live demo of the rich text editor component from the inkcn registry. It is built with Lexical and styled with shadcn/ui and Tailwind CSS, so it fits right into your existing project.',
			),
		);
		root.append(paragraph);

		const paragraph2 = $createParagraphNode();
		paragraph2.append(
			$createTextNode(
				`To get started, install this editor into your project:`,
			),
		);
		root.append(paragraph2);

		const list = $createListNode('bullet');
		list.append(
			$createListItemNode().append(
				$createTextNode(`Run `),
				$createTextNode(`npx shadcn add <url>`).toggleFormat('code'),
				$createTextNode(` to install any component from the registry.`),
			),
			$createListItemNode().append(
				$createTextNode(`Components are fully typed with TypeScript.`),
			),
			$createListItemNode().append(
				$createTextNode(
					`Styled with Tailwind CSS v4 and built for React 19.`,
				),
			),
			$createListItemNode().append(
				$createTextNode(
					`Every component is open source and yours to customize.`,
				),
			),
		);
		root.append(list);

		const paragraph3 = $createParagraphNode();
		paragraph3.append(
			$createTextNode(
				`Try editing this text to see the editor in action. Hover over this editor and add or drag blocks on the left hand side.`,
			),
		);
		root.append(paragraph3);
	}
}

export default function EditorDemo() {
	const imageExtension = createImageExtension(async (file) => {
		return URL.createObjectURL(file);
	});

	const editor = useCreateEditor({
		name: '@inkcn/editor',
		initialEditorState: prepopulatedRichText,
		extensions: [imageExtension],
		nodes: [ImageNode],
		blockPickerOptions: [
			new BlockPickerOption({
				id: 'image',
				title: 'Image',
				// eslint-disable-next-line jsx-a11y/alt-text
				icon: <Image />,
				keywords: ['image', 'img', 'picture', 'photo'],
				category: 'advanced',
				insert: ({ editor }) => {
					editor.dispatchCommand(
						OPEN_INSERT_IMAGE_DIALOG_COMMAND,
						undefined,
					);
				},
			}),
		],
	});

	return <EditorView editor={editor} />;
}
