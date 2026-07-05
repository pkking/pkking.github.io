---
name: blog-writer
description: "技术博客出版流水线总控/总包工头（General Contractor/Orchestrator）。作为整个出版流程的总管，负责调度整个多智能体协作与审查流水线（Step 1 -> Step 7）。通过调用 blog-researcher 采风、blog-outliner 规划、devils-advocate 红蓝对抗大纲审核、blog-drafter 起草初稿，并依次调用下游的文字/术语/证据/排版审查车间（editor-copy、editor-citation、editor-evidence、editor-format），完成高质量技术博客文章的闭环创作与发布分发。"
---

# 技术博客深度写作

## 核心理念

**这不是一个内容生成工具，而是一个观点表达工具。**

每篇文章必须能回答：我到底推荐什么？反对什么？读者看完能带走什么判断？

如果写完一篇文章，删掉所有观点句子后文章还能成立——说明这篇文章没有观点，是废品。

文章的默认形态是**总分总**：
- **总**：开头 3-5 段先把结论、读者问题、判断边界讲清楚，不吊胃口。
- **分**：中段用证据、案例、图表、对比和反例展开，而不是连续下定义。
- **总**：结尾回到开头的判断，给读者一个可执行的下一步或决策框架。

默认语气是“和读者一起推演”，不是“站在讲台上解释”。写作时少用训导句，多用场景句、问题句、对比句和具体例子推动文章。

## 博客信息

- **Hexo 版本**: 8.1.1
- **主题**: Next（`hexo-theme-next`）
- **内容目录**: `source/_posts/`（文章 `<slug>.md` + 同名资源文件夹 `<slug>/`，`post_asset_folder: true`）
- 博客地址和具体配置从项目的 `_config.yml`（站点）和 `_config.next.yml`（主题）动态获取
- 站点语言 `zh-CN`，默认写中文版；英文版为可选（需额外配置 Hexo 多语言）

---

## 强制执行流程

```
步骤1 确认需求 → 步骤2 深度研究(blog-researcher) → 步骤3/3.5 大纲与规约设计(blog-outliner) → 步骤3.6 魔鬼代言人审核(devils-advocate) ⛔ → 步骤4 起草初稿(blog-drafter) → 步骤4.5 质量门禁流水线(4x Editors) ⛔ → 步骤5 封面图与内容配图(blog-cover-image 等) → 步骤6 质量自检 ⛔ → 步骤7 发布与分发
```

⚠️ **每一步必须完成后才能进入下一步，不可跳过。特别是红蓝对抗大纲审核 ⛔ 步骤。**

### 执行模型：总控/总包工头调度（General Contractor/Orchestrator）

`blog-writer` 充当流水线的总包工头与调度者，并不直接执行研究或具体起草工作。它将通过 `invoke_subagent` 调度专门 of 子智能体分工协作：
1. 调用 `blog-researcher` 收集底层素材及代码。
2. 调用 `blog-outliner` 规划大纲及生成技术规约 `article-spec.yml`。
3. 调用 `devils-advocate` 执行大纲红蓝对抗审计，并循环修正直至获批。
4. 调用 `blog-drafter` 将规约和素材编译为 Markdown 草稿。
5. 依次调用下游质量门禁流水线（`editor-copy`、`editor-citation`、`editor-evidence`、`editor-format`）进行专业审查。

---

### 步骤 1：确认需求

向用户确认：
1. **主题**：写什么？
2. **素材**：参考链接？
3. **目标关键词**：（可选）
4. **语言**：默认中英文都写，角度可以不同

如果用户已提供，直接进入步骤 2。

---

### 步骤 2：深度研究

主控 Agent 将调用 `blog-researcher` 子智能体进行深度研究与采风。

#### 2.1 调度与执行
主控 Agent 必须通过 `invoke_subagent` 调用 `blog-researcher`，传递以下必要参数：
- **主题与核心关键词**
- **素材链接/URLs**
- **本地/远程代码库路径**
- **关注范围/查询范围 (Query Scope)**

