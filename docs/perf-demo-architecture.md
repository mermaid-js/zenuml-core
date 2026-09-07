# Perf demo: one repo, three versions, three hosts

How a single git repository serves three versions of @zenuml/core simultaneously: `git worktree` gives each commit its own folder (all sharing one `.git` database), each folder runs its own dev server locally and is built+uploaded to its own Cloudflare Pages project, and the race page embeds two of those deployments as iframes on different sites so Chrome runs them in parallel processes.

```mermaid
flowchart TD
    subgraph REPO["One git repo: mermaid-js/zenuml-core (shared .git object database)"]
        MAIN["commit 2a7beba1<br/>(main)"]
        CLAUDE["branch perf/lexer-predicates<br/>d163803b SLL + db1038ad predicate fix<br/>(on top of claude/affectionate-meitner)"]
        CODEX["branch codex/parser-renderer-performance<br/>7545d512"]
    end

    subgraph WT["git worktree checkouts (folders, throwaway)"]
        W1["/tmp/mmd-demo-main<br/>+ demo UI changes"]
        W2["/tmp/mmd-perf-branch<br/>+ demo UI changes"]
        W3["/tmp/mmd-codex<br/>(vanilla)"]
    end

    MAIN -->|"checked out"| W1
    CLAUDE -->|"checked out"| W2
    CODEX -->|"checked out"| W3

    subgraph LOCAL["Local dev servers (vite)"]
        P0["localhost:14000"]
        P1["localhost:14001"]
        P2["localhost:14002"]
    end

    W1 -->|"bunx vite"| P0
    W2 -->|"bunx vite"| P1
    W3 -->|"bunx vite"| P2

    subgraph CF["Cloudflare Pages projects (static hosting buckets)"]
        CF1["zenuml-perf-main.pages.dev<br/>(build of main, SLOW side)"]
        CF2["zenuml-perf-branch.pages.dev<br/>(build of d163803b, FAST side<br/>⚠ one commit stale: no predicate fix)"]
        CF3["zenuml-perf-race.pages.dev<br/>(race page only, no core code)"]
    end

    W1 -->|"build:site → wrangler deploy"| CF1
    W2 -->|"build:site → wrangler deploy"| CF2
    RACE["/tmp/race-deploy/index.html<br/>(scoreboard + benchmark code)"] -->|"wrangler deploy"| CF3

    CF3 -->|"iframe ?demo=1"| CF1
    CF3 -->|"iframe ?demo=1"| CF2

    CF1 -.->|"separate site →<br/>own Chrome process"| NOTE["parallel race:<br/>postMessage re-render both,<br/>each frame reports wallMs back"]
    CF2 -.-> NOTE
```

Key points the picture encodes:

1. **There is no fork.** All three versions are commits in the *same* repository; `git worktree` lets multiple commits be checked out at once, each in its own folder, sharing one object database. Delete a folder and the commits survive.
2. **The codex version exists only locally** (worktree + port 14002). It was benchmarked but never deployed — the hosted race compares main vs the claude branch only.
3. **Cloudflare projects are dumb buckets.** Each receives a built `dist/` upload; they have no link back to git. Three exist because `*.pages.dev` subdomains are separate *sites*, which is what forces Chrome to give the two iframes separate renderer processes — the thing that makes the race genuinely parallel.
4. **The race page is the only piece not in the repo** — it lives in `/tmp/race-deploy/` (hosted variant) and `public/compare-perf.html` (local variant, in the demo worktrees), currently uncommitted.
