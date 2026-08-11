import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SAMPLE_DIR = BASE_DIR / "sample_data"
os.makedirs(SAMPLE_DIR, exist_ok=True)

# 1. support_tickets.md
SUPPORT_TICKETS = """# ProductIQ Support Tickets — Q1 2026

[SYNTHETIC RESEARCH DATASET - FOR PRODUCT MANAGEMENT DEMO PURPOSES ONLY]

## Ticket #101 | Customer: Acme Corp (Enterprise)
- **Category**: Onboarding & Configuration
- **Date**: 2026-01-12
- **Summary**: Admin user was unable to invite 15 team members simultaneously.
- **Description**: "When trying to bulk add users via CSV upload, the setup screen froze at 85%. Configuring initial workspace settings took over 45 minutes and required support intervention. We need clearer admin error messaging during onboarding configuration."

## Ticket #102 | Customer: BetaTech (SMB)
- **Category**: Billing & Pricing
- **Date**: 2026-01-15
- **Summary**: Unexpected tier upgrade charge on invoice.
- **Description**: "The final price was higher than expected. Unexpected tier upgrades occurred without clear billing threshold warnings. I didn't understand what I would actually be charged before checkout because our seat count crossed from 10 to 11."

## Ticket #103 | Customer: CloudScale (Enterprise)
- **Category**: Integrations
- **Date**: 2026-01-18
- **Summary**: Slack notification webhook failure.
- **Description**: "We had to build custom Zapier workflows because Jira sync isn't supported out-of-the-box. Real-time Slack alerts for research insights are critical for our product team. We need native Jira and Slack integrations."

## Ticket #104 | Customer: DataPulse (SMB)
- **Category**: Analytics & Reporting
- **Date**: 2026-01-22
- **Summary**: Cannot export survey analytics to PDF.
- **Description**: "Sharing insights with leadership requires manual screenshotting because PDF export is missing. Custom chart filtering by date range is currently unavailable on our SMB plan."

## Ticket #105 | Customer: NextGen Security (Enterprise)
- **Category**: Security & Admin
- **Date**: 2026-02-01
- **Summary**: Request for SAML SSO and Okta integration.
- **Description**: "Our enterprise security policy requires Okta SAML single sign-on. Role-based access control is required so UX researchers can edit without granting billing admin rights."

## Ticket #106 | Customer: FinTech Solutions (Enterprise)
- **Category**: Onboarding Friction
- **Date**: 2026-02-05
- **Summary**: Initial setup checklist confusing.
- **Description**: "The setup checklist was confusing and lacked inline contextual guidance. 14 customer comments in our internal team review mention difficulty completing setup during week 1."
"""

# 2. user_survey.txt
USER_SURVEY = """==================================================
PRODUCTIQ CUSTOMER RESEARCH SURVEY RESPONSES (N=25)
==================================================
[SYNTHETIC RESEARCH DATASET]

Respondent #1 (Product Manager, SMB):
"Onboarding setup is way too complicated. It took 3 days to get our research notes imported and organized. Configuring initial workspace settings took over 45 minutes and required support intervention."

Respondent #2 (UX Researcher, Mid-Market):
"We love the vector search capability, but sharing reports with executive stakeholders is painful. Sharing insights with leadership requires manual screenshotting because PDF export is missing. We urgently need a 1-click executive PDF export feature."

Respondent #3 (Head of Product, Enterprise):
"Our biggest blocker is security compliance. Until ProductIQ supports granular admin role permissions and SAML SSO, we cannot rollout to our 200-person PM org."

Respondent #4 (Startup Founder):
"Pricing is super confusing. The pricing page lists $49/mo, but when we added 2 team members, the invoice jumped to $149/mo without clear warning. Seat count crossed from 10 to 11."

Respondent #5 (Senior PM, Enterprise):
"Integration with Slack and Jira is our #1 feature request. Real-time Slack alerts for research insights are critical for our product team. We want customer feedback quotes automatically converted into Jira user stories."
"""

