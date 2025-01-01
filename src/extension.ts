import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const provider = vscode.languages.registerCompletionItemProvider(
    { scheme: "file", language: "markdown" },
    {
      provideCompletionItems(document, position, token, context) {
        const textBeforeCursor = document.getText(
          new vscode.Range(new vscode.Position(0, 0), position)
        );
        console.log("カーソル位置の前までの文字:", textBeforeCursor);

        const codeBlockStart = textBeforeCursor.lastIndexOf("```mermaid");
        const codeBlockEnd = textBeforeCursor.lastIndexOf("```");
        console.log(
          "codeBlock start:",
          codeBlockStart,
          "codeBlock end:",
          codeBlockEnd
        );

        if (codeBlockStart === -1 || codeBlockEnd > codeBlockStart) {
          console.log("Mermaidのブロックでない");
          return undefined;
        }

        // Mermaid用のサンプル補完
        const mermaidSnippets = [
          // フローチャート
          "graph TD",
          "graph LR",
          "graph BT",
          "graph RL",
          // シーケンス図
          "sequenceDiagram",
          // ガントチャート
          "gantt",
          // クラス図
          "classDiagram",
          // 状態遷移図
          "stateDiagram",
          "stateDiagram-v2",
          // ER図
          "erDiagram",
          // パイチャート
          "pie",
          // ユーザージャーニーマップ
          "journey",
          // よく使うスニペット
          "A --> B",
          "A -->|text| B",
          "A --> C",
          "A --- B",
        ];

        const items = mermaidSnippets.map(
          (snippet) =>
            new vscode.CompletionItem(
              snippet,
              vscode.CompletionItemKind.Snippet
            )
        );

        return items;
      },
    },
    "`" // トリガー文字（`が入力されたとき）
  );

  context.subscriptions.push(provider);
}

// 拡張機能が無効化されたときに実行される処理
export function deactivate() {}
