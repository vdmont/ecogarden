# 生态花园 · ecogarden

一个纯前端的浮岛生态沙盒游戏。种子、幼虫、火、羊驼——所有生命都在一座小岛上慢慢发生。

当前版本 **v0.9**（六个章节、15 种动物、42 项成就），并且已经完成从「一个 HTML 走天下」到**模块化工程**的改造：源码按数据 / 模拟 / 状态 / 渲染 / 界面分层放在 `src/` 下，构建脚本再把它组装成可离线双击打开的单文件版。

## 环境要求

- Node.js 18 或更高版本（推荐 LTS）
- 无需 `npm install`：**这个工程没有任何 npm 依赖**，`npm` 只用来调用 `package.json` 里的脚本。Three.js 以 `vendor/three.min.js` 的形式随仓库提供（r128，MIT，见 `THIRD-PARTY-NOTICES.txt`）。

## 快速开始

```bash
git clone https://github.com/vdmont/ecogarden.git
cd ecogarden

npm run dev      # 本地试玩：http://127.0.0.1:8877/
npm test         # 50 项检查：行为 + 渲染 + 引导 + 形态 + 涌现式水流 + 属性化
npm run build    # 生成离线单文件版 dist/index.html
npm run preview  # 预览构建产物：http://127.0.0.1:4173/
npm run demo:water  # 生成 docs/水流演示.json（水流冲走动物的演示存档）
```

Windows 用户也可以直接双击 `开始试玩.cmd`，效果等同于 `npm run dev`；如果机器上没有 Node.js，启动器会先尝试打开 `dist/index.html`，没有构建产物时回退到改造前的单文件基线 `legacy/index.html`，两者都不存在才提示安装 Node.js。

## 开局地形

每关开局**自带**地形，不再是一块圆平的沙盘：

- 海岸线由三个频率的波瓣叠噪声构成，会去掉孤零零的单格，所以是海湾与半岛而不是圆边或碎屑。
- 每个世界有自己的随机种子（存档字段 `seed`），所以**每次新开一局、每次重玩的岛形都不一样**。
- 每一格都有自己的高度，植物、动物、火焰、光标与点击判定全部跟着高度走；约 5% 的格子是石头山脊（最高 6.6 格），其余坡地照常能种、能放动物、能浇水（可玩格子占 73%–92%）。
- **开局荒芜**：一棵树都没有，只有起点草地和 3 只以内的虫子；森林、动物都靠玩家养出来。森林印章留缝隙，且小动物能穿过树丛，不会把岛堵死。
- 每个世界还记录自己是用哪一版海岸线生成的（存档字段 `shape`）：**老存档继续用当年的圆岛轮廓**，所以能照旧打开、继续玩、再保存，面积一点不变。
- 详细说明、逐关数据、本轮按反馈修的 5 个问题与自查方法见 [`docs/地形改版.md`](docs/地形改版.md)。

## 涌现式玩法

玩法不靠"给每种动物写一条规则"，而是**属性 × 环境**自己撞出结果：

- 动物属性：`move`（走 / 飞 / 游）、`mass`（体重）、`climb`（爬坡）、`diet`（食性）、`plants`（食谱）、`eats`（捕食）。
  食草者/食虫者/授粉者与捕食关系**全部由这些属性推出**，代码里不再有写死的物种名单。
- 水的属性：有落差的水格会**朝落差最大的方向流**（水往最低处流，岛外算最低），方向在第一次流动时定下并随存档保留；
  所以把哪边挖低，水就往哪边去——玩家可以自己造水路，不需要额外的引水工具。
- 相撞：站在活水里的走兽会被推着走、体重越小冲得越快，冲出岛就回不来；**会飞的一律不受影响**。
  陡坡则挡住 `climb` 不够的动物，会飞的直接越过。
- 演示存档：`docs/水流演示.json`（游戏内「存档 → 导入」即可），或 `npm run demo:water` 重新生成。

细节、属性表和逐步自查见 [`docs/涌现式玩法.md`](docs/涌现式玩法.md)。

## 目录结构

