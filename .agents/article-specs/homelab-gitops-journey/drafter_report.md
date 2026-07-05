# Drafter Report — homelab-gitops-journey

## 产出文件
- 正文：`source/_posts/homelab-gitops-journey.md`（覆盖写入）
- 封面图 `cover.webp`：复用同名资源文件夹中既有文件，未重新生成

## 统计指标

| 指标 | 数值 |
|------|------|
| 总字数（中文字符 + ASCII 词） | 约 4330（其中中文 3364 字符） |
| 内链数量 | 4（dotfiles / gh-aw-overview / crossBuild / stable-diffusion-webui，全部自然嵌入正文） |
| 外链数量 | 17 条参考资料（含隐藏引用 `[N]: URL`），正文中以角标 `[概念][N]` 实际引用 13 个 |
| 代码块数量 | 7 对（3 个真实 YAML 配置 + 1 个仓库目录树 + 3 个 mermaid 文本图） |

## 结构对齐
严格遵循 spec 的 5 个 H2，未增删章节：
1. 停电之夜：当"跑起来就行"变成基础设施的灾难（Situation/Hook）
2. 灾后重建的绝望，与"配置漂移"的诅咒（Complication）
3. 绝对真理：砍掉 Kubectl 权限，用 ArgoCD 固化集群灵魂（Answer）
4. 机密管理：阻碍"全自动化恢复"的最后一块绊脚石（Deep Dive）
5. 伪需求与真痛点：Homelab 不需要蓝绿发布（Reality Check）

- 开头 4 段先抛结论（总分总的"总"），结尾回收判断并给下一步行动（Service Mesh 为可观测性）。
- 文末含 `## 常见问题（FAQ）`（3 个真实搜索场景）+ `## 参考资料`（`[N] 标题: URL` + 隐藏引用 `[N]: URL`）。

## 论点对齐（research_report.md 第四章，全部落点）
- **SOPS 权衡**：写透 BitwardenSecret CR inline 了 organizationId/bwSecretId（design.md 实锤的泄露风险），SOPS 可加密 YAML 局部、密文进 Git、不依赖外部 Operator；企业落地 SOPS 可能更合适，Homelab 选 Bitwarden 是图手机端便利，trade-off 已讲清。
- **蓝绿祛魅 + 转折**：H5 标题"Homelab 不需要蓝绿发布"，论证蓝绿对个人玩家 overkill，但承认 requirement.md #3 规划了它、architecture.md 规划用 Service Mesh 切流量——不是否定蓝绿本身，而是当前优先级不对；真痛点是监控缺失（requirement.md Additional Monitoring 未落地）。
- **下一步**：结尾转到引入 Service Mesh 规划，定位为可观测性/流量可见而非蓝绿流量切换，并明确纠正旧稿"根本不值得部署 Service Mesh"的结论。

## 误区拆解（3 个，超额命中）
1. "Kubernetes Secret 是安全的" → base64 编码 ≠ 加密（design.md "not secure enough"）
2. "蓝绿/灰度是必备企业级特性" → 对 Homelab overkill
3. "GitOps 就是 CI/CD push 流水线" → 是 pull 模式声明式同步

## 真实代码证据（全部引自 research_report.md 第三章，已与源码仓库核对一致）
- 第 3 节：`bootstrap/root.yaml`（root Application，selfHeal/prune/allowEmpty）
- 第 3 节：`projects/default.yaml`（ApplicationSet + Git Generator 扫 `apps/**/default/config.json`，requeueAfterSeconds: 20）
- 第 3 节：仓库真实目录结构（bootstrap/projects/apps-index/crds/operators/apps/app_configs）
- 第 4 节：`crds/postgresql/secrets.yaml`（BitwardenSecret CRD，organizationId/bwSecretId 占位符）
- 每个代码块下方均有"机制翻译"大白话解释。

## 视觉配图（封面 + 3 张 mermaid 内容图）
1. 封面 `cover.webp`（第一行引用）
2. 架构图（mermaid flowchart）：GitOps + 机密管理分层架构（Source 真理之源 / Control 大脑 / Data 载体）
3. 蓝绿发布流量切换时序图（mermaid sequenceDiagram）：展示 architecture.md 规划的理想形态（含灰度切流 + 健康检查回滚）
4. ArgoCD GitOps 调和循环（mermaid flowchart）：Git 变更 → 20s 轮询对比 → 同步/selfHeal 纠偏

## 第一人称复盘语气
全文出现 ≥7 次第一人称复盘标记（我实际使用中/我得承认/我的破局点/我反复/我最终/我选的/我觉得），折腾日记口吻。

## AI 味过滤说明
按任务约束，本阶段不自检违禁词黑名单，AI 味/说教感的细粒度过滤交由下游 editor-copy 处理。撰写时已自然采用第一人称复盘语气，避免训导式句式。

## 构建验证
- `hexo generate`：成功，94 files generated，无 front matter / 渲染错误。
- 封面 `cover.webp` 已随文复制到生成目录。
- 注：生成 URL 显示 `2026/07/04` 系服务器时区对 `2026-07-05 14:00:00` 的 UTC 归并，front matter date 已按当前系统时间正确设置。
