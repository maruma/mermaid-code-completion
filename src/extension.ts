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
          "subgraph",
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
          "-->",
          "-->||",
          "---",
          "-.->",
        ];

        const items = mermaidSnippets.map((snippet) => {
          const completionItem = new vscode.CompletionItem(
            snippet,
            vscode.CompletionItemKind.Snippet
          );

          // カーソル位置の調整
          if (snippet === "-->||") {
            completionItem.insertText = new vscode.SnippetString("-->|$1|");
          } else if (snippet === "subgraph") {
            completionItem.insertText = new vscode.SnippetString("subgraph $1");
          } else {
            completionItem.insertText = snippet;
          }

          // ハイフン等補完時のトリガー文字を含む範囲指定
          completionItem.range = new vscode.Range(
            position.translate(0, -1),
            position // カーソル位置
          );

          return completionItem;
        });

        return items;
      },
    },
    "`",
    "-"
  );

  context.subscriptions.push(provider);
}

// 拡張機能が無効化されたときに実行される処理
export function deactivate() {}
