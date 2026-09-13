# Worker — Cloudflare Workers 后端

## OVERVIEW

Cloudflare Workers + D1 后端服务，为博客提供留言、点赞、阅读量统计 API。

## STRUCTURE

```
worker/
├── src/                    # 核心源码
│   ├── index.ts            # 入口 + 路由分发 + 默认导出
│   ├── d1-repository.ts    # D1 数据库操作实现
│   ├── comment-handler.ts  # 评论创建 handler
│   ├── like-handler.ts     # 点赞切换 handler
│   ├── engagement-handler.ts # 阅读量记录 handler
│   ├── reader-handler.ts   # 数据读取 handler
│   └── contracts/          # Zod schema + TypeScript type
│       └── engagement.ts   # 所有接口类型契约
├── migrations/             # D1 SQL 迁移
│   └── 0001_engagement.sql # 建表 + 索引
├── tsconfig.json           # 独立 tsconfig（不继承根 tsconfig）
└── *.test.ts               # Vitest 单元测试
```

## WHERE TO LOOK

| Concern | Location |
|---------|----------|
| 路由入口 | `src/index.ts` |
| 评论处理 | `src/comment-handler.ts` |
| 点赞处理 | `src/like-handler.ts` |
| 阅读量处理 | `src/engagement-handler.ts` |
| 数据读取 | `src/reader-handler.ts` |
| 数据库层 | `src/d1-repository.ts` |
| 类型契约 | `src/contracts/engagement.ts` |
| 数据库 schema | `migrations/0001_engagement.sql` |

## CONVENTIONS

- **Handler-per-file**：每个 API 操作独立 handler 文件（comment / like / engagement / reader），职责单一
- **Contracts separation**：所有输入输出类型通过 Zod schema 定义在 `contracts/`，handler 和 repository 均依赖这些契约
- **Repository pattern**：`D1EngagementRepository` 实现 `ApiRepository` 接口，handler 通过接口调用，便于测试
- **Error contract**：统一 `{ success, data/error }` 响应结构，错误码枚举在 `EngagementErrorCodeSchema`
- **Testing**：Vitest 单元测试，每个 handler 有对应 `.test.ts`

## ANTI-PATTERNS

- 不要在 handler 中直接写 SQL——数据库查询应封装在 repository 层
- 不要绕过 Zod schema 校验——所有入参必须经过 `safeParse` / `parse`
- 不要返回裸字符串或数字——始终使用约定的 `{ success, data/error }` 结构
- 不要在 `index.ts` 中添加业务逻辑——路由分发只负责匹配路径和方法
- 不要忽略 `recoverable` 字段——前端根据此字段决定是否允许用户重试

## NOTES

- 独立的 `tsconfig.json`，仅扩展 `ES2022` lib 和 `@cloudflare/workers-types`
- D1 迁移需在部署前执行 `wrangler d1 migrations apply`
- 生产环境评论状态默认为 `pending`，本地开发自动 `approved`
- Turnstile 人机验证仅在 production 环境下启用，需配置 `TURNSTILE_SECRET_KEY` 绑定到 `WorkerEnv`
