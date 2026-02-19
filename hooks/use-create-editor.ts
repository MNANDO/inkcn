'use client';

import {
	AnyLexicalExtension,
	EditorThemeClasses,
	InitialEditorStateType,
	Klass,
	LexicalNode,
} from 'lexical';
import { useState } from 'react';
import { Editor } from '@/lib/Editor';
import { BlockPickerOption } from '@/lib/BlockPickerOption';

export interface UseCreateEditorOptions {
	name?: string;
	theme?: EditorThemeClasses;
	nodes?: Array<Klass<LexicalNode>>;
	extensions?: AnyLexicalExtension[];
	initialEditorState?: InitialEditorStateType;
	blockPickerOptions?: BlockPickerOption[];
}

export const useCreateEditor = (options: UseCreateEditorOptions = {}) => {
	const [editor] = useState(() => new Editor(options));

	return editor;
};
