# DSH API · AI 大模型聚合中转

> 一个 Key，全套顶级模型。Claude / GPT / Gemini / Grok 全量接入，国内直连不用梯子。

## 快速开始

**API Endpoint**

```
https://api.dshapi.icu/v1
```

兼容 OpenAI 与 Anthropic 双协议，Claude Code、Codex CLI、Cherry Studio、NextChat、
LobeChat 以及任何 OpenAI SDK 项目都能直接接入，无需改动代码。

**[→ 在线配置指南与注册入口](https://1261398983.github.io/ai-api-guide/)**

## 配置示例

### Claude Code

```bash
export ANTHROPIC_BASE_URL="https://api.dshapi.icu/v1"
export ANTHROPIC_AUTH_TOKEN="你的Key"
claude
```

### Codex CLI

```bash
export OPENAI_BASE_URL="https://api.dshapi.icu/v1"
export OPENAI_API_KEY="你的Key"
codex
```

或写入 `~/.codex/config.toml`：

```toml
model_provider = "dshapi"

[model_providers.dshapi]
name = "DSH API"
base_url = "https://api.dshapi.icu/v1"
env_key = "OPENAI_API_KEY"
```

### Cherry Studio

设置 → 模型服务 → 添加提供商 → 类型选 OpenAI → API 地址填
`https://api.dshapi.icu/v1` → 填入 Key → 点「检查」拉取模型列表。

### Python

```python
from openai import OpenAI

client = OpenAI(
    api_key="你的Key",
    base_url="https://api.dshapi.icu/v1",
)
resp = client.chat.completions.create(
    model="claude-sonnet-4-5",
    messages=[{"role": "user", "content": "你好"}],
)
print(resp.choices[0].message.content)
```

### curl 自测

```bash
curl https://api.dshapi.icu/v1/chat/completions \
  -H "Authorization: Bearer 你的Key" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-sonnet-4-5","messages":[{"role":"user","content":"hi"}]}'
```

## 特点

- **国内直连** —— 无需科学上网，改一行 base_url 即可切入生产
- **双协议兼容** —— OpenAI 与 Anthropic 格式同时支持
- **按量计费** —— 用多少付多少，余额不过期
- **注册门槛低** —— 仅需 QQ 邮箱，无需海外信用卡
- **完整用量明细** —— 后台可查每次调用的 token 消耗

## 选站 Checklist

- [ ] 是否双协议兼容（OpenAI + Anthropic）
- [ ] 是否按量计费、余额是否过期
- [ ] 是否有稳定的售后响应渠道
- [ ] 支付方式是否本地化
- [ ] 是否提供用量明细

## 常见问题

| 问题 | 说明 |
|---|---|
| 支持哪些模型？ | Claude / GPT / Gemini / Grok 等主流系列，以后台列表为准 |
| 必须用 QQ 邮箱吗？ | 当前注册邮箱后缀白名单为 `@qq.com` |
| 余额会过期吗？ | 按量计费，余额不过期 |
| 接口是标准格式吗？ | 兼容 OpenAI 与 Anthropic 两套协议，SDK 无需魔改 |
| 401 / 404 报错？ | 检查 Key 是否完整、base_url 是否带 `/v1` |

## 在线资源

- **配置指南与注册**：https://1261398983.github.io/ai-api-guide/
- **API 端点**：https://api.dshapi.icu/v1

---

价格与模型可用性以平台后台实际展示为准。