```
.
├── index.html              # 开发入口：只声明样式与脚本加载顺序
├── server.cjs              # 试玩用零依赖静态服务器（8877）
├── 开始试玩.cmd            # Windows 一键启动（CRLF 行尾，见 .gitattributes）
├── package.json            # dev / build / preview / test 脚本
├── .gitattributes          # 行尾策略：批处理文件固定以 CRLF 存入仓库
├── src/
│   ├── data/               # 纯数据与文案（改数值、改文字来这里）
│   │   ├── text.js         #   全部界面文案与页面骨架（m001 等键名稳定，勿改键名）
│   │   ├── species.js      #   15 种动物的寿命、权重、食谱、繁殖参数与属性（move/mass）
│   │   ├── levels.js       #   六个章节的工具、目标与地图配置
│   │   ├── achievements.js #   42 项成就与指标定义
│   │   ├── copy.js         #   分阶段开放的玩法说明、图鉴、秘密成就线索
│   │   └── palette.js      #   植物与动物配色
│   ├── sim/core.js         # 生态模拟：生长、捕食、迁入、繁殖、火、地形与水流
│   ├── state/save.js       # 存档校验与旧版本兼容
│   ├── render/
│   │   ├── scene.js        # 相机、平移、瀑布、水流方向与实例化绘制
│   │   └── models/         # 每种动物/植物一个文件的程序化模型
│   └── ui/
│       ├── app.js          # 界面交互与主循环
│       ├── journey.js      # 迎宾页、统一手势（拖动旋转/滚轮缩放/双击跟随）、分章引导与白框箭头
│       ├── mount.js        # 把 text.js 里的页面骨架挂到 DOM
│       └── style.css
├── scripts/
│   ├── files.json          # 脚本加载顺序（唯一事实来源）
│   ├── build.cjs           # 构建：内联 CSS 与全部脚本 → dist/index.html
│   ├── static-server.cjs   # 上面两个服务器共用的实现
│   ├── preview.cjs         # 预览 dist/
│   ├── landscape-demo.cjs  # 生成可选的第五关演示存档
│   └── water-demo.cjs      # 生成水流演示存档（docs/水流演示.json）
├── tests/                  # Node 测试（无需浏览器）
│   ├── behavior.cjs        #  22 项行为检查
│   ├── render.cjs          #  2 项渲染检查
│   ├── journey.cjs         #  5 项引导推进、地形解锁、火焰与寿命检查
│   ├── shape.cjs           #  11 项形态/渲染护栏（轮廓与种子、地形内容、可玩性、方块重叠、预算）
│   ├── flow.cjs            #  5 项涌现式水流检查（流向固定、冲刷、体重、存档）
│   ├── traits.cjs          #  4 项属性化检查（名单由属性推出、食谱等价、爬坡、地形可通行）
│   ├── ecology.cjs         #  长时种群观察（3 个种子 × 3000 秒）
│   ├── load.cjs            #  按顺序加载 src 下的模块
│   └── fixtures/v0.7.json  #  旧版本存档迁移样本
├── vendor/three.min.js     # 第三方库（MIT）
├── docs/                   # 协作与验证文档
└── legacy/                 # 改造前的单文件基线（只读保留）
```

## 代码组织方式

这个工程刻意保持**零依赖**：`src/` 下的文件是**经典脚本**而不是 ES module，它们按 `scripts/files.json` 的顺序通过 `globalThis` 上的几个命名空间通信：

| 命名空间 | 提供方 | 内容 |
| --- | --- | --- |
| `GardenText` / `T` | `src/data/text.js` | 全部文案与页面骨架 |
| `EcoData` | `src/data/*.js` | 物种、章节、成就、配色等纯数据 |
| `Eco` | `src/sim/core.js` | 模拟核心（`step` / `place` / `makeWorld` …） |
| `GardenModels` | `src/render/models/*.js` | 按物种注册的程序化模型 |
| `GardenView` | `src/render/scene.js` | Three.js 场景与绘制 |
| `GardenCopy` / `GardenPalette` | `src/data/copy.js` / `palette.js` | 说明文案与配色表 |

这样 `tests/` 可以直接用 Node `require()` 加载同一批源文件跑断言，不需要浏览器、打包器或转译步骤；也正因为如此，**新增脚本时必须同步更新加载清单**：`scripts/files.json` 与入口 `index.html` 必须一起改（构建顺序以 `files.json` 为准，两者不一致时构建会直接报错）；如果新文件需要被 Node 检查脚本加载，还要加进 `tests/load.cjs`。

## 构建与发布

- `npm run build` 会读取入口 `index.html`，把 `src/ui/style.css` 内联为 `<style>`，再按 `scripts/files.json` 的顺序把每个脚本内联为 `<script>`，输出**完全自包含**的 `dist/index.html`（约 728 KB，无任何外部 CDN 请求）。
- 发布离线版时只需要 `dist/index.html` 这一个文件，可以直接作为静态站点首页上传。
- `dist/` 是构建产物，已被 `.gitignore` 忽略，不进入版本管理。

## 存档说明

