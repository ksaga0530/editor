require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    let editor;
    let languageSelect = document.getElementById('languageSelect');
    let runButton = document.getElementById('runButton');
    let outputArea = document.getElementById('output');

    // Monaco Editorの初期化
    editor = monaco.editor.create(document.getElementById('editor'), {
        value: '# Hello, Python!\nprint("Hello, world!")',
        language: 'python',
        theme: 'vs-dark'
    });

    // 言語が変更されたら、エディタの言語モードも変更
    languageSelect.addEventListener('change', (e) => {
        const lang = e.target.value;
        monaco.editor.setModelLanguage(editor.getModel(), lang);
        // デフォルトのコードを言語ごとに切り替える
        if (lang === 'python') {
            editor.setValue('# Hello, Python!\nprint("Hello, world!")');
        } else if (lang === 'javascript') {
            editor.setValue('// Hello, JavaScript!\nconsole.log("Hello, world!");');
        }
    });

    // 実行ボタンがクリックされたときの処理
    runButton.addEventListener('click', async () => {
        const code = editor.getValue();
        const language = languageSelect.value;
        outputArea.textContent = '実行中...';

        try {
            const response = await fetch('/api/run-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: code, language: language }),
            });
            const result = await response.json();

            if (response.ok) {
                // 成功した場合は標準出力とエラーをまとめて表示
                outputArea.textContent = `出力:\n${result.output}\n\nエラー:\n${result.error}`;
            } else {
                // 失敗した場合はエラーメッセージを表示
                outputArea.textContent = `エラー: ${result.error}`;
            }
        } catch (error) {
            outputArea.textContent = `リクエストエラー: ${error.message}`;
        }
    });
});
