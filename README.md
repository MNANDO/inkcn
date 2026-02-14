# inkcn

A Notion-style rich text editor built with [Lexical](https://lexical.dev), distributed as a [shadcn/ui](https://ui.shadcn.com) registry component.

## Installation

```bash
npx shadcn add https://inkcn.vercel.app/r/editor.json
```

This installs the editor components into `components/editor/` along with the required shadcn/ui dependencies (`button`, `toggle-group`, `input`, `dropdown-menu`).

## Usage

```tsx
"use client";

import { useCreateEditor } from "@/components/editor/hooks/use-create-editor";
import { EditorView } from "@/components/editor/editor-view";

export default function MyEditor() {
  const editor = useCreateEditor();

  return <EditorView editor={editor} />;
}
```

### `useCreateEditor` options

| Option | Type | Description |
| --- | --- | --- |
| `name` | `string` | Editor instance name |
| `theme` | `EditorThemeClasses` | Custom Lexical theme |
| `nodes` | `Klass<LexicalNode>[]` | Additional Lexical nodes |
| `extensions` | `AnyLexicalExtension[]` | Lexical extensions |
| `initialEditorState` | `InitialEditorStateType` | Initial content |

### `EditorView` props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `editor` | `Editor` | required | Editor instance from `useCreateEditor` |
| `className` | `string` | — | Additional CSS classes |
| `placeholder` | `string` | `"Enter some text or type '/' for commands"` | Placeholder text |
| `showBlockHandle` | `boolean` | `true` | Show the block drag handle |
| `showToolbar` | `boolean` | `true` | Show the floating toolbar |
| `readOnly` | `boolean` | `false` | Disable editing and hide toolbar/block handle |
| `onChange` | `(editorState, editor, tags) => void` | — | Change callback |
| `children` | `ReactNode` | — | Additional Lexical plugins |
