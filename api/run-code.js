const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors()); // CORSを有効にする

// Vercelでのデプロイに必要
app.use(express.static(path.join(__dirname, 'public')));

app.post('/run-code', (req, res) => {
  const code = req.body.code;
  const language = req.body.language;

  // 実行するプログラミング言語に応じてコマンドと拡張子を決定
  let command;
  let fileName;
  switch (language) {
    case 'python':
      command = 'python';
      fileName = 'temp_code.py';
      break;
    case 'javascript': // Node.jsを想定
      command = 'node';
      fileName = 'temp_code.js';
      break;
    default:
      return res.status(400).json({ error: 'Unsupported language' });
  }

  const filePath = path.join(__dirname, fileName);
  fs.writeFileSync(filePath, code);

  const process = spawn(command, [filePath]);
  let output = '';
  let error = '';

  process.stdout.on('data', (data) => {
    output += data.toString();
  });

  process.stderr.on('data', (data) => {
    error += data.toString();
  });

  process.on('close', (code) => {
    fs.unlinkSync(filePath); // テンポラリファイルを削除
    res.json({ output: output, error: error });
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