`blog-researcher` 将分析网页文章、官方文档、视频（调用 `youtube-fetch` 技能脚本），并强制扒取真实项目代码和组件配置，最终在 `.agents/article-specs/<slug>/` 目录下生成标准格式的 `research_report.md`。

确认 `research_report.md` 生成后，进入下一步。

---

### 步骤 3 & 步骤 3.5：大纲规划与规约设计

主控 Agent 将调用 `blog-outliner` 子智能体对文章大纲及技术规约进行设计与固化。

#### 3.1 调度与执行
使用 `invoke_subagent` 调用 `blog-outliner`，提供：
- **写作原始需求**
- **深度研究报告** (`/home/lcr/pkking.github.io/.agents/article-specs/<slug>/research_report.md`)

`blog-outliner` 将明确回答“6+1 核心判断与价值自检”，设计用户心智故事线、规划“全景认知对齐”图表，并输出标准的 `.agents/article-specs/<slug>/article-spec.yml` 规约文件。

确认 `article-spec.yml` 成功生成后，进入步骤 3.6 进行红蓝对抗。

---

### 步骤 3.6：红蓝对抗大纲审核（AI 互辩） ⛔ 必须通过

在进入起稿阶段前，必须调用 `devils-advocate` 执行大纲对抗审计，确保结构紧凑、立意新颖、证据确凿。

#### 3.6.1 调度与循环逻辑
1. **调用魔鬼代言人**：主控 Agent 使用 `invoke_subagent` 调用 `devils-advocate` 审计 `article-spec.yml`。
2. **审查判定**：`devils-advocate` 将输出 `.agents/article-specs/<slug>/advocate_critique.md`。如果判定状态为 `[APPROVED]`，则通过审核。
3. **循环修正逻辑**：
   - 如果判定为 `[REJECTED]`，主控 Agent 必须将 `advocate_critique.md` 中的具体修改要求作为输入，再次调用 `blog-outliner` 进行大纲规约修正。
   - `blog-outliner` 修正完成后，主控 Agent 重新调用 `devils-advocate` 进行审计.
   - **循环往复**，直至 `devils-advocate` 最终给出 `[APPROVED]` 决议。

#### 3.6.2 人类最终审核
AI 内部审计通过后，将最终版 `article-spec.yml` 呈现给人类（User）进行最终审核，征得人类“同意推进”后才能进入下一步。

---

### 步骤 4：正文初稿撰写

大纲和规约最终获批后，主控 Agent 调用 `blog-drafter` 子智能体进行编译写作。

#### 4.1 调度与执行
使用 `invoke_subagent` 调用 `blog-drafter`，提供：
- **已获批的大纲规约** (`/home/lcr/pkking.github.io/.agents/article-specs/<slug>/article-spec.yml`)
- **深度研究报告** (`/home/lcr/pkking.github.io/.agents/article-specs/<slug>/research_report.md`)

`blog-drafter` 将严格根据既定结构契约、术语先行、代码机制大白话翻译及 AI 机器词汇全局过滤等规范，把规约和素材编译输出为：
1. **Hexo Markdown 正文文章**：写入至 `/home/lcr/pkking.github.io/source/_posts/<slug>.md`。
2. **撰写报告**：写入至 `.agents/article-specs/<slug>/drafter_report.md` 总结各项统计指标和 AI 违禁词自检情况。

主控 Agent 确认初稿和撰写报告生成后，进入步骤 4.5。

---

### 步骤 4.5：多重质量门禁流水线 (Single-Responsibility Review Pipeline) ⛔

**目的：消除规则泄露 (Rule Leakage) 和指令超载，通过“职责极度单一”的流水线车间彻底杜绝低级错误。**
正文初稿完成后，**禁止由主笔自己审查**。主笔 Agent 必须暂停，并**按顺序依次召唤三个极度偏执的独立子智能体**，依次对源文件进行原地手术。

