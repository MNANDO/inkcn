import {
	AnyLexicalExtension,
	defineExtension,
	EditorThemeClasses,
	Klass,
	LexicalNode,
} from 'lexical';
import { baseNodes } from './base-nodes';
import {
	HorizontalRuleExtension,
	TabIndentationExtension,
} from '@lexical/extension';
import { CheckListExtension, ListExtension } from '@lexical/list';
import { editorTheme } from './default-theme';

export interface EditorOptions {
	name?: string;
	theme?: EditorThemeClasses;
	nodes?: Array<Klass<LexicalNode>>;
	extensions?: AnyLexicalExtension[];
}

export class Editor {
	private _lexicalExtension: AnyLexicalExtension;

	constructor(options: EditorOptions) {
		const {
			name = 'editor',
			nodes = [],
			extensions = [],
			theme = {},
		} = options;
		this._lexicalExtension = defineExtension({
			name,
			nodes: [...baseNodes, ...nodes],
			dependencies: [
				HorizontalRuleExtension,
				ListExtension,
				CheckListExtension,
				TabIndentationExtension,
				...extensions,
			],
			theme: { ...editorTheme, ...theme },
		});
	}

	get lexicalExtension() {
		return this._lexicalExtension;
	}
}
