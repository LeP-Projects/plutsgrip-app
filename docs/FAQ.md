# Frequently Asked Questions (FAQ)

Common questions about PlutusGrip.

## 🔧 Installation & Setup

### Q: What are the system requirements?
A: Minimum 4GB RAM, 2 cores CPU, 5GB disk space. Docker & Docker Compose required.

### Q: Can I run PlutusGrip without Docker?
A: Yes, but you'll need Python 3.11+, Node.js 20+, and PostgreSQL 16+ installed locally.

### Q: How do I change the default ports?
A: Edit `docker-compose.dev.yml` or `docker-compose.prod.yml`:
```yaml
services:
  frontend:
    ports:
      - "3000:3000"  # Change left number to your desired port
```

### Q: What if port 5173 is already in use?
A: Change the port in docker-compose file:
```yaml
ports:
  - "5174:5173"  # Use 5174 instead of 5173
```

---

## 🔐 Authentication

### Q: How do I reset my password?
A: Password reset is not yet implemented. It's on the roadmap for Phase 2.

### Q: Can I use OAuth (Google, GitHub login)?
A: Not yet. OAuth support is planned for Phase 3.

### Q: How long does a token last?
A: Access tokens last 30 minutes, refresh tokens last 7 days.

### Q: What happens if my refresh token expires?
A: You'll need to login again. The old refresh token can't be renewed.

---

## 📊 Data & Transactions

### Q: Can I export my data?
A: CSV export is planned for Phase 2.

### Q: Can I import transactions from a bank?
A: Bank integration is planned for Phase 4.

### Q: Is my data encrypted?
A: Yes, connections use HTTPS in production. Passwords are hashed with bcrypt.

### Q: Can I delete a transaction?
A: Yes, use the delete button in the UI or the DELETE endpoint.

### Q: Can I have multiple users share a budget?
A: Not in Phase 1. Shared/collaborative budgets are planned for Phase 3.

---

## 💰 Features

### Q: What currencies are supported?
A: Currently USD, EUR, BRL. Multi-currency conversion is planned for Phase 2.

### Q: Can I set multiple budgets for one category?
A: No, one budget per category. Period (monthly, quarterly, yearly) is configurable.

### Q: How do recurring transactions work?
A: Define a recurring pattern (daily, weekly, monthly, etc.) and the system auto-generates transactions on schedule.

### Q: Can I categorize the same transaction differently later?
A: Yes, edit the transaction and change its category.

---

## 🐛 Troubleshooting

### Q: Docker containers won't start?
A: Check Docker is running, ports aren't in use, and system requirements are met. Run `make status` to see error messages.

### Q: "Connection refused" error?
A: Ensure all containers are running: `make status`. If database isn't ready, wait 10-20 seconds and try again.

### Q: API not responding?
A: Check API logs: `make logs-api`. Verify database is running: `make shell-db` and `SELECT 1`.

### Q: Frontend not loading?
A: Check frontend logs: `make logs-frontend`. Clear browser cache (Ctrl+Shift+Delete) and reload.

### Q: Database migrations failing?
A: The database might be locked. Restart: `make down && make up`. If persists, may need `make clean`.

### Q: "Port already in use" error?
A: Find what's using the port and kill it, or change the port in docker-compose.

---

## 🚀 Deployment

### Q: How do I deploy to production?
A: See [SETUP.md](../SETUP.md#production-setup) for production setup. Use `.env.prod` for production variables.

### Q: Do I need a domain name?
A: Not required for localhost deployment. For remote deployment, yes, a domain is recommended.

### Q: How do I enable HTTPS?
A: Configure SSL certificates in `nginx/prod.conf` and uncomment the HTTPS section.

### Q: What about SSL certificates?
A: Use Let's Encrypt (free). See [10-DEPLOYMENT.md](10-DEPLOYMENT.md) for instructions.

### Q: Can I scale to multiple servers?
A: Not in current Docker Compose setup. Would need Kubernetes or similar orchestration.

---

## 👨‍💻 Development

### Q: How do I run tests?
A: Backend: `make test`. Frontend: `cd plutsgrip-frond-refac && npm test`.

### Q: How do I debug an API endpoint?
A: Use `make logs-api` for logs. Add `import pdb; pdb.set_trace()` in Python code, then access container shell.

### Q: How do I create a database migration?
A: Edit model in `app/models/`, then `make migrate-create NAME="description"`.

### Q: Where do I add a new API endpoint?
A: Create or edit file in `app/api/v1/endpoints/`, implement service, repository, and tests.

### Q: How do I add a new React component?
A: Create file in `src/components/`, write component with types, add tests, and import where needed.

---

## 📚 Documentation

### Q: Where is the API documentation?
A: Automatic Swagger docs at `http://localhost:8000/docs`.

### Q: Is there a mobile app?
A: Not yet. Mobile apps are planned for Phase 3.

### Q: Where can I learn more about architecture?
A: See [02-ARCHITECTURE.md](02-ARCHITECTURE.md) for system design.

### Q: How do I contribute?
A: Read [../CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

---

## 💼 Business & Licensing

### Q: Is PlutusGrip free?
A: Yes, it's MIT licensed and free to use.

### Q: Can I use it commercially?
A: Yes, MIT license allows commercial use. See LICENSE file.

### Q: Can I modify the source code?
A: Yes, you can fork, modify, and distribute under MIT license terms.

### Q: Is there support available?
A: Community support via GitHub issues. Professional support available on request.

---

## 🤝 Community

### Q: How do I report a bug?
A: Open an issue on GitHub with detailed description and reproduction steps.

### Q: Can I suggest a feature?
A: Yes, use GitHub Discussions for feature requests or create an issue.

### Q: How do I contribute code?
A: Fork repository, create feature branch, commit changes, and submit pull request. See [../CONTRIBUTING.md](../CONTRIBUTING.md).

---

## ❓ Other Questions?

**Can't find your answer here?**

1. Check other documentation: [00-INDEX.md](00-INDEX.md)
2. Search GitHub issues for similar questions
3. Join community discussions
4. Create a new GitHub issue

---

**Last Updated:** November 2025 | Keep improving!
