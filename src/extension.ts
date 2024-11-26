import * as vscode from 'vscode';

let disposable: vscode.Disposable | undefined;

export function activate(context: vscode.ExtensionContext) {
  // 注册命令
  disposable = vscode.commands.registerCommand('commentForTs.generateComment', async () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      const text = editor.document.getText(selection);
      const comment = generateComment(text);
      editor.edit((editBuilder) => {
        editBuilder.replace(selection, comment);
      });
    }
  });
  //   将命令注册添加到context
  context.subscriptions.push(disposable);
}

function generateComment(interfaceOrTypeText: string): string {
  // 解析interface 或type文本，提取属性和类型
  // 根据提取的信息生成注释
  const lines = interfaceOrTypeText.split('\n');

  let commentsLines = lines.map((line) => {
    // 导出的第一句话 不需要翻译注释 直接返回注释前缀
    if (line.includes('export')) {
      return '/**\n * @description:';
    } else if (line.trim().startsWith('//')) {
      // 保留原有注释
      return line;
    } else if (line.includes(':')) {
      let [property, type] = line.split(':');
      // 可选参数
      return ` * @param { ${type.trim()} } ${property.trim().replace('?', '')}`;
    } else {
      return ` * ${line.trim()}`;
    }
  });

  const comments = `${commentsLines.join('\n')}\n */\n${lines.join('\n')}`;

  return comments;
}

export function deactivate() {
  // 清理插件资源
  if (disposable) {
    // 取消注册命令
    disposable.dispose();
  }
}
