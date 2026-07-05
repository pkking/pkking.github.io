# Repository Guidelines

## Project Structure & Module Organization

This is a Hexo blog. Content lives in `source/_posts/` as Markdown posts, usually with a same-name asset folder for images and other post-only files. Site configuration is in `_config.yml` and `_config.next.yml`. Automation and writing rules live under `.agents/`, especially `.agents/skills/blog-writer/` and `.agents/article-specs/`. Generated output goes to `public/` and should not be edited by hand.

## Build, Test, and Development Commands

- `npm run build` or `hexo generate`: build the site and catch render/config issues.
- `npm run clean` or `hexo clean`: clear generated artifacts before a fresh build.
- `npm run server` or `hexo server`: run the local preview server.
- `npm run deploy` or `hexo deploy`: publish the generated site using the configured deployer.

For posts, run `hexo generate` after changing Markdown, front matter, or post assets.

## Coding Style & Naming Conventions

Use UTF-8 Markdown and keep prose concise. Post slugs should be kebab-case, e.g. `github-agentic-workflows.md`. Keep front matter YAML valid and prefer relative asset paths inside each post folder, such as `cover.webp`. For article generation work, keep `article-spec.yml` in `.agents/article-specs/<slug>/article-spec.yml`, not in `source/`.

## Testing Guidelines

There is no separate test suite. Validation is build-based: run `hexo generate` and review the output for broken front matter, missing assets, or render errors. For content changes, verify the rendered page in `hexo server` when the post uses diagrams, images, or other nontrivial markup.

## Commit & Pull Request Guidelines

Keep commit messages short and specific. Recent history uses patterns like `post: ...`, `Fix: ...`, `Perf: ...`, and `[codex] ...`. For PRs, include what changed, why it changed, and the validation used (`hexo generate`, local preview, or other checks). Use a draft PR by default unless the branch is ready for review.

## Agent-Specific Instructions

When regenerating or rewriting a post, follow `.agents/skills/blog-writer/SKILL.md` and refresh the matching `.agents/article-specs/<slug>/article-spec.yml` first. Do not place private generation metadata inside `source/`, because Hexo will publish it.

**CRITICAL MULTI-AGENT ARCHITECTURE DIRECTIVE**:
This project uses a Single-Responsibility Multi-Agent Pipeline for all content generation. **Before modifying any workflow or agent skill, you MUST read `.agents/ARCHITECTURE.md`**.

**Meta-Cognition Protocol for Systemic Fixes**:
When the user points out a recurring flaw in the content (e.g., "The AI forgot to explain the code", "The AI tone is too formal"), **DO NOT blindly append rules to the main `blog-writer` skill.** You MUST execute this checklist:
1. **Diagnosis**: Is this a writing/story-arc issue, or a QA/review issue?
2. **Delegation**: If it requires checking or enforcing a specific rule, you are STRICTLY FORBIDDEN from overloading the Writer.
3. **Routing**: Does this check fit exactly into `editor-copy`, `editor-citation`, `editor-evidence`, or `editor-format`? If yes, update that specific skill.
4. **Cellular Division**: If it's a completely new category of rule, you MUST create a NEW `editor-<name>/SKILL.md` subagent and wire it into the pipeline.

The Writer agent should remain as 'dumb' and focused on narrative as possible. All intelligence regarding quality constraints belongs in the downstream Editor agents.
