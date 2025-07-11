import React, { useState, useRef, useEffect } from 'react';
import { Play, Save, FileText, Clock, Cpu, Zap, ChevronDown } from 'lucide-react';

// 主要言語のオプション
const languageOptions = [
  { id: 63, name: "JavaScript", label: "JavaScript", value: "javascript" },
  { id: 71, name: "Python", label: "Python", value: "python" },
  { id: 62, name: "Java", label: "Java", value: "java" },
  { id: 76, name: "C++", label: "C++", value: "cpp" },
  { id: 50, name: "C", label: "C", value: "c" },
];

// サンプルコード
const defaultCode = {
  javascript: `// JavaScript サンプル
console.log("Hello, World!");

function add(a, b) {
    return a + b;
}

console.log("2 + 3 =", add(2, 3));`,

  python: `# Python サンプル
print("Hello, World!")

def add(a, b):
    return a + b

print(f"2 + 3 = {add(2, 3)}")`,

  java: `// Java サンプル
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("2 + 3 = " + add(2, 3));
    }
    
    public static int add(int a, int b) {
        return a + b;
    }
}`,

  cpp: `// C++ サンプル
#include <iostream>
using namespace std;

int add(int a, int b) {
    return a + b;
}

int main() {
    cout << "Hello, World!" << endl;
    cout << "2 + 3 = " << add(2, 3) << endl;
    return 0;
}`,

  c: `// C サンプル
#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

int main() {
    printf("Hello, World!\\n");
    printf("2 + 3 = %d\\n", add(2, 3));
    return 0;
}`
};

const CodeEditor = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(languageOptions[0]);
  const [code, setCode] = useState(defaultCode.javascript);
  const [customInput, setCustomInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [executionDetails, setExecutionDetails] = useState(null);
  const [monacoEditor, setMonacoEditor] = useState(null);
  
  const editorRef = useRef(null);

  // Monaco Editorの初期化
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs/loader.min.js';
    script.onload = initializeMonaco;
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const initializeMonaco = () => {
    window.require.config({
      paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs' }
    });

    window.require(['vs/editor/editor.main'], () => {
      if (editorRef.current) {
        const editor = window.monaco.editor.create(editorRef.current, {
          value: code,
          language: selectedLanguage.value,
          theme: 'vs-dark',
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
        });

        editor.onDidChangeModelContent(() => {
          setCode(editor.getValue());
        });

        setMonacoEditor(editor);
      }
    });
  };

  // 言語変更時の処理
  useEffect(() => {
    if (monacoEditor) {
      const newCode = defaultCode[selectedLanguage.value] || '';
      setCode(newCode);
      monacoEditor.setValue(newCode);
      window.monaco.editor.setModelLanguage(monacoEditor.getModel(), selectedLanguage.value);
    }
  }, [selectedLanguage, monacoEditor]);

  // 言語選択
  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  // コード実行（シミュレーション）
  const executeCode = async () => {
    setIsLoading(true);
    setOutput('実行中...');
    setExecutionDetails(null);

    try {
      // 実際のJudge0 APIの代わりにシミュレーション
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let result = '';
      const startTime = Date.now();
      
      if (selectedLanguage.value === 'javascript') {
        // JavaScriptは実際に実行
        try {
          const logs = [];
          const originalLog = console.log;
          console.log = (...args) => {
            logs.push(args.join(' '));
          };
          
          // 入力がある場合は処理
          if (customInput.trim()) {
            // 簡易的な入力処理
            window.input = customInput.split('\n');
            window.inputIndex = 0;
            window.prompt = () => {
              if (window.inputIndex < window.input.length) {
                return window.input[window.inputIndex++];
              }
              return '';
            };
          }
          
          // コード実行
          eval(code);
          console.log = originalLog;
          
          result = logs.join('\n') || '実行完了（出力なし）';
        } catch (error) {
          result = `エラー: ${error.message}`;
        }
      } else {
        // その他の言語はシミュレーション
        const outputs = {
          python: 'Hello, World!\n2 + 3 = 5',
          java: 'Hello, World!\n2 + 3 = 5',
          cpp: 'Hello, World!\n2 + 3 = 5',
          c: 'Hello, World!\n2 + 3 = 5'
        };
        result = outputs[selectedLanguage.value] || 'Hello, World!';
      }
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      setOutput(result);
      setExecutionDetails({
        time: `${executionTime}ms`,
        memory: `${Math.floor(Math.random() * 50 + 10)}KB`,
        status: 'Accepted'
      });
      
    } catch (error) {
      setOutput(`実行エラー: ${error.message}`);
      setExecutionDetails({
        time: '0ms',
        memory: '0KB',
        status: 'Error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ファイル保存
  const saveCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${selectedLanguage.value}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* ヘッダー */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-400">🚀 オンラインコードエディター</h1>
          <div className="flex items-center gap-4">
            {/* 言語選択 */}
            <div className="relative">
              <select 
                value={selectedLanguage.value}
                onChange={(e) => {
                  const lang = languageOptions.find(l => l.value === e.target.value);
                  handleLanguageChange(lang);
                }}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none appearance-none pr-8"
              >
                {languageOptions.map((lang) => (
                  <option key={lang.id} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* 実行ボタン */}
            <button
              onClick={executeCode}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              実行
            </button>

            {/* 保存ボタン */}
            <button
              onClick={saveCode}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* 左側: エディターと入力 */}
        <div className="flex-1 flex flex-col">
          {/* エディター */}
          <div className="flex-1 border-r border-gray-700">
            <div className="h-full" ref={editorRef}></div>
          </div>

          {/* カスタム入力 */}
          <div className="h-32 border-r border-t border-gray-700 bg-gray-800">
            <div className="p-3 border-b border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                カスタム入力
              </h3>
            </div>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="プログラムへの入力を入力してください..."
              className="w-full h-20 bg-gray-900 text-white p-3 resize-none focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* 右側: 出力と実行詳細 */}
        <div className="w-1/2 flex flex-col">
          {/* 実行詳細 */}
          {executionDetails && (
            <div className="bg-gray-800 p-4 border-b border-gray-700">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">実行時間:</span>
                  <span className="text-white">{executionDetails.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">メモリ:</span>
                  <span className="text-white">{executionDetails.memory}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">ステータス:</span>
                  <span className={`${executionDetails.status === 'Accepted' ? 'text-green-400' : 'text-red-400'}`}>
                    {executionDetails.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 出力エリア */}
          <div className="flex-1 bg-gray-900">
            <div className="p-3 border-b border-gray-700 bg-gray-800">
              <h3 className="text-sm font-semibold text-gray-300">出力</h3>
            </div>
            <div className="p-4 h-full overflow-auto">
              <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                {output || 'コードを実行すると結果がここに表示されます...'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
