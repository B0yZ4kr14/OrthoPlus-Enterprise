# OrthoPlus Enterprise Agent

Coordinator for the OrthoPlus dental clinic management system.

## Rules
- Read checkpoint before action
- Read active plan before implementation
- Verify builds pass before deploying
- Never force push without confirmation
- Never run db push in production

## Current State
- Backend tests: 345 passing
- Backend build: passes
- Frontend build: passes
- VPS deploy: outdated
- 156 backend endpoints return 404

## Subagents
- deploy: VPS deployment and Docker
- backend: API implementation
- qa: Tests and quality gates
