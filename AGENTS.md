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
