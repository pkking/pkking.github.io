# Article Spec Design

`article-spec.yml` is the durable, machine-readable memory for a blog post. It exists so a later rewrite can reconstruct the same article without depending on the original chat thread.

## Goals

- Make article regeneration reproducible.
- Keep the article's intent, audience, sources, and tone under version control.
- Separate private writing context from published content.
- Give the skill a stable contract so rewrites do not drift across sessions.

## File Location

Store the spec outside `source/` so Hexo does not publish it:

```text
.agents/article-specs/<slug>/article-spec.yml
```

Keep the filename stable. The path is part of the contract.

## Required Fields

- `schema_version`: current schema version, start with `1`
- `slug`: article slug, must match the post filename
- `title`: current article title
- `created_at`: first draft date
- `updated_at`: last material rewrite date
- `original_prompt`: the original writing request, preserved as source context
- `audience`: who this article is for
- `reader_problem`: what confusion or need the reader has
- `core_claim`: the main judgment the article argues
- `positioning`: how this article differs from similar material
- `story_arc`: reader situation, likely misjudgment, conflict, journey, and post-reading action
- `tone`: voice constraints, split into `avoid` and `prefer`
- `concepts`: important concepts, with first-mention policy and explanation
- `sources`: primary and secondary sources used by the article
- `citation_policy`: citation density, preferred source types, and facts that must be cited
- `structure`: total-part-total narrative plan and what reader question each section answers
- `visual_plan`: cover image and in-article visual plan
- `review_passes`: required internal review passes before final acceptance
- `regeneration_policy`: what must be preserved or refreshed on rewrite
- `revision_log`: material rewrite history

## Field Semantics

### `audience`

Describe a concrete reader, not a generic "technical reader". Good examples mention what they know and what they do not know.

### `reader_problem`

Write the question the reader is trying to answer before opening the article. This is usually not the same as the title.

### `core_claim`

Use one sentence. It should be a judgment, not a topic label.

### `story_arc`

Use this to make the article feel written from the reader's side. Record:

- `reader_situation`: the concrete situation before opening the article
- `reader_misjudgment`: the mistaken decision the reader might make and its cost
- `conflict`: the opening tension or counterintuitive point
- `journey`: how the article takes the reader from confusion to judgment
- `action_after_reading`: what the reader should do after reading

The draft should open with scenario, conflict, and judgment. Avoid generic openings such as "in recent years", "with the development of technology", and "this article will explore".

### `tone`

Use this to prevent lecture-like prose and other reading-experience regressions. The `avoid` list should name the tone failure explicitly.

The default voice should feel like reasoning with a peer, not teaching from a podium. Avoid prescriptive phrases such as "you must understand", "obviously", and "let me tell you". Prefer scenario-led paragraphs, concrete trade-offs, and direct but non-didactic conclusions.

### `concepts`

This is where the article records terminology handling. Each concept should say how it is introduced the first time and what it means in this article.

### `sources`

Record the sources that actually support the article. Prefer primary sources. Add the role each source plays so later rewrites can re-check coverage.

Technical and product articles should normally include at least 6 high-quality external sources unless the topic is narrow and the spec explains why fewer sources are enough.

### `citation_policy`

Use this to prevent citation drift. Record:

- `min_external_links`: default `6` for technical/product articles
- `prefer_sources`: official docs, repos, release notes, papers, benchmarks, issues, discussions
- `must_cite`: facts that need sources, such as version status, pricing, performance, security claims, API behavior, product capabilities, and first mentions of external terms

Links should support a claim. A link attached to a term without explanation is not enough.

### `structure`

The structure section is not only the rendered outline. It is the reasoning behind the outline. Each article should use a total-part-total shape:

- opening total: the article's main judgment in the first 150-250 words
- middle parts: evidence, mechanism, comparison, cases, trade-offs, and counterexamples
- closing total: return to the opening judgment and give an action, checklist, or decision frame

Each section should answer a reader question and name its evidence or visual support.

### `visual_plan`

Use this to plan visual rhythm before drafting. The default is:

- 1 cover image
- at least 3 in-article visuals
- one overview or concept map near the beginning
- one flow, architecture, sequence, or comparison visual in the middle
- one decision tree, checklist, or route map before the conclusion

For articles longer than 2500 words, add a visual pause every 800-1000 words. Tables, code blocks, Mermaid diagrams, architecture HTML, and WebP diagrams all count if they reduce reading load.

### `review_passes`

Use this to keep style control inside one skill instead of splitting drafting across multiple agents. The default review passes are:

- `style_pass`: remove AI-like openings, lecture voice, and encyclopedia prose; strengthen reader situation, conflict, and story flow
- `evidence_pass`: verify citations, first-mention links, source quality, and claim support
- `visual_pass`: verify cover image, at least 3 content visuals, and visual rhythm

These are internal passes. Only use real multi-agent review when the user explicitly asks for it.

### `regeneration_policy`

- `preserve_core_claim`: keep the main judgment unless the user explicitly changes direction
- `preserve_slug`: keep the slug stable unless the user requests a rename
- `refresh_date_on_material_change`: update the post `date` when the article is materially rewritten
- `allow_rewrite`: permit rewrites when the current article no longer fits the updated skill
- `require_source_refresh`: re-check sources before rewriting
- `require_tone_pass`: re-run the tone rules before accepting the rewrite
- `keep_article_newcomer_friendly`: keep the article understandable for readers unfamiliar with the topic
- `do_not_restore_whats_next`: do not reintroduce the removed `What's next` section unless the user asks for it

## Invariants

- The spec must be valid YAML.
- The spec must remain in `.agents/`, not in `source/`.
- The spec must match the current article. If the article changes materially, the spec must change too.
- The spec must be readable by the skill without referring back to chat history.

## Drift Control

Use the spec as the source of truth when:

- rewriting an article after changing `blog-writer`
- refreshing a post's tone
- adding or removing concepts
- updating sources
- changing the article's target reader

If the spec and the article disagree, update both. Do not let one silently drift from the other.

## Minimal Example

See [article-spec-template.yml](article-spec-template.yml) for a concrete field template.
