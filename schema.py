from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict, Field

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


    # --- Milestone 2: OutreachPlan Schemas (Supports POST, GET, PUT /outreach/{lead_id}) ---
class OutreachPlanCreate(BaseModel):
    service_offered: str = "AI & Cloud Solutions"
    tone: str = "professional"
    additional_context: Optional[str] = None


class OutreachPlanUpdate(BaseModel):
    subject: Optional[str] = None
    email_body: Optional[str] = None
    tone: Optional[str] = None
    channel: Optional[str] = None
    follow_up_timing: Optional[str] = None
    strategy: Optional[str] = None
    next_action: Optional[str] = None


class OutreachPlanResponse(BaseModel):
    id: int
    lead_id: int
    recipient: Optional[str] = None
    subject: str
    email_body: str
    tone: str
    channel: str
    follow_up_timing: str
    strategy: str
    next_action: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Milestone 2: LeadScore Schemas ---
class LeadScoreCreate(BaseModel):
    company_growth: int = Field(..., ge=0, le=20)
    industry_match: int = Field(..., ge=0, le=20)
    technology_alignment: int = Field(..., ge=0, le=20)
    business_needs: int = Field(..., ge=0, le=20)
    engagement_level: int = Field(..., ge=0, le=20)


class LeadScoreResponse(LeadScoreCreate):
    id: int
    lead_id: int
    total_score: int
    priority: str
    conversion_probability: Optional[float] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)