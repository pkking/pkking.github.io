# Homelab GitOps Journey — 研究报告

> 一手来源：GitHub 仓库 `pkking/homelab`（已克隆至 `/tmp/pi-github-repos/pkking/homelab`，源码即真相）。
> 设计文档：`docs/requirement.md`、`docs/architecture.md`、`docs/design.md`。

---

## 一、核心判断对齐（writer 必须严格命中，不得偏离）

项目三份设计文档对"得与失"给出了权威界定，正文论点必须与之下表一致：

### 得（已完成 ✅）
| 维度 | 证据 | 方案 |
|------|------|------|
| 机密管理 | `requirement.md` #1 全部 `[x]` | Bitwarden Secrets Manager Operator |
| GitOps | `requirement.md` #2 全部 `[x]` | ArgoCD + Helm(无状态) / OLM(有状态) / ArgoCD(CRD) |

### 失 / 待办（未完成 ❌）
| 维度 | 证据 | 现状 |
|------|------|------|
| 蓝绿发布 | `requirement.md` #3 全部 `[ ]` 未勾选 | `architecture.md` 规划用 Service Mesh (Istio/Linkerd) 做流量切换，但**未落地** |
| 可观测性 | `requirement.md` "Additional Considerations" 提到 Monitoring/logging 应集成 | **未落地**——这才是真正的痛点 |

---

## 二、关键设计推理（来自 design.md，正文要引用这些"为什么"）

1. **为什么不直接用 Kubernetes Secret**：base64 编码 ≠ 加密，不够安全。→ 可作为**误区拆解 #1**：很多人以为 K8s Secret 是安全的。
2. **为什么选 Bitwarden SM Operator**：原生 k8s 集成、Pod 运行时注入、web 控制台在线编辑、手机端可改密码。
3. **未来计划 - External Secrets Operator**：未来可能切到 AWS Secrets Manager / HashiCorp Vault（通过 external-secrets.io 通用层）。→ 说明架构有演进空间。
4. **未来计划 - SOPS**：`design.md` 明确指出 BitwardenSecret CR 里 inline 了 `organizationId` / `bwSecretId`，**有泄露风险**；SOPS 可加密 YAML 局部、密文直接进 Git，作为未来缓解方案。→ **这条直接支撑 `core_claim`："企业落地时 SOPS 等基于 Git 的加密方案可能比依赖外部 Operator 的方案更合适"**。正文必须写透这个权衡。
5. **ArgoCD 自管理**：用 argo-cd-autopilot，ArgoCD 自身也由 GitOps 管理（root Application 指向 `projects/` 目录）。→ "砍掉 kubectl 权限"的彻底性体现在连 ArgoCD 自己都是声明式拉起的。

---

## 三、真实代码证据（直接引用仓库，不要编造任何配置）

### 3.1 App-of-Apps 根入口（`bootstrap/root.yaml`）
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: root
  namespace: argocd
spec:
  destination:
    namespace: argocd
    server: https://kubernetes.default.svc
  project: default
  source:
    path: projects                          # 根 App 指向 projects/ 目录
    repoURL: https://github.com/pkking/homelab.git
  syncPolicy:
    automated:
      prune: true                           # 删 Git 即删集群资源
      selfHeal: true                        # 手动改动会被自动纠偏
```
**机制翻译**：这是整个集群的"自举入口"。ArgoCD 自己管自己——root App 监视 `projects/` 目录，`selfHeal: true` 意味着任何人对集群的手动 kubectl 改动都会被自动回滚到 Git 声明的状态。

### 3.2 应用批量生成（`projects/default.yaml`，AppProject + ApplicationSet）
```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: default
  namespace: argocd
spec:
  generators:
  - git:
      files:
      - path: apps/**/default/config.json   # 扫描每个应用的配置文件
      repoURL: https://github.com/pkking/homelab.git
      requeueAfterSeconds: 20               # 每 20 秒轮询一次 Git
  template:
    metadata:
      name: default-{{ userGivenName }}
    spec:
      destination:
        namespace: '{{ destNamespace }}'
      source:
        path: '{{ srcPath }}'
        repoURL: '{{ srcRepoURL }}'
      syncPolicy:
        automated: { prune: true, selfHeal: true }
