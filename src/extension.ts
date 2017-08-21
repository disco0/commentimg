'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// this method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {

    // console.log('Commentimg is activated');

    // create a decorator type
    const decor = vscode.window.createTextEditorDecorationType({
        borderWidth: '1px',
        borderStyle: 'solid',
        overviewRulerColor: 'blue',
        overviewRulerLane: vscode.OverviewRulerLane.Right,
        light: {
            // this color will be used in light color themes
            borderColor: 'darkblue'
        },
        dark: {
            // this color will be used in dark color themes
            borderColor: 'lightblue'
        }
    });

    // ====> Handle the active editor
    let activeEditor = vscode.window.activeTextEditor;
    if(activeEditor) {
        triggerUpdateDecorations();
    }
    vscode.window.onDidChangeActiveTextEditor(editor => {
        activeEditor = editor;
        if(editor) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);
    vscode.workspace.onDidChangeTextDocument(event => {
        if(activeEditor && event.document === activeEditor.document) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);
    // <====

    var timeout = null;
    function triggerUpdateDecorations() {
        if(timeout) { clearTimeout(timeout); }
        timeout = setTimeout(updateDecorations, 500);
    }

    function updateDecorations() {
        if(!activeEditor) { return; }
        const regEx = /<cmg "(([a-zA-Z0-9_\\\/]+)\.(png|jpg))">/g;
        const text = activeEditor.document.getText();
        let cimgs: vscode.DecorationOptions[] = [];
        let match: RegExpExecArray;
        while(match = regEx.exec(text)) {
            const img: string = match[1];
            const src = path.join(path.normalize(vscode.workspace.rootPath), img);

            if(fs.existsSync(src)) {
                let s = activeEditor.document.positionAt(match.index);
                let e = activeEditor.document.positionAt(match.index + match[0].length);
                let decoration = { range: new vscode.Range(s, e), hoverMessage: `![](file:///${src})` };
                cimgs.push(decoration);
            }
        }
        activeEditor.setDecorations(decor, cimgs);
    }
}

// this method is called when the extension is deactivated
export function deactivate() {
}