- 存档键沿用 `emergent-garden-v06`，内部存档版本号为 `6`，校验逻辑见 [`src/state/save.js`](src/state/save.js)。
- 旧版（v0.7 单文件版）的存档与当前版本使用同一个键、同一个版本号，因此在**相同来源**下可以直接继续读取，成就与各岛屿进度都会保留（`tests/fixtures/v0.7.json` 就是这份迁移样本）。
- 校验是**严格**的：版本号不是 `6`、或世界尺寸/单元格字段越界的存档会被明确拒绝并报错，而不是被静默清空——所以不要手工改存档里的 `version` 字段。
- 浏览器按**来源（origin）**隔离存档：`localhost`、`127.0.0.1`、不同端口、以及直接双击打开的 `file://` 各自是独立的存档空间，换地址不会自动互通。跨地址或跨设备转移进度请在游戏内「存档」面板导出 / 导入 JSON。
- `docs/演示花园.json` 是可选的第五关演示存档（包含湖泊、山地、森林与动物），导入会替换当前来源的存档，**不是**新玩家的默认开局。也可以随时重新生成：`npm run demo`。

## 测试

```bash
npm test              # 22 行为 + 2 渲染 + 5 引导 + 11 形态/渲染 + 6 涌现式水流 + 4 属性化 = 50 项
npm run test:ecology  # 长时种群观察，输出 3 个种子的采样 JSON
```

`npm test` 覆盖六关开放顺序、自然迁入、栖息地条件、地形工具与容量上限、繁殖与饥饿、存档确定性续玩、旧版迁移、损坏存档拒绝等。长时观察是有限资源下的概率模拟，种群会自然波动，不保证每个物种永不灭绝。

`tests/shape.cjs` 是给后续改版用的护栏，它刻意锁住现状：六关的岛屿轮廓（格数与哈希）、每物种盒数与实例预算、以及地形数值上限。改动这些会让它失败——这是有意的，因为**岛屿轮廓变化会让旧存档被拒**（`save.js` 的参考格阵校验），地形加密也可能撞上渲染实例预算（`put` 会直接抛错）。失败时请按断言里的提示同步处理存档兼容与预算，而不是直接改基线数字。

`npm run test:ecology` 的采样输出以 `docs/population-log.jsonl`（约 7 KB）随仓库保留，`docs/验证记录.md` 的长时观察表格即取自它；重新运行该命令会覆盖这个文件。

测试的**已知覆盖边界**（改到这些地方要额外手工验一遍）：

- `tests/load.cjs` 不加载 `src/ui/app.js`、`src/ui/mount.js` 和 `vendor/three.min.js`，因此界面的 DOM 交互、`mount.js` 的骨架挂载、以及 Three.js 场景初始化不在自动测试范围内。
- 渲染检查用 `Object.create(GardenView.prototype)` 绕过构造函数，所以相机/渲染器初始化本身未被覆盖。
- 拾取几何（`GardenView.rayCell` 的高度感知行进）由 `tests/shape.cjs` 直接测，但 `pick()` 里 `THREE.Raycaster` 与相机矩阵的实际接线仍需浏览器确认。
- 触屏手势、音效、照片导出（依赖渲染器的 `preserveDrawingBuffer`）需要真实浏览器验证。
- 构建脚本会校验 `files.json` 与入口 `index.html` 完全一致；两者不一致会直接报错，而不是静默丢代码。

## 本版边界

- 已验证桌面浏览器与手机尺寸布局，**未**做 Android 真机 / TapPlay / TapTap PC 客户端认证；本仓库不含 APK 或 Windows 安装器。
- 撤销与 PWA 安装尚未实现，留作后续候选。
- 模型与 UI 由 AI 辅助以程序化方式生成（不包含 Minecraft / Dwarf Fortress 素材）；作品的 AI 素材披露口径见 `docs/GameJam-双端核对.md`。

## 更多文档

- [`docs/涌现式玩法.md`](docs/涌现式玩法.md) — 属性 × 环境（第一例：水流冲走小动物）与演示存档用法
- [`docs/属性化清单.md`](docs/属性化清单.md) — 把剩下的脚本式行为逐条改成属性 × 环境的完整清单（含"喝醉的羊"设计样板）
- [`docs/地形改版.md`](docs/地形改版.md) — 开局地形生成、海岸线与老存档兼容（大白话版）
- [`docs/发布说明-原发布包.md`](docs/发布说明-原发布包.md) — 朋友提供的 v0.8 发布包原始说明
- [`docs/反馈落实.md`](docs/反馈落实.md) — v0.8 逐条改动
- [`docs/验证记录.md`](docs/验证记录.md) — v0.8 验证记录
- [`docs/GitHub协作.md`](docs/GitHub协作.md) — 分支 / PR 协作方式
- [`docs/GameJam-双端核对.md`](docs/GameJam-双端核对.md) — 平台交付核对
- [`legacy/README.md`](legacy/README.md) — 改造前的单文件基线说明
- [`THIRD-PARTY-NOTICES.txt`](THIRD-PARTY-NOTICES.txt) — Three.js 许可

新版主界面、统一手势（拖动旋转 / 滚轮缩放 / 双击跟随 / 点空白回全岛）、引导、地形解锁与生态调整见 [v0.9 园丁引导](docs/v0.9-园丁引导.md)。