```
**机制翻译**：新增服务 = 往 `apps/<服务名>/default/config.json` 丢一个 JSON 并 push。ApplicationSet 的 Git Generator 每 20 秒扫一次目录，发现新文件就自动生成一个 ArgoCD Application。这就是"丢个 JSON 就能拉起服务"的真相。

### 3.3 集群基础设施生成（`bootstrap/cluster-resources.yaml`）
ApplicationSet + Git Generator，扫描 `bootstrap/cluster-resources/*.json`，动态生成集群级资源（命名空间等）的 Application。

### 3.4 机密注入（`crds/postgresql/secrets.yaml`，BitwardenSecret CRD）
```yaml
apiVersion: k8s.bitwarden.com/v1
kind: BitwardenSecret
metadata:
  name: n8n-user-bw-secret
spec:
  organizationId: "b438a2aa-..."
  authToken:
    secretName: bw-auth-token
    secretKey: token
  map:
    - bwSecretId: b432b279-...        # 占位符，指向 Bitwarden 云端条目
      secretKeyName: username
    - bwSecretId: 67aac42e-...
      secretKeyName: password
```
**机制翻译**：YAML 里写的不是明文密码，而是两个 `bwSecretId` 占位符。Pod 启动时，集群里的 Bitwarden Operator 拿认证 Token 去云端，按 ID 取回真账号密码，在内存里挂载给容器。改密码只需手机 App 操作，集群自动同步。
**风险点（design.md 指出）**：`organizationId` 和 `bwSecretId` 是 inline 明文进 Git 的，等于暴露了机密在 Bitwarden 里的"地址"——这正是未来考虑 SOPS 的动机。

### 3.5 仓库目录结构（真实，非编造）
```
bootstrap/          集群底座：argo-cd/（ArgoCD 自身）、cluster-resources/、root.yaml
projects/           AppProject + ApplicationSet（应用批量生成入口）
apps-index/         Helm umbrella chart：templates/ 含 n8n/postgresql/bitwarden/argo-event/argo-workflow/synology-csi/volume-snapshot 等
app_configs/        各服务 Helm values：*_values.yaml
crds/               CRD 定义：csi/、n8n/、postgresql/（含 secrets.yaml）
operators/          Operator 部署：postgresql/
apps/               各应用目录（供 ApplicationSet 扫描 config.json）
docs/               requirement.md / architecture.md / design.md / bootstrap.md
```

---

## 四、论点对齐速查表（writer 每一条都必须在正文落点）

| spec 要求 | 命中证据 | 立场 |
|-----------|----------|------|
| `core_claim`: 企业 SOPS 可能比外部 Operator 更合适 | design.md "future plan - SOPS" + BitwardenSecret inline ID 泄露风险 | 肯定，写透权衡 |
| `core_claim`: 缺蓝绿+可观测性是隐患 | requirement.md #3 未勾选 + Additional 监控未落地 | 肯定 |
| `story_arc`: 下一步引入 Service Mesh | architecture.md 规划 Istio/Linkerd | 肯定——**为可观测性/流量可见，而非为蓝绿** |
| H5: 蓝绿是伪需求 + 真痛点是监控/回滚 | 蓝绿对个人 overkill；监控缺失是实锤 | 祛魅 + 转折到下一步 |
| H5 标题"Homelab 不需要蓝绿发布" | 个人玩家诉求是"一键拉起/不怕搞坏" | 祛魅，但承认项目规划里有它（requirement #3） |

---

## 五、误区拆解（≥2，writer 必须命中）

1. **"Kubernetes Secret 是安全的"** → 错。base64 编码 ≠ 加密，`design.md` 明确定性"not secure enough"。
2. **"蓝绿/灰度发布是必备的企业级特性"** → 对个人 Homelab 是 overkill。真实痛点不是平滑升级，而是状态可视化与一键回滚的缺失。
3. （可选补充）**"GitOps 就是 CI/CD 流水线"** → GitOps 是 pull 模式声明式同步（ArgoCD 持续拉 Git），不是 push 式 CI。

---

## 六、参考资料（官方链接，已验证）

- 配置漂移: https://en.wikipedia.org/wiki/Configuration_drift
- GitOps: https://www.weave.works/technologies/gitops/
- ArgoCD: https://argo-cd.readthedocs.io/
- ArgoCD ApplicationSet: https://argo-cd.readthedocs.io/en/stable/user-guide/application-set/
- ArgoCD Autopilot: https://argocd-autopilot.readthedocs.io/en/stable/
- SOPS: https://github.com/getsops/sops
- Kubernetes: https://kubernetes.io/
- Kubernetes CRD: https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/
- Kubernetes Pod: https://kubernetes.io/docs/concepts/workloads/pods/
- Helm: https://helm.sh/
- K3s: https://k3s.io/
- n8n: https://n8n.io/
- Bitwarden Secrets Manager Operator: https://bitwarden.com/help/secrets-manager-kubernetes-operator/
- External Secrets Operator: https://external-secrets.io/
- OLM (Operator Lifecycle Manager): https://olm.operatorframework.io/
- Service Mesh: https://en.wikipedia.org/wiki/Service_mesh
- pkking/homelab 源码仓库: https://github.com/pkking/homelab
