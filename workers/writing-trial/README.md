# writing-trial collector

A small Cloudflare Worker that receives keystroke recordings from the public typing trial
(ADR 0009, gates G5 and G6). It stores one JSONL file per task in R2. It has no read endpoint.

**Status: built and tested locally only. Not deployed.** No bucket, widget, secret or route exists yet.
Nothing in CI deploys it. `wrangler.trial.toml` is separate from `wrangler.toml` and `wrangler.website.toml`.

## Run locally

```bash
# Cloudflare's published always-pass Turnstile test secret. For local dev only.
echo 'TURNSTILE_SECRET=1x0000000000000000000000000000000AA' > .dev.vars
bunx wrangler dev -c wrangler.trial.toml --local
```

`--local` uses a simulated R2 bucket on disk. `ALLOWED_ORIGIN` in `wrangler.trial.toml` is
`http://localhost:14000` (the dev server). The matching always-pass test site key is
`1x00000000000000000000AA`; the page sends any token and the test secret accepts it.

```bash
curl -i -X POST http://localhost:8787/collect \
  -H 'origin: http://localhost:14000' -H 'content-type: application/json' \
  -d '{"sessionId":"k3J9xQ2mZpT7vLw4Nb8Rc1","taskId":"t1","arm":"A","order":"ABC","device":"desktop",
       "consent":true,"turnstileToken":"x",
       "jsonl":"{\"start\":\"\",\"task\":\"t1\",\"arm\":\"A\",\"participant\":1,\"editor\":\"textarea\"}\n{\"t\":120,\"pos\":0,\"del\":0,\"ins\":\"t\"}\n"}'
```

Unit tests: `bun run test` (spec: `test/unit/writing-trial-collector.spec.ts`).

## `POST /collect`

JSON body:

| Field            | Rule                                                                                                                                                                                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sessionId`      | 16 to 64 characters from `A-Z a-z 0-9 _ -`. Random, made by the page                                                                                                                                                                                                                             |
| `taskId`         | `warmup`, `t1`, `t2` or `t3`                                                                                                                                                                                                                                                                     |
| `arm`            | `A`, `B` or `C`                                                                                                                                                                                                                                                                                  |
| `order`          | The participant's arm order: a permutation of `ABC`, such as `BCA`                                                                                                                                                                                                                               |
| `device`         | `desktop` or `touch`                                                                                                                                                                                                                                                                             |
| `consent`        | Must be the boolean `true`                                                                                                                                                                                                                                                                       |
| `turnstileToken` | Token from the Turnstile widget. Checked against `siteverify`                                                                                                                                                                                                                                    |
| `jsonl`          | The `Recorder` output. Line 1: header `{ start, task?, arm?, participant?, editor?, paste?, hiddenMs?, durationMs?, detect? }` (no other keys; `paste` boolean, `hiddenMs` and `durationMs` non-negative integers, `detect` an array of at most 4 `{ q, answer, correct }` with string, string, boolean; `task` and `arm` must match the fields above). Then at least one `{ t, pos, del, ins }` row: `t`, `pos`, `del` non-negative integers, `t` never decreasing, `ins` a string. At most 512 KB |

| Result                                | Status             |
| ------------------------------------- | ------------------ |
| Stored                                | 201 `{ ok: true }` |
| Missing consent, bad field, bad JSONL | 400                |
| Origin is not `ALLOWED_ORIGIN`        | 403                |
| Turnstile check failed                | 403                |
| Over 512 KB                           | 413                |
| That session and task already stored  | 409 (no overwrite) |
| Any other route or method             | 404                |

Object key: `recordings/<yyyy-mm-dd>/<sessionId>/<taskId>.jsonl` (UTC date). R2 custom metadata:
`arm`, `order`, `device`. The Worker does not read or store the IP address, user agent, other headers or
cookies, and does not forward the visitor IP to Turnstile. CORS is sent only for `ALLOWED_ORIGIN`.

## Before deploy: maintainer approval needed

Each item changes Cloudflare. Create them only after the maintainer approves.

| Resource           | Detail                                                                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R2 bucket          | `zenuml-writing-trial`, with a **lifecycle rule that deletes objects under `recordings/` after 90 days**, set when the bucket is created (the ADR says data is deleted after 90 days) |
| Turnstile widget   | One widget for the trial page hostname. Gives the site key (public, goes in the page) and the secret                                                                                  |
| Secret             | `TURNSTILE_SECRET`, set on the Worker with `wrangler secret put`                                                                                                                      |
| Route or subdomain | A route or custom domain for `zenuml-writing-trial`, or the `workers.dev` URL                                                                                                         |
| Worker deploy      | `wrangler deploy -c wrangler.trial.toml`, with `ALLOWED_ORIGIN` set to the real trial page origin                                                                                     |