# 3. enterprise_interviews.md
ENTERPRISE_INTERVIEWS = """# Enterprise Customer Procurement & UX Interviews

Document ID: ENT-2026-Q1
Target Segment: Enterprise (1000+ employees)

## Executive Summary
Enterprise buyers consistently evaluate ProductIQ based on three non-negotiable criteria:
1. Security & SAML SSO Compliance
2. Deep Workflow Integrations (Jira & Slack)
3. Predictable Enterprise Licensing

## Key Interview Findings

### Interview #1: Director of Product Operations @ Fortune 500 Retail
"Our security review flagged two critical items: we require Okta SAML single sign-on and detailed admin audit logs. Without role-based access controls, our legal team will not sign off."

### Interview #2: VP of Product @ Global SaaS Vendor
"We have over 50 PMs and 30 UX researchers. Real-time Slack alerts for research insights are critical for our product team. When a recurring customer pain point hits 10 mentions, we want a notification pushed to #product-insights."

### Interview #3: Enterprise Architect @ Healthcare Tech
"We had to build custom Zapier workflows because Jira sync isn't supported out-of-the-box. We want direct two-way synchronization between research findings and Jira backlog tickets."
"""

# 4. product_feedback.docx representation
PRODUCT_FEEDBACK = """# ProductIQ Product Feedback Synthesis Q1 2026

[SYNTHETIC RESEARCH DATASET FOR PM RAG EVALUATION]

## 1. Onboarding & Initial Setup Experience
Configuring initial workspace settings took over 45 minutes and required support intervention. The setup checklist was confusing and lacked inline contextual guidance. 14 customer comments mention difficulty completing setup during the first week.

## 2. Pricing & Subscription Model
Customers frequently report difficulty understanding pricing before checkout. Unexpected tier upgrades occurred without clear billing threshold warnings. Seat count crossed from 10 to 11 resulting in higher than expected charges.

## 3. Integrations & Workflow Automation
Real-time Slack alerts for research insights are critical for our product team. We had to build custom Zapier workflows because Jira sync isn't supported out-of-the-box.

## 4. Analytics & Reporting Exports
Sharing insights with leadership requires manual screenshotting because PDF export is missing. Custom chart filtering by date range is currently unavailable.
"""

def generate_pdf_bytes() -> bytes:
    content_text = """ProductIQ Customer Interview Transcripts - Q1 2026
[SYNTHETIC DATASET FOR PRODUCT MANAGEMENT RAG EVALUATION]

Sarah Jenkins (Lead PM, E-Commerce):
Configuring initial workspace settings took over 45 minutes and required support intervention.
The setup checklist was confusing and lacked inline contextual guidance.
14 customer comments mention difficulty completing setup during week 1.

Michael Chang (Head of UX, Logistics SaaS):
Sharing insights with leadership requires manual screenshotting because PDF export is missing.
Custom chart filtering by date range is currently unavailable on our SMB plan.

David Ross (VP Product, Fintech Enterprise):
Unexpected tier upgrades occurred without clear billing threshold warnings.
I didn't understand what I would actually be charged before checkout.
Our security team requires Okta SAML single sign-on and role-based access control.
Real-time Slack alerts for research insights are critical for our product team.
We had to build custom Zapier workflows because Jira sync isn't supported out-of-the-box."""
    
    clean_lines = content_text.replace('(', '[').replace(')', ']').split('\n')
    stream_content = "BT /F1 10 Tf 40 700 Td " + " Tj T* ".join(f"({line})" for line in clean_lines) + " Tj ET"
    stream_bytes = stream_content.encode('latin1', errors='replace')
    stream_len = len(stream_bytes)
    
    pdf_template = f"""%PDF-1.4
1 0 obj
<</Type/Catalog/Pages 2 0 R>>
endobj
2 0 obj
<</Type/Pages/Count 1/Kids[3 0 R]>>
endobj
3 0 obj
<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>
endobj
4 0 obj
<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>
endobj
5 0 obj
<</Length {stream_len}>>
stream
{stream_content}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000052 00000 n 
0000000101 00000 n 
0000000212 00000 n 
0000000283 00000 n 
trailer
<</Size 6/Root 1 0 R>>
startxref
420
%%EOF"""
    return pdf_template.encode('latin1')

def generate_sample_dataset():
    with open(SAMPLE_DIR / "support_tickets.md", "w", encoding="utf-8") as f:
        f.write(SUPPORT_TICKETS)

    with open(SAMPLE_DIR / "user_survey.txt", "w", encoding="utf-8") as f:
        f.write(USER_SURVEY)

    with open(SAMPLE_DIR / "enterprise_interviews.md", "w", encoding="utf-8") as f:
        f.write(ENTERPRISE_INTERVIEWS)

    with open(SAMPLE_DIR / "product_feedback.docx", "w", encoding="utf-8") as f:
        f.write(PRODUCT_FEEDBACK)

    with open(SAMPLE_DIR / "customer_interviews.pdf", "wb") as f:
        f.write(generate_pdf_bytes())

    print("Sample dataset regenerated successfully in sample_data/")

if __name__ == "__main__":
    generate_sample_dataset()
