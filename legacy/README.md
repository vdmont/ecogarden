# legacy/ — 历史基线（v0.8 离线单文件版）

`legacy/index.html` 是 **v0.8 的离线单文件构建产物**（未拆分的 728 KB 单文件，即 v0.8 最初的 baseline），
自本次模块化改造起仅作**历史基线**保留，不再作为开发或发布入口。

## 身份校验

该文件与发布包根目录的离线成品、以及工程目录的构建产物三者 SHA256 完全相同：

| 路径 | SHA256 |
| --- | --- |
| `legacy/index.html` | `BDD345BBA724F93CD656128835438F77B62A2626B50E05CDF932649219D41D40` |
| `生态花园-ecogarden-v0.8/index.html` | `BDD345BBA724F93CD656128835438F77B62A2626B50E05CDF932649219D41D40` |
| `生态花园-ecogarden-v0.8/project/dist/index.html` | `BDD345BBA724F93CD656128835438F77B62A2626B50E05CDF932649219D41D40` |

可用 PowerShell 复核：

```powershell
Get-FileHash .\legacy\index.html -Algorithm SHA256
```

## 不要把它当作开发入口

- **开发入口**是仓库根的 `index.html`（30 行工程入口）+ `src/`（按 data / sim / state / render / ui 分层的模块源码）。
- 本地试玩：运行仓库根的 `server.cjs`（`node server.cjs`，默认 http://127.0.0.1:8877/ ），或双击 `开始试玩.cmd`。
- 需要离线单文件成品时，用构建脚本重新生成到 `dist/`，不要直接编辑本目录下的文件。
- 本目录文件**只读保留**：任何玩法/修复改动都请落在 `src/` 下，保持基线的可对照性。
