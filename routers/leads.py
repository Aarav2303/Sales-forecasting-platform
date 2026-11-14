from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schema

router = APIRouter(prefix="/leads", tags=["Leads"])

@router.post("/", response_model=schema.LeadResponse)
def create_lead(lead: schema.LeadCreate, db: Session = Depends(get_db)):
    db_lead = models.Lead(**lead.model_dump())
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead

@router.get("/", response_model=List[schema.LeadResponse])
def get_all_leads(db: Session = Depends(get_db)):
    return db.query(models.Lead).all()

@router.get("/{lead_id}", response_model=schema.LeadResponse)
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead