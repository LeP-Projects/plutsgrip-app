
import asyncio
import logging
from datetime import date, timedelta
from decimal import Decimal

from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.category import Category, TransactionType
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.goal import Goal
from app.models.recurring_transaction import RecurringTransaction, RecurrenceFrequency
from app.core.security import get_password_hash

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed_data():
    logger.info("Starting database seed...")
    
    async with AsyncSessionLocal() as session:
        try:
            # 1. Create or Get Demo User
            demo_email = "demo@plutusgrip.com"
            from sqlalchemy import select
            stmt = select(User).where(User.email == demo_email)
            result = await session.execute(stmt)
            user = result.scalars().first()

            if not user:
                logger.info("Creating demo user...")
                user = User(
                    email=demo_email,
                    hashed_password=get_password_hash("demo123"),
                    name="Demo User"
                )
                session.add(user)
                await session.flush() # Get ID
                await session.refresh(user)
            else:
                logger.info("Demo user already exists.")

            user_id = user.id

            # 2. Create Categories
            logger.info("Creating categories...")
            categories_map = {} # name -> id

            cats_data = [
                {"name": "Salarial", "type": TransactionType.INCOME, "color": "#4CAF50", "icon": "money"},
                {"name": "Freelance", "type": TransactionType.INCOME, "color": "#8BC34A", "icon": "laptop"},
                {"name": "Aluguel", "type": TransactionType.EXPENSE, "color": "#F44336", "icon": "home"},
                {"name": "Mercado", "type": TransactionType.EXPENSE, "color": "#FF9800", "icon": "cart"},
                {"name": "Transporte", "type": TransactionType.EXPENSE, "color": "#2196F3", "icon": "bus"},
                {"name": "Lazer", "type": TransactionType.EXPENSE, "color": "#9C27B0", "icon": "game"},
            ]

            for cat_data in cats_data:
                stmt = select(Category).where(Category.name == cat_data["name"], Category.user_id == user_id)
                res = await session.execute(stmt)
                cat = res.scalars().first()
                if not cat:
                    cat = Category(**cat_data, user_id=user_id)
                    session.add(cat)
                    await session.flush()
                categories_map[cat.name] = cat.id

            from app.models.budget import BudgetPeriod
            
            # 3. Create Budgets
            logger.info("Creating budgets...")
            budget_data = {
                "amount": 2000.00,
                "start_date": date.today().replace(day=1),
                "category_id": categories_map.get("Mercado"),
                "period": BudgetPeriod.MONTHLY,
                "user_id": user_id
            }
            # Check existing
            # (Skipping check for brevity, just insert if generic logic permits)
            # Ideally distinct constraints handle it, but for seed we assume fresh or ignoring.
            # We'll just add one.
            
            budget = Budget(**budget_data)
            session.add(budget)

            # 4. Create Transactions (Past & Present)
            logger.info("Creating transactions...")
            transactions = [
                # Income
                {"description": "Salário Mensal", "amount": Decimal("5000.00"), "date": date.today().replace(day=5), "type": TransactionType.INCOME, "category_id": categories_map.get("Salarial")},
                {"description": "Projeto Extra", "amount": Decimal("1500.00"), "date": date.today().replace(day=15), "type": TransactionType.INCOME, "category_id": categories_map.get("Freelance")},
                
                # Expenses
                {"description": "Aluguel Apt", "amount": Decimal("1200.00"), "date": date.today().replace(day=10), "type": TransactionType.EXPENSE, "category_id": categories_map.get("Aluguel")},
                {"description": "Compras Semanais", "amount": Decimal("450.50"), "date": date.today().replace(day=12), "type": TransactionType.EXPENSE, "category_id": categories_map.get("Mercado")},
                {"description": "Uber p/ Trabalho", "amount": Decimal("25.90"), "date": date.today().replace(day=13), "type": TransactionType.EXPENSE, "category_id": categories_map.get("Transporte")},
            ]

            for tx_data in transactions:
                tx = Transaction(**tx_data, user_id=user_id)
                session.add(tx)

            # 5. Create Recurring Transactions (Test Item!)
            logger.info("Creating recurring transactions...")
            # This logic mimics service calculation to be safe, or just insert raw
            rec_start = date.today()
            rec_next = rec_start + timedelta(weeks=1) 
            
            recurring = RecurringTransaction(
                user_id=user_id,
                description="Academia",
                amount=Decimal("100.00"),
                currency="BRL",
                type=TransactionType.EXPENSE,
                category_id=categories_map.get("Lazer"),
                frequency=RecurrenceFrequency.MONTHLY,
                start_date=rec_start,
                next_execution_date=rec_next, # Dummy calc
                is_active=True,
                notes="Mensalidade SmartFit"
            )
            session.add(recurring)

            # 6. Create Goals
            logger.info("Creating goals...")
            goal = Goal(
                user_id=user_id,
                name="Viagem Férias",
                target_amount=Decimal("10000.00"),
                current_amount=Decimal("2500.00"),
                deadline=date.today() + timedelta(days=180),
                description="Economia para viagem em Dezembro",
                category="Viagem",
                priority="high"
            )
            session.add(goal)

            await session.commit()
            logger.info("Seed data completed successfully!")

        except Exception as e:
            logger.error(f"Seeding failed: {e}")
            await session.rollback()
            raise

if __name__ == "__main__":
    asyncio.run(seed_data())
