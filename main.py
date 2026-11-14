from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from routers import leads, company_analysis

# Create tables in PostgreSQL automatically on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI-Powered Sales Forecasting Platform - Milestone 1")

# Allow frontend apps to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(leads.router)
app.include_router(company_analysis.router)

@app.get("/")
def root():
    return {"status": "running", "milestone": 1}