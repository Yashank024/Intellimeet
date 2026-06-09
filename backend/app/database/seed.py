import sys
import os

# Adjust path so we can import Database/models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.db import Database, SessionLocal
from database.models import Employee

def seed_db():
    # Initialize schema first to ensure tables exist
    Database.initialize_schema()
    
    db = SessionLocal()
    try:
        employees = [
            {"name": "Yashank Gupta", "email": "yg421518@gmail.com", "role": "AI Engineer", "team": "IntimeTec"},
            {"name": "Rahul Sharma", "email": "mg5623257@gmail.com", "role": "Backend Engineer", "team": "Engineering"},
            {"name": "Priya Verma", "email": "yashank.gupta.official@gmail.com", "role": "Product Manager", "team": "Product"},
            {"name": "Amit Singh", "email": "eduopoll@gmail.com", "role": "Engineering Manager", "team": "Engineering"},
        ]
        
        for emp_data in employees:
            # Check if employee already exists by email
            existing = db.query(Employee).filter(Employee.email == emp_data["email"]).first()
            if not existing:
                print(f"Seeding employee: {emp_data['name']} ({emp_data['email']})...")
                new_emp = Employee(
                    name=emp_data["name"],
                    email=emp_data["email"],
                    role=emp_data["role"],
                    team=emp_data["team"]
                )
                db.add(new_emp)
            else:
                # Update details if email exists but name or other fields changed
                existing.name = emp_data["name"]
                existing.role = emp_data["role"]
                existing.team = emp_data["team"]
                print(f"Verified/updated employee details for: {emp_data['name']}")
                
        db.commit()
        print("Seeding completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"Seeding failed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
