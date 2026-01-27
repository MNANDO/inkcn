'use client';

import { EditorThemeClasses } from 'lexical';
import { useState } from 'react';
import { Editor } from '../lib/Editor';

export interface UseCreateEditorOptions {
	name?: string;
	theme?: EditorThemeClasses;
}

export const useCreateEditor = (options: UseCreateEditorOptions = {}) => {
	const [editor] = useState(() => new Editor(options));

	return editor;
};
