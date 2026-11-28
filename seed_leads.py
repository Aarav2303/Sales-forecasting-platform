from database import SessionLocal
import models

SAMPLE_LEADS = [
    {
        "company_name": "TechCorp Solutions",
        "industry": "Enterprise Software",
        "email": "contact@techcorpsolutions.example.com",
        "status": "new",
    },
    {
        "company_name": "CloudScale Systems",
        "contact_person": "Priya Nair",
        "industry": "Cloud Infrastructure",
        "email": "priya.nair@cloudscalesystems.example.com",
        "status": "new",
    },
    {
        "company_name": "FinPulse Technologies",
        "contact_person": "Rohan Kulkarni",
        "industry": "FinTech",
        "email": "rohan.kulkarni@finpulsetech.example.com",
        "status": "contacted",
    },
    {
        "company_name": "MetricFlow Analytics",
        "contact_person": "Ananya Iyer",
        "industry": "Data Analytics",
        "email": "ananya.iyer@metricflow.example.com",
        "status": "interested",
    },
    {
        "company_name": "NexaGrid Logistics",
        "contact_person": "Vikram Menon",
        "industry": "Supply Chain",
        "email": "vikram.menon@nexagrid.example.com",
        "status": "new",
    },
]


def seed():
    db = SessionLocal()
    try:
        added = 0
        for item in SAMPLE_LEADS:
            exists = (
                db.query(models.Lead)
                .filter(models.Lead.email == item["email"])
                .first()
            )
            if not exists:
                db.add(models.Lead(**item))
                added += 1
        db.commit()
        print(f"Seed complete: added {added} new lead(s).")
    finally:
        db.close()


if __name__ == "__main__":
    seed()