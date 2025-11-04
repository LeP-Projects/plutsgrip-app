# Docker Setup & Deployment Guide

Complete Docker configuration for development and production environments.

**See [DOCKER_README.md](../DOCKER_README.md) for comprehensive Docker guide.**

This document consolidates:
- Docker Compose configurations
- Image building
- Environment setup
- Production deployment
- Troubleshooting

---

## Quick Navigation

- **Development:** [Start dev environment](#development-environment)
- **Production:** [Deploy to production](#production-environment)
- **Commands:** [Available commands](#commands)
- **Troubleshooting:** [Common issues](#troubleshooting)

---

## Development Environment

See [../DOCKER_README.md#development-setup](../DOCKER_README.md#development-setup) for detailed development setup.

**Quick Start:**
```bash
make up              # Start dev
make logs            # View logs
make down            # Stop
```

---

## Production Environment

See [../DOCKER_README.md#production-setup](../DOCKER_README.md#production-setup) for detailed production setup.

**Important:** Update `.env.prod` before deploying!
```bash
make up ENV=prod     # Start prod
make down ENV=prod   # Stop prod
```

---

## Commands

See [../DOCKER_README.md#available-commands](../DOCKER_README.md#available-commands) for all commands.

---

## Troubleshooting

See [../DOCKER_README.md#troubleshooting](../DOCKER_README.md#troubleshooting) for solutions.

---

**For complete documentation, see [DOCKER_README.md](../DOCKER_README.md)**
