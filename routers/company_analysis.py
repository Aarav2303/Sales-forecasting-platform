from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schema, api_service

router = APIRouter(prefix="/analysis", tags=["Company Analysis"])

@router.post("/{lead_id}", response_model=schema.CompanyAnalysisResponse)
def generate_company_analysis(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    ai_result = api_service.analyze_company_with_gemini(lead)

    analysis = models.CompanyAnalysis(
        lead_id=lead.id,
        company_overview=ai_result.get("company_overview", ""),
        business_needs=ai_result.get("business_needs", ""),
        opportunities=ai_result.get("opportunities", ""),
        industry_analysis=ai_result.get("industry_analysis", ""),
        qualification_score=ai_result.get("qualification_score", 0),
        recommended_action=ai_result.get("recommended_action", "")
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis

@router.get("/{lead_id}", response_model=list[schema.CompanyAnalysisResponse])
def get_company_analyses(lead_id: int, db: Session = Depends(get_db)):
    return db.query(models.CompanyAnalysis).filter(models.CompanyAnalysis.lead_id == lead_id).all()