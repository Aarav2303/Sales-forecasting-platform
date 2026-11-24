from typing import Optional
from fastapi import APIRouter, Body, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

import models
import schema
from api_service import generate_outreach_plan
from database import get_db

router = APIRouter(prefix="/outreach", tags=["Outreach"])


class OutreachBundleResponse(BaseModel):
    plan: schema.OutreachPlanResponse
    score: Optional[schema.LeadScoreResponse] = None


def _build_bundle(db: Session, lead_id: int, plan: models.OutreachPlan) -> OutreachBundleResponse:
    latest_score = (
        db.query(models.LeadScore)
        .filter(models.LeadScore.lead_id == lead_id)
        .order_by(models.LeadScore.id.desc())
        .first()
    )
    return OutreachBundleResponse(
        plan=schema.OutreachPlanResponse.model_validate(plan),
        score=schema.LeadScoreResponse.model_validate(latest_score) if latest_score else None,
    )


@router.post("/{lead_id}", response_model=OutreachBundleResponse)
def create_or_regenerate_outreach(
    lead_id: int,
    payload: Optional[schema.OutreachPlanCreate] = Body(default=None),
    db: Session = Depends(get_db),
):
    lead = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    request_data = payload or schema.OutreachPlanCreate()

    analysis = (
        db.query(models.CompanyAnalysis)
        .filter(models.CompanyAnalysis.lead_id == lead_id)
        .order_by(models.CompanyAnalysis.id.desc())
        .first()
    )

    lead_dict = {
        "company_name": lead.company_name,
        "contact_person": lead.contact_person,
        "email": lead.email,
        "phone": lead.phone,
        "website": lead.website,
        "location": lead.location,
        "industry": lead.industry,
        "technology": lead.technology,
        "description": lead.description,
        "status": lead.status,
    }

    analysis_dict = None
    if analysis:
        analysis_dict = {
            "company_overview": analysis.company_overview,
            "business_needs": analysis.business_needs,
            "opportunities": analysis.opportunities,
            "industry_analysis": analysis.industry_analysis,
            "qualification_score": analysis.qualification_score,
            "recommended_action": analysis.recommended_action,
        }

    ai_data = generate_outreach_plan(
        lead_data=lead_dict,
        analysis_data=analysis_dict,
        service_offered=request_data.service_offered,
        tone=request_data.tone,
        additional_context=request_data.additional_context,
    )

    existing_plan = (
        db.query(models.OutreachPlan)
        .filter(models.OutreachPlan.lead_id == lead_id)
        .first()
    )

    recipient = ai_data.get("recipient") or lead.email or lead.contact_person

    if existing_plan:
        existing_plan.recipient = recipient
        existing_plan.subject = ai_data["subject"]
        existing_plan.email_body = ai_data["email_body"]
        existing_plan.tone = ai_data.get("tone") or request_data.tone
        existing_plan.channel = ai_data["channel"]
        existing_plan.follow_up_timing = ai_data["follow_up_timing"]
        existing_plan.strategy = ai_data["strategy"]
        existing_plan.next_action = ai_data["next_action"]
        plan_row = existing_plan
    else:
        plan_row = models.OutreachPlan(
            lead_id=lead_id,
            recipient=recipient,
            subject=ai_data["subject"],
            email_body=ai_data["email_body"],
            tone=ai_data.get("tone") or request_data.tone,
            channel=ai_data["channel"],
            follow_up_timing=ai_data["follow_up_timing"],
            strategy=ai_data["strategy"],
            next_action=ai_data["next_action"],
        )
        db.add(plan_row)

    existing_score = (
        db.query(models.LeadScore)
        .filter(models.LeadScore.lead_id == lead_id)
        .first()
    )

    if existing_score:
        existing_score.company_growth = ai_data["company_growth"]
        existing_score.industry_match = ai_data["industry_match"]
        existing_score.technology_alignment = ai_data["technology_alignment"]
        existing_score.business_needs = ai_data["business_needs"]
        existing_score.engagement_level = ai_data["engagement_level"]
        existing_score.total_score = ai_data["total_score"]
        existing_score.priority = ai_data["priority"]
        existing_score.conversion_probability = ai_data.get("conversion_probability")
        score_row = existing_score
    else:
        score_row = models.LeadScore(
            lead_id=lead_id,
            company_growth=ai_data["company_growth"],
            industry_match=ai_data["industry_match"],
            technology_alignment=ai_data["technology_alignment"],
            business_needs=ai_data["business_needs"],
            engagement_level=ai_data["engagement_level"],
            total_score=ai_data["total_score"],
            priority=ai_data["priority"],
            conversion_probability=ai_data.get("conversion_probability"),
        )
        db.add(score_row)

    db.commit()
    db.refresh(plan_row)
    db.refresh(score_row)

    return OutreachBundleResponse(
        plan=schema.OutreachPlanResponse.model_validate(plan_row),
        score=schema.LeadScoreResponse.model_validate(score_row),
    )


@router.get("/{lead_id}", response_model=OutreachBundleResponse)
def get_outreach(lead_id: int, db: Session = Depends(get_db)):
    plan = (
        db.query(models.OutreachPlan)
        .filter(models.OutreachPlan.lead_id == lead_id)
        .first()
    )
    if not plan:
        raise HTTPException(status_code=404, detail="No outreach plan found for this lead")
    return _build_bundle(db, lead_id, plan)


@router.put("/{lead_id}", response_model=OutreachBundleResponse)
def update_outreach(
    lead_id: int,
    payload: schema.OutreachPlanUpdate,
    db: Session = Depends(get_db),
):
    plan = (
        db.query(models.OutreachPlan)
        .filter(models.OutreachPlan.lead_id == lead_id)
        .first()
    )
    if not plan:
        raise HTTPException(status_code=404, detail="Outreach plan not found")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        if value is not None:
            setattr(plan, field, value)

    db.commit()
    db.refresh(plan)
    return _build_bundle(db, lead_id, plan)