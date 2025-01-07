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

        // "%% 要素" セクションを解析
        const lines = textBeforeCursor.split("\n");
        const elementSectionStart = lines.findIndex((line) =>
          line.trim().startsWith("%% 要素")
        );
        const elementSectionEnd = lines.findIndex(
          (line, index) => index > elementSectionStart && line.trim() === ""
        );

        const definedElements =
          elementSectionStart !== -1 && elementSectionEnd !== -1
            ? lines
                .slice(elementSectionStart + 1, elementSectionEnd)
                .map((line) => line.trim())
                .filter((line) => line.length > 0) // 空行を除外
            : [];

        console.log("定義された要素:", definedElements);

        // Mermaid記法の左右の単語を抽出
        const connectionPattern = /(\w+)\s*(-->|-->\|\||---|-\.->)\s*(\w+)/;
        const dynamicElements = lines
          .map((line) => connectionPattern.exec(line))
          .filter((match) => match !== null)
          .flatMap((match) => [match[1], match[3]])
          .filter((element) => !definedElements.includes(element));

        console.log("動的に追加された要素:", dynamicElements);

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
          // フローチャート用
          "-->",
          "-->||",
          "---",
          "-.->",
          // シーケンス図用
          "->",
          "->>",
        ];

        const items = [
          ...mermaidSnippets,
          ...definedElements,
          ...dynamicElements,
        ].map((snippet) => {
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
