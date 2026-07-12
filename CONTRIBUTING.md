# Contributing

Pull requests from feature branches. Each contributor uses their own GitHub account.

## Workflow

```bash
git checkout main && git pull origin main
git checkout -b feat/<name>/<short-description>

# make changes, then:
git add .
git commit -m "feat(scope): description"
git push -u origin HEAD
```

Open a pull request against `main`. A maintainer reviews and merges.

## Commit messages

```
feat|fix|refactor(scope): short imperative description
```

Examples: `feat(api): add vehicle dispatch endpoint`, `fix(web): show validation error on login`

## Guidelines

- Pull latest `main` before starting work
- Do not commit `.env`, secrets, or credentials
- Do not add tool or AI co-author trailers to commits
- Validate input on both API and web layers
- Keep changes focused; see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for module boundaries