**执行顺序与指令：**
1. **第一关：召唤文字编辑 (Copy Editor)**
   - 调用 `invoke_subagent` 采用 `editor-copy`。
   - 等待其完成“消除 AI 味和说教感”的纯文字手术。
2. **第二关：召唤术语与引用核查员 (Citation Checker)**
   - 必须等第一关结束后再调用 `editor-citation`。
   - 强制补全术语解释和文末的 `## 参考资料`。
3. **第三关：召唤证据与逻辑核查员 (Evidence Checker)**
   - 等第二关结束后调用 `editor-evidence`。
   - 专门检查“全景认知对齐”是否缺失，以及代码块下方是否漏写了“大白话机制翻译”。
4. **第四关：召唤排版与语法核查员 (Format Checker)**
   - 等第三关结束后调用 `editor-format`。
   - 进行纯粹的物理语法检查（反引号、相对路径图片）。

**闭环要求**：
主笔 Agent 必须逐一等待每个子智能体的《修改报告》，确认四个环节全部打通后，才能推进到下一步。绝对不允许把要求塞给同一个智能体去审。

---

### 步骤 5：封面图 + 内容配图

文章写完后，根据内容生成图片。

**配图目标不是装饰，而是降低阅读负担。** 默认按“封面图 + 3 张内容图”起步：一张讲结构，一张讲流程或机制，一张讲对比或决策。文章超过 2500 字时，每增加 800-1000 字至少增加 1 个视觉停顿（图表、代码块、表格、信息卡都可以）。

#### 5.1 封面图（必须）

调用 `blog-cover-image` skill：
```
/blog-cover-image <文章目录> --quick
```
- 文件名：`cover.webp`，1200×630px，WebP 质量 85
- 统一英文生成，中英文共用
- 封面图在正文第一行引用：`![ALT](cover.webp)`

#### 5.2 内容配图（必须，至少 3 张）

**第一步：按图表类型选对应的 skill**

| 图表类型 | 首选 skill | 输出形式 | 渲染方式 |
|---------|-----------|---------|---------|
| 流程图 / 决策树 / 时序图 / 状态机 / 思维导图 / ER 图 / 甘特图 / 类图 | `mermaid` | ` ```mermaid ` 代码块 | `hexo-filter-mermaid-diagrams` 插件渲染 |
| 分层系统架构（User→App→Data→Infra）| `architecture` | 内嵌 HTML + CSS | Hexo marked 渲染 HTML（默认支持） |
| 富视觉信息卡 / Bento 概览 / 数据看板 / 对比矩阵 | `blog-diagram` | AI 生成 WebP | `![](diagram-xxx.webp)` |
| 概念插图 / 场景化插画 | `blog-illustrator` | AI 生成 WebP | `![](illustration-xxx.webp)` |
| 封面图 | `blog-cover-image` | AI 生成 WebP | `![](cover.webp)` |

**第二步：按优先级规则决策（文本结构化 > AI 位图）**

1. **能用 mermaid 表达的优先 mermaid** —— 可编辑、可搜索、SEO 友好、响应式
2. **分层架构优先 architecture** —— 响应式、无外部依赖
3. **剩下才考虑 AI 生图** —— 富视觉信息卡走 blog-diagram，场景化插画走 blog-illustrator

**第三步：按文章结构布图**

- 开头 1/3：放一张总览图或概念地图，帮读者建立全局
- 中段：放流程图、架构图、时序图或对比表，支撑核心论证
- 结尾前：放决策树、速查表或路线图，承接行动建议
- 纯概念段落超过 700 字仍没有图表/表格/代码，必须拆段或补视觉停顿

**第四步：调用**

```bash
# mermaid / architecture —— 让 AI 直接写代码嵌入文章 markdown
# （不是一个独立的 CLI 命令，是写作过程中直接产出）

