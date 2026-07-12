# Contributing

We use feature branches and pull requests. All team members push from their own GitHub accounts.

## Workflow

```bash
git checkout main && git pull origin main
git checkout -b feat/<name>/<short-description>

# make changes, then:
git add .
git commit -m "feat(scope): description"
git push -u origin HEAD
```

Open a pull request targeting `main`. The team lead reviews and merges.

## Commit messages

```
feat|fix|refactor(scope): short imperative description
```

Examples: `feat(api): add user registration`, `fix(web): show email validation error`

## Guidelines

- Pull latest `main` before starting new work
- Do not commit `.env` or secrets
- Do not add Cursor/AI attribution to commits (`Made-with: Cursor`, `Co-authored-by: Cursor`, or `--trailer` flags)
- Validate input on both API and web layers
- Keep changes focused; see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for module ownership
