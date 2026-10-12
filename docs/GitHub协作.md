# GitHub 协作

仓库：<https://github.com/vdmont/ecogarden>

## 提交到哪个目录

模块化改造完成后，**仓库根目录就是工程本身**：

- `src/` 是源码，所有玩法、数值、文案、模型的改动都落在这里。
- 根 `index.html` 是开发入口，只声明样式与脚本加载顺序。
- `dist/index.html` 是构建产物（单文件离线版），已被 `.gitignore` 忽略，**不要手工编辑，也不要提交**；需要成品时运行 `npm run build` 生成。
- `legacy/index.html` 是改造前的单文件基线，只读保留，用于对照。
- 朋友提供的发布包解压目录 `生态花园-ecogarden-v0.8/` 同样被忽略，不进入版本管理。

## 推荐工作流

1. 从 `main` 开一个分支，命名如 `feat/xxx`、`fix/xxx`、`refactor/xxx`。
2. 改代码。常用的几个文件：

   | 想改什么 | 改哪里 |
   | --- | --- |
   | 界面文案、提示语 | `src/data/text.js`（搜索中文，保留 `m001` 这类键名） |
   | 六关工具、目标、地图 | `src/data/levels.js` |
   | 动物权重、寿命、食谱、繁殖 | `src/data/species.js` |
   | 成就列表 | `src/data/achievements.js` |
   | 分阶段玩法说明、图鉴 | `src/data/copy.js` |
   | 配色 | `src/data/palette.js` |
   | 某种动物/植物的模型 | `src/render/models/` |
   | 生态规则、生长、捕食、火 | `src/sim/core.js` |
   | 存档校验与兼容 | `src/state/save.js` |
   | 镜头、平移、瀑布、绘制 | `src/render/scene.js` |
   | 界面交互与布局 | `src/ui/app.js`、`src/ui/style.css` |

3. 提交前本地跑通：

   ```bash
   npm test         # 行为 + 渲染检查
   npm run build    # 确认还能构建出单文件版
   npm run dev      # 打开 http://127.0.0.1:8877/ 手动过一遍改动的功能
   ```

4. 推送分支并开 Pull Request，在描述里写清改动点与验证方式。

## 提交信息与 PR

- 提交信息沿用仓库现有的 `类型: 说明` 风格，例如 `fix: 修正第五关目标判定`、`docs: 更新协作说明`、`refactor: 拆分渲染模块`。
- PR 描述至少写清四件事：改了什么、为什么改、怎么验证（跑了哪些命令、看到什么输出）、已知限制。构建产物有变化时，附上 `npm run build` 打印的字节数。
- 合并前在分支上至少跑一次 `npm test`；涉及界面时再 `npm run dev`（<http://127.0.0.1:8877/>）手动过一遍改动点。

## 注意事项

- **新增脚本要同步更新加载清单**：`scripts/files.json` 与根 `index.html` 必须一起改（构建顺序以 `files.json` 为准，两者不一致时 `npm run build` 会直接报错）；如果新文件需要被 Node 检查脚本加载，还要加进 `tests/load.cjs`，否则测试会加载不到。
- 构建时会对 `scripts/files.json` 中列出的每个脚本做语法检查，并校验 `files.json` 与入口 `index.html` 的清单完全一致：任一条目缺失或多余、或产物里残留外部引用，都会让 `npm run build` 直接报错退出。
- **存档不随代码同步**：每个人、每个浏览器来源（`localhost` / `127.0.0.1` / 不同端口 / `file://`）各有一份独立存档，换机器请用游戏内「存档」面板导出 / 导入 JSON。不要把自己的浏览器用户目录或账号凭据提交上来。
- Three.js 的 MIT 许可声明必须随发布保留（`THIRD-PARTY-NOTICES.txt`）。
- 仓库公开与否由你们决定；公开站点只需要部署 `dist/index.html`。
