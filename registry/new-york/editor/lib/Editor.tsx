import {
	AnyLexicalExtension,
	configExtension,
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
import { ReactExtension } from '@lexical/react/ReactExtension';
import type { BlockPickerOption } from './BlockPickerOption';
import { baseBlockPickerOptions } from './base-block-picker-options';
import BlockPickerPlugin from '../editor-block-picker-plugin';

export interface EditorOptions {
	name?: string;
	theme?: EditorThemeClasses;
	nodes?: Array<Klass<LexicalNode>>;
	extensions?: AnyLexicalExtension[];
	blockPickerOptions?: BlockPickerOption[];
}

export class Editor {
	private _lexicalExtension: AnyLexicalExtension;
	private _blockPickerOptions: BlockPickerOption[];

	constructor(options: EditorOptions) {
		const {
			name = 'editor',
			nodes = [],
			extensions = [],
			theme = {},
			blockPickerOptions = [],
		} = options;
		this._blockPickerOptions = [
			...baseBlockPickerOptions,
			...blockPickerOptions,
		];
		this._lexicalExtension = defineExtension({
			name,
			nodes: [...baseNodes, ...nodes],
			dependencies: [
				HorizontalRuleExtension,
				ListExtension,
				CheckListExtension,
				TabIndentationExtension,
				configExtension(ReactExtension, {
					contentEditable: null,
					decorators: [
						<BlockPickerPlugin
							key="block-picker"
							options={[
								...baseBlockPickerOptions,
								...blockPickerOptions,
							]}
						/>,
					],
				}),
				...extensions,
			],
			theme: { ...editorTheme, ...theme },
		});
	}

	get lexicalExtension() {
		return this._lexicalExtension;
	}

	get blockPickerOptions() {
		return this._blockPickerOptions;
	}
}
