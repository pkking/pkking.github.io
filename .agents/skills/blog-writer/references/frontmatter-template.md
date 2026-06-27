# Front Matter 模板

Hexo + Next 主题，YAML 格式（`---` 分隔）。文章为 `source/_posts/<slug>.md`，资源放同名文件夹 `source/_posts/<slug>/`（`post_asset_folder: true`）。

## 文章版（`source/_posts/<slug>.md`）

```yaml
---
title: 文章标题（50-60 字符，核心关键词前置，含数字/年份更佳）
date: 2026-06-27 10:00:00
tags:
  - tag1
  - tag2
  - tag3
categories:
  - AI
description: SEO 描述，直接回答用户搜索问题（120-160 字符，含核心关键词）
keywords: 关键词1, 关键词2, 长尾搜索词
cover: cover.webp
---
```

正文第一行引用封面图：

```markdown
![含核心关键词的 ALT 描述](cover.webp)
```

> `post_asset_folder: true` 下，`cover.webp` 放在 `source/_posts/<slug>/cover.webp`，正文用相对路径 `![](cover.webp)` 引用即可；Next 的 `cover:` 字段用于首页/列表页展示封面缩略图。

## 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | 是 | 50-60 字符，关键词前置 |
| `date` | 是 | `YYYY-MM-DD HH:mm:ss`，时区跟随站点 `Asia/Shanghai` |
| `tags` | 是 | 3-5 个标签 |
| `categories` | 否 | Hexo 分类；新文章按需添加（会生成 `/categories/<分类>/` 归档页）|
| `description` | 推荐 | 120-160 字符，SEO 摘要（Next 用于 meta description）|
| `keywords` | 推荐 | 逗号分隔，SEO 补充关键词 |
| `cover` | 推荐 | 封面图相对路径，首页列表展示 |
| `draft` | 否 | `true` 为草稿不发布，默认 `false` |
| `toc` | 否 | Next 全局已开 TOC（`_config.next.yml`），单篇可 `toc: false` 关闭 |

## FAQ（正文 section，不是 front matter）

Next 主题没有 Hugo hermit-V2 的 `[[params.faqItems]]` 结构化字段。FAQ 直接写成正文章节：

```markdown
## 常见问题（FAQ）

### Claude Code 和 Cursor 有什么区别？

Claude Code 是终端原生的 Agent，适合多文件重构；Cursor 是 IDE 内嵌，适合行内补全。两者定位不同，不是替代关系。

### Claude Code 怎么收费？

按 API 用量计费，Max 套餐每月 $200。具体见官方定价页。
```

每篇 3-5 个 FAQ，问题用用户真实搜索句式。如需 FAQ 结构化数据（schema.org JSON-LD）提升搜索富摘要，需自定义主题模板注入，作为可选增强。

## 关键规则

- 封面图放 `source/_posts/<slug>/cover.webp`，正文第一行 `![ALT](cover.webp)` 引用
- 图片一律相对路径（post_asset_folder 模式）；全局共享图放 `source/images/` 用 `/images/xxx.png`
- 默认写中文版（站点 `language: zh-CN`）；英文版作为可选，需额外配置 Hexo 多语言插件，另行发布
- `tags` 用英文或中文均可，保持一致
- permalink 跟随站点 `:year/:month/:day/:title/`，URL 为 `https://pkking.github.io/:year/:month/:day/:slug/`