# AI 生图 —— 独立 skill 调用
/blog-diagram <文章目录> --layout bento-grid --style corporate
/blog-illustrator <文章目录> --quick
```

**专业图表**（按需启用，不在默认流程里）：
- `graphviz` 复杂依赖 / 调用图
- `uml` 类图 / 时序图 / 活动图 / 组件图
- `network` 企业网络拓扑（Cisco / Citrix 图标）
- `bpmn` 业务流程 / 集成模式
- `cloud` AWS / Azure / GCP / 阿里云架构图（官方图标）
- `archimate` 企业架构（TOGAF）
- `infographic` KPI 卡片 / 时间线 / SWOT
- `infocard` 编辑风格信息卡
- `canvas` 自由定位思维导图 / 知识图谱
- `vega` 数据驱动图表（柱状 / 折线 / 热力 / 散点）

需要哪种按文件名查阅 `.agents/skills/<name>/SKILL.md`。

**⚠️ 本项目 Hexo + Next 集成规范**（已配置到位，直接用，不要改）：

| 配置点 | 位置 | 作用 |
|-------|-----|------|
| mermaid 渲染 | Next 主题 `mermaid.js` 客户端渲染 | hexo highlight 产出 `<pre><code class="mermaid">`，Next 脚本认 `pre > .mermaid` 并调 mermaid 11 画成 SVG |
| mermaid 主题 | `_config.next.yml` → `mermaid.theme` | `light: forest` / `dark: dark`，深色背景高contrast |
| mermaid 语言排除 | `_config.yml` → `highlight.exclude_languages: [mermaid]` | hexo 对 mermaid 代码块不做语法高亮，保留原始文本（0 span），mermaid 才能解析 |
| HTML 渲染 | Hexo marked 默认支持 | architecture skill 的内嵌 HTML 可直接渲染 |
| 文章资源 | `_config.yml` → `post_asset_folder: true` | 图片放文章同名资源文件夹，正文用相对路径引用 |

**避坑经验**：⚠️ **不要安装 `hexo-filter-mermaid-diagrams`**——它产出 `<pre class="mermaid">`（class 在 pre 上），而 Next 的 `mermaid.js` 认的是 `pre > .mermaid`（code 子元素），选择器匹配 0 个 → 图不渲染。本项目已移除该插件，走 Next 原生路径：`highlight.exclude_languages: [mermaid]` 保留原始文本 + Next `mermaid.js` 客户端渲染。架构图也不要走 AI 生图，mermaid/architecture 的可编辑性和响应式远胜 WebP。

**配图规范**（不变）：
- WebP 格式（AI 生图）：质量 85，最大宽度 1200px，中英文共用
- 命名：`diagram-xxx.webp` / `illustration-xxx.webp` / `cover.webp`
- 图片放文章同名资源文件夹 `source/_posts/<slug>/`，正文用相对路径引用（`post_asset_folder` 模式）
- mermaid/architecture 代码块直接嵌入 markdown 正文

**一篇文章至少要有封面图 + 3 张内容配图。** 短文（<1200 字）可以降到 2 张内容图，但必须在 article-spec.yml 的 `visual_plan` 里说明原因。纯文字长文没有配图会严重降低读者体验和停留时间。

---

### 步骤 6：质量门禁 ⛔

**以下检查项必须全部通过，任何一项不通过必须回去修改。**

#### 深度检查（最重要）

> 文字语气（AI 味/说教感）、术语角标、事实来源的细则已下沉到四重 editor 车间把关，本门禁只保留调度层与结构/内容完成度检查，不再内联具体违禁词清单——清单只在 editor-copy 一处维护，避免规则泄露。

- [ ] **核心立场清晰**：能用一句话概括文章的判断
- [ ] **article-spec.yml 已维护**：`.agents/article-specs/<slug>/article-spec.yml` 存在，且 core_claim / audience / sources / regeneration_policy 与正文一致
- [ ] **概念先行**：核心概念有 1-3 句解释，开头先铺读者不熟的名词（术语角标由 editor-citation 把关）
- [ ] **总分总结构清晰**：开头给总判断，中段拆证据/机制/反例，结尾回收判断并给行动建议
- [ ] **用户故事线清晰**：读者困境、误判风险、判断过程和读后行动都能在正文中找到
- [ ] **四重质检已执行**：editor-copy / editor-citation / editor-evidence / editor-format 四关全部跑完，并已按各自《修改报告》更新过文章
- [ ] **阅读体验好**：没有明显的讲课口吻，段落有起伏，正文像在推演而不是在布置作业
- [ ] **至少 2 个误区拆解**：指出了行业常见但错误的理解
- [ ] **至少 3 个真实案例/数据**：不是引用官方宣传
- [ ] **明确的 trade-off**：说了什么时候不该用
- [ ] **有行动建议**：读者看完知道下一步做什么
- [ ] **有第一人称经验**：至少出现 3 次"我认为"/"实际使用中"/"我的建议"
- [ ] **无单句观点**：搜索全文，核心论证段落不存在"一句话就是一个观点"的情况
- [ ] **段落充分展开**：核心章节的段落至少 5 句，包含论点+证据+分析

#### 格式和图片检查

- [ ] 标题 ≤ 60 字符，关键词前置
- [ ] Description 120-160 字符
- [ ] YAML Front Matter（`---`）
- [ ] 封面图 cover.webp（正文第一行引用）
- [ ] **内容配图 ≥ 3 张**（架构图、对比图、流程图、决策树、信息卡等）
- [ ] **配图节奏合理**：每 700-1000 字至少有一个视觉停顿，长概念段落不连续堆文字
- [ ] FAQ ≥ 3 个
- [ ] 内链 ≥ 4 个（自然嵌入正文，不是堆在文末）
- [ ] 外链 ≥ 6 个（优先一手来源；短文或资料稀缺主题需在 spec 里说明原因）
- [ ] 中文版已创建（英文版可选）

#### SEO 检查

- [ ] **关键词密度**：核心关键词在正文自然出现 3-5 次
- [ ] **第一段含关键词**：开头 150 字内包含核心关键词
- [ ] **H2 含关键词**：至少 2 个 H2 标题包含核心关键词或近义词
- [ ] **title 关键词前置**：核心关键词在标题前 30 字符内
- [ ] **description 回答问题**：不是概述文章，是直接回答搜索问题
- [ ] **keywords 含长尾词**：5-8 个，包含用户真实搜索句式
- [ ] **无超长无标题段落**：不存在超过 1500 字无 H2/H3 的长段
- [ ] 正文已插入配图引用

#### 画图渲染验证（必查）

- [ ] **mermaid 代码块语法正确**：本地 `hexo server` 打开文章，所有 mermaid 图表正常渲染（不是代码块原文）
- [ ] **architecture HTML 无错位**：浏览器打开看分层色块对齐、响应式在移动宽度不断裂
- [ ] **WebP 图片路径正确**：`![](cover.webp)` 和所有内容图引用的文件确实存在于文章同名资源文件夹
- [ ] **优先顺序检查**：能用 mermaid/architecture 的流程图 / 分层架构没用 AI 生图（结构化内容必须文本可编辑）

#### Hexo 构建

```bash
hexo clean && hexo generate
```

---

### 步骤 7：发布 + 分发

#### 7.1 发布前核对

- [ ] 文件命名：`source/_posts/<slug>.md`，资源文件夹 `source/_posts/<slug>/`
  - slug 用英文 kebab-case（如 `claude-skills-guide`），一旦发布不得更改（URL 稳定性是 SEO 硬规则）
  - permalink 跟随站点规则 `:year/:month/:day/:title/`，URL 为 `https://pkking.github.io/<年>/<月>/<日>/<slug>/`
- [ ] `.agents/article-specs/<slug>/article-spec.yml` 存在，且记录了本次写作/刷新所需的 prompt、判断、来源、结构和重生成策略
- [ ] 文章 `.md` 文件存在，封面图 `cover.webp` 和内容配图 ≥ 3 张已就位于同名资源文件夹
- [ ] `categories` 按需添加（Hexo 会生成归档页，合理使用）

#### 7.2 本地构建验证

```bash
hexo clean && hexo generate       # 生产构建，检查报错
hexo server                       # 本地预览，确认渲染正常（含封面图/配图/FAQ）
```

构建失败的常见原因和 fallback：
- YAML 语法错误 → 检查 front matter 缩进、引号、列表格式
- 图片引用失效 → 确认文件名大小写和 `.webp`/`.png` 扩展名，相对路径是否指向同名资源文件夹
- 链接 404 → 内链路径跟 permalink 规则 `/<年>/<月>/<日>/<slug>/`，不以 `_posts` 开头
- mermaid 不渲染 → 确认 `_config.yml` 的 `highlight.exclude_languages` 含 `mermaid`

#### 7.3 提交 + 触发部署

```bash
git add source/_posts/<slug>.md source/_posts/<slug>/
git commit -m "post: <中文标题或主题>"
git push origin master             # 推送到 master 分支
# 或用 hexo deploy（配置了 git deployer → master 分支）
```

等待 1-2 分钟后访问线上 URL 验证：
- `https://pkking.github.io/<年>/<月>/<日>/<slug>/`

#### 7.4 分发到外部平台

调用 `blog-distributor` skill 同步到 dev.to / 掘金 / V2EX / HN：

```
/blog-distributor <文章 slug>
```

⚠️ 只分发已经线上可访问的文章（dev.to 需要 canonical URL 反向引用本站）。

---

> **🚨 架构宪法警告 (Architecture Directive)**
> 本 SKILL 隶属于《多智能体媒体出版流水线》。在执行或修改本文件前，必须严格遵守 [`.agents/ARCHITECTURE.md`](../ARCHITECTURE.md) 的设计哲学。
> 严禁向主笔 Agent 追加排版、术语核查等外围任务！所有的质量控制必须通过调用独立的下游车间（如 editor-copy, editor-citation）完成。

## 参考文件

- [references/frontmatter-template.md](references/frontmatter-template.md) — Front Matter 模板
- [references/thinking-framework.md](references/thinking-framework.md) — 判断框架详细示例

## 与其他 skill 的关系

```
blog-growth → 选题 → blog-writer（本 skill）
                        │
                        ├── 封面图
                        │   └── blog-cover-image（AI 生成 cover.webp）
                        │
                        ├── 文本结构化图（首选，可编辑 / 响应式 / 双语独立）
                        │   ├── mermaid（流程图 / 决策树 / 时序图 / 状态机 / ER / 甘特 / 类图 / 思维导图）
                        │   └── architecture（分层系统架构 HTML）
                        │
                        ├── AI 位图（富视觉场景）
                        │   ├── blog-diagram（信息卡 / Bento / 对比矩阵）
                        │   └── blog-illustrator（概念插图 / 场景插画）
                        │
                        └── 专业图表（按需）
                            ├── graphviz / uml / network / bpmn / archimate
                            └── cloud / infographic / infocard / canvas / vega
                     →  blog-distributor（分发）
```

**决策口诀**：能 mermaid 不 architecture，能 architecture 不 AI 生图；一定要 AI 生图时，信息卡走 blog-diagram，插画走 blog-illustrator。

**mermaid 画丑了怎么办**：用户反馈"图丑 / 看不清 / 布局乱"时，**先优化原图不要换技术栈**——查 `.agents/skills/mermaid/references/aesthetics.md`，按顺序检查：① 节点密度（mindmap ≤ 25、subgraph ≤ 5）→ ② 方向 LR/TB（4+ subgraph 必须 TB）→ ③ 主题变量（fontSize/lineColor/theme）→ ④ classDef 三件套（fill+stroke+color）→ ⑤ subgraph 节点数平衡。把原图美化到位远比换成 HTML grid 好——换技术栈 = 推翻重建 = 没听懂"美化"需求。
