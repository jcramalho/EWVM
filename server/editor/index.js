import * as monaco from 'monaco-editor';
import { manual } from '../public/javascripts/manual';

/**
 * Gets the ids from the source code.
 * @param {editor.ITextModel} model The source model.
 * @param {Position} position The current cursor position.
 * @returns The object containing the range of the token and the content of the id.
 */
function getIds(model, position = { lineNumber: -1, column: -1 }) {
    const monarchTokens = monaco.editor.tokenize(model.getValue(), 'EWVM');
    const ids = monarchTokens.flatMap(function (lineTokens, lineIndex) {
        var lineContent = model.getLineContent(lineIndex + 1);

        return lineTokens.flatMap(function (token, tokenIndex, tokensArray) {
            let res = null;

            if (token.type === 'identifier.EWVM') {
                var nextToken = tokensArray[tokenIndex + 1];
                var tokenEnd = nextToken ? nextToken.offset : lineContent.length;

                if (!(position.lineNumber == lineIndex + 1 && token.offset + 1 <= position.column && position.column <= tokenEnd + 1)) {
                    res = {
                        content: lineContent.substring(token.offset, tokenEnd),
                        range: {
                            startLineNumber: lineIndex + 1,
                            startColumn: token.offset + 1,
                            endLineNumber: lineIndex + 1,
                            endColumn: tokenEnd + 1,
                        },
                    };
                }
            }

            return res;
        });
    })
        .filter(token => token);

    return ids;
}

// Get docs (used for the highlight and hover)
function getDocs(arr) {
    let objects = [];

    arr.forEach(item => {
        if (Array.isArray(item)) {
            objects = objects.concat(getDocs(item));
        } else if (typeof item === 'object' && item !== null) {
            objects.push(item);
        }
    });

    return objects;
}

const docs = getDocs(manual).reduce((ac, cur) => { return { ...ac, ...cur } });
const insts = Object.keys(docs);
let instsRegex = insts.sort((a, b) => a.length - b.length).reverse().join('|');
instsRegex = instsRegex + '|' + instsRegex.toLowerCase();

monaco.languages.register({ id: 'EWVM' });

// Syntax Highlight
monaco.languages.setMonarchTokensProvider('EWVM', {
    tokenizer: {
        root: [
            [/[+\-]?\d+/, 'number'],
            [/\".*?\"/, 'string'],
            [new RegExp(instsRegex, 'i'), 'keyword'],
            [/\/\/.*/, 'comment'],
            [/[A-Za-z0-9]+:?/, 'identifier'],
        ]
    }
});

// Instruction completion
monaco.languages.registerCompletionItemProvider('EWVM', {
    provideCompletionItems: function (model, position) {
        // IDs
        const ids = getIds(model, position);
        const identifiers = ids.map(token => token.content.endsWith(':') ? token.content.slice(0, -1) : token.content);

        const uniqueIdentifiers = [...new Set(identifiers)];

        const identifierItems = uniqueIdentifiers.map(function (identifier) {
            return {
                label: identifier,
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: identifier,
                range: {
                    startLineNumber: position.lineNumber,
                    startColumn: position.column - identifier.length,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column,
                },
            };
        });

        // Keywords
        const keywordItems = insts.map(function (keyword) {
            return {
                label: keyword,
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: keyword,
                range: {
                    startLineNumber: position.lineNumber,
                    startColumn: position.column - keyword.length,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column,
                },
            };
        });

        // Completion
        const completionItems = [...identifierItems, ...keywordItems];

        return {
            suggestions: completionItems,
        };
    }
});

// Label error (if not exists)
monaco.languages.registerCodeActionProvider('EWVM', {
    provideCodeActions: function (model, range) {
        const declaredIdentifiers = new Set();
        const usedIdentifiers = new Set();
        let ids = getIds(model);

        // Throws the ids into declare or use sets
        ids.forEach(id => {
            if (id.content.endsWith(':')) {
                const declaredIdentifier = id.content.substring(0, id.content.length - 1);
                declaredIdentifiers.add(declaredIdentifier);
            } else {
                usedIdentifiers.add(id.content);
            }
        });

        // Remove the : in the declaration ids
        ids = ids.map(id => id.content.endsWith(':') ? { ...id, content: id.content.substring(0, id.content.length - 1) } : id);

        // Create the diagnostics (markers)
        const markers = [];

        ids.forEach(id => {
            if (declaredIdentifiers.has(id.content)) {
                if (!usedIdentifiers.has(id.content)) {
                    markers.push({
                        severity: monaco.MarkerSeverity.Warning,
                        ...id.range,
                        message: `Unused identifier: ${id.content}`,
                    });
                }
            } else {
                markers.push({
                    severity: monaco.MarkerSeverity.Error,
                    ...id.range,
                    message: `Unknown identifier: ${id.content}`,
                });
            }
        });

        monaco.editor.setModelMarkers(model, 'EWVM', markers);

        return { actions: [], dispose: () => { } };
    }
});

// Documentation
monaco.languages.registerHoverProvider('EWVM', {
    provideHover: (model, position) => {
        let word = model.getWordAtPosition(position);
        word = word.word.toUpperCase();

        if (word in docs) {
            let result = docs[word];
            return { contents: [{ value: result }] };
        }
    }
});

// Create the editor
const editor = monaco.editor.create(document.getElementById('monaco-editor-container'), {
    value: (() => document.getElementById('code').value)(),
    automaticLayout: true,
    language: 'EWVM',
    minimap: { enabled: false },
});
const highlighter = editor.createDecorationsCollection();

// Update for form submit
editor.getModel().onDidChangeContent((e) => {
    let src = editor.getValue();
    document.getElementById('code').value = src;
    document.getElementById('input_code').value = src;
});

// Debug highlight
export function highlightLine(line) {
    highlighter.clear();

    if (line != 0) {
        highlighter.append([
            {
                range: { startLineNumber: line, endLineNumber: line, startColumn: 1, endColumn: 1 },
                options: {
                    isWholeLine: true,
                    inlineClassName: 'highlight-debug',
                }
            }
        ]);
    }
}
