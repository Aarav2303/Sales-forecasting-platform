from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

class LeadCreate(BaseModel):
    company_name: str
    industry: Optional[str] = None
    contact_person: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    technology: Optional[str] = None
    status: Optional[str] = "new"

class LeadResponse(LeadCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CompanyAnalysisResponse(BaseModel):
    id: int
    lead_id: int
    company_overview: Optional[str] = None
    business_needs: Optional[str] = None
    opportunities: Optional[str] = None
    industry_analysis: Optional[str] = None
    qualification_score: Optional[float] = None
    recommended_action: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)