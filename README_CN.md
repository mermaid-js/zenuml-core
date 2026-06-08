# 开发

```bash
bun install
bun dev
```

# 代码结构

DSL 解析器和渲染器都在这个代码库中。

DSL 解析器是基于 Antlr4 构建的。其定义文件位于 `src/g4`。生成的解析器位于 `src/generated-parser`。
对解析器的增强相关的代码位于 `src/parser` 文件夹。

所有其他的文件基本上都是跟渲染器相关的。渲染器是基于 React 19 开发的。

# 测试

```bash
# 单元测试
bun run test

# 端到端测试 (Playwright)
bun pw
```

# 构建

```bash
# 构建库文件 (ESM + UMD)
bun build

# 构建演示站点
bun build:site
```

构建输出：
- `dist/zenuml.esm.mjs` — ESM 格式，适用于现代打包工具
- `dist/zenuml.js` — UMD 格式，适用于浏览器 `<script>` 标签
- `dist/style.css` — 样式文件

# 集成

请参阅 [TUTORIAL.md](./TUTORIAL.md) 了解库集成和 iframe 嵌入的详细步骤。

# DSL 语法

请参阅 [docs/DSL_SYNTAX.md](./docs/DSL_SYNTAX.md) 了解 ZenUML 图表语言的完整参考。
