export const editorChooserVariants = ['control', 'testA', 'testB', 'testC'] as const;
export type EditorChooserVariant = (typeof editorChooserVariants)[number];
