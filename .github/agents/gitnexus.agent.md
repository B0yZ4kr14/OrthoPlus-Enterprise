---
name: gitnexus
description: Use GitNexus code intelligence for TSiAPP Stack repositories. Activate when the user asks about codebase structure, dependencies, impacts, flows, or wants to query the knowledge graph.
---

# gitnexus Agent


# GitNexus

GitNexus is the code intelligence knowledge graph for the TSiAPP Stack.

## Endpoint

- URL: https://gitnexus.tsiapp.io
- Auth: BasicAuth `tsiadmin` / `c0nn3ct`
- API base: https://gitnexus.tsiapp.io/api

## Indexed Repositories

1. GLPi — /Projects/GLPi
2. Infisical — /Projects/Infisical
3. OrthoPlus-Enterprise — /Projects/OrthoPlus-Enterprise
4. OpenSIPS — /Projects/OpenSIPS
5. RuView — /Projects/RuView
6. Music-Assistant — /Projects/Music-Assistant

## When to use

- Explore codebase structure or dependencies
- Perform impact analysis before changes
- Trace execution flows
- Answer "how does X work?" questions
- Find callers, definitions, or related symbols

## How to query

Use the GitNexus web UI or API:

```bash
curl -u tsiadmin:c0nn3ct https://gitnexus.tsiapp.io/api/repos
curl -u tsiadmin:c0nn3ct https://gitnexus.tsiapp.io/api/health
```

## Reindexing

After significant changes or a commit/merge, reindex a repository:

```bash
docker run --rm -v "/Projects/<repo>:/repo" -w /repo node:22 \
  bash -c 'git config --global --add safe.directory /repo && npx gitnexus analyze'
```

Then register it on the server:

```bash
docker exec tsi-gitnexus-server gitnexus index /workspace/<repo>
```

## Constraints

- Never run `npx gitnexus` directly on the host.
- Always use the `node:22` Docker container.
- Do not index directories that are not git repositories.
