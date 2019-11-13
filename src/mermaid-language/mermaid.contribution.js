/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import { registerLanguage } from 'monaco-editor/dev/vs/basic-languages/_.contribution.js';
registerLanguage({
    id: 'mermaid',
    extensions: ['.mmd'],
    aliases: ['mermaid', 'MERMAID'],
    loader: function () { return import('./mermaid.js'); }
});
