import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

def build_procureguard_pdf():
    pdf_filename = r"c:\Users\Rohit Reddy\Desktop\tle\ProcureGuard_Platform_and_ML_Models.pdf"
    
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    PRIMARY_NAVY = colors.HexColor('#0f172a')
    SECONDARY_SLATE = colors.HexColor('#1e293b')
    ACCENT_CYAN = colors.HexColor('#0284c7')
    TEXT_DARK = colors.HexColor('#0f172a')
    BG_LIGHT = colors.HexColor('#f8fafc')
    BORDER_COLOR = colors.HexColor('#e2e8f0')

    title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=22, leading=26, textColor=colors.white)
    subtitle_style = ParagraphStyle('DocSubtitle', parent=styles['Normal'], fontName='Helvetica', fontSize=11, leading=15, textColor=colors.HexColor('#e2e8f0'))
    section_heading = ParagraphStyle('SectionHeading', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=14, leading=18, textColor=PRIMARY_NAVY, spaceBefore=14, spaceAfter=6)
    body_style = ParagraphStyle('BodyText', parent=styles['Normal'], fontName='Helvetica', fontSize=9.5, leading=14, textColor=TEXT_DARK, spaceAfter=6)
    bullet_style = ParagraphStyle('BulletText', parent=body_style, leftIndent=12, spaceAfter=4)
    table_header_style = ParagraphStyle('TableHeader', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=colors.white, alignment=TA_CENTER)
    table_cell_style = ParagraphStyle('TableCell', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=11, textColor=TEXT_DARK)
    table_cell_bold = ParagraphStyle('TableCellBold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=PRIMARY_NAVY)

    story = []

    # HEADER BANNER
    header_data = [
        [Paragraph("ProcureGuard Technical & ML Audit Briefing", title_style)],
        [Paragraph("AI-Assisted Public Procurement Anomaly Engine & Model Evaluation<br/><b>Theme:</b> SDG 16 — Peace, Justice & Strong Institutions", subtitle_style)]
    ]
    header_table = Table(header_data, colWidths=[540])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), PRIMARY_NAVY),
        ('TOPPADDING', (0,0), (-1,-1), 16),
        ('BOTTOMPADDING', (0,0), (-1,-1), 16),
        ('LEFTPADDING', (0,0), (-1,-1), 16),
        ('RIGHTPADDING', (0,0), (-1,-1), 16),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 14))

    # 1. ML PIPELINE & 100% ACCURACY AUDIT FINDINGS
    story.append(Paragraph("1. ML Pipeline & 100% Accuracy Audit Analysis", section_heading))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT_CYAN, spaceAfter=8))
    
    audit_text = (
        "<b>Root Cause of 100% Accuracy in Initial Model:</b><br/>"
        "In synthetic dataset generation, feature distributions between normal and anomalous classes were originally completely disjoint "
        "(e.g., <code>bid_spread_variance</code> for anomalies was [0.001, 0.015] vs normal [0.04, 0.15]). A single decision tree split "
        "achieved zero training error because the classes were unrealistically linearly separable.<br/><br/>"
        "<b>Realism Refactoring Applied:</b><br/>"
        "We refactored <code>dataset_generator.py</code> to inject realistic stochastic noise, feature overlap (e.g., normal commodity tenders with low bid spread, "
        "borderline niche sole-bidders), and 3.5% label ambiguity. The dataset was expanded to <b>3,500 samples</b>.<br/><br/>"
        "<b>Audited Model Performance:</b><br/>"
        "• <b>Accuracy:</b> 96.34% | <b>ROC-AUC Score:</b> 0.9314<br/>"
        "• <b>Precision:</b> 94.94% | <b>Recall (Sensitivity):</b> 86.21% | <b>F1-Score:</b> 0.9036"
    )
    story.append(Paragraph(audit_text, body_style))
    story.append(Spacer(1, 10))

    # 2. FEATURE ENGINEERING & IMPORTANCES
    story.append(Paragraph("2. Trained Feature Engineering Matrix & Gini Importances", section_heading))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT_CYAN, spaceAfter=8))

    features_data = [
        [Paragraph("Feature Name", table_header_style), Paragraph("Feature Category", table_header_style), Paragraph("Gini Importance", table_header_style), Paragraph("Mathematical Definition & Anomaly Signal", table_header_style)],
        [Paragraph("rotation_index", table_cell_bold), Paragraph("Sequence Pattern", table_cell_style), Paragraph("<b>21.7%</b>", table_cell_style), Paragraph("Sequence index measuring alternating contract awards among recurring co-bidding vendor groups.", table_cell_style)],
        [Paragraph("relationship_density", table_cell_bold), Paragraph("Graph Linkage", table_cell_style), Paragraph("<b>20.8%</b>", table_cell_style), Paragraph("Density score measuring shared registered address and overlapping corporate directors.", table_cell_style)],
        [Paragraph("vendor_sole_bid_rate", table_cell_bold), Paragraph("Competition", table_cell_style), Paragraph("<b>19.2%</b>", table_cell_style), Paragraph("Proportion of total category awards won by vendor with zero competing bidders.", table_cell_style)],
        [Paragraph("bid_spread_variance", table_cell_bold), Paragraph("Bid Spread", table_cell_style), Paragraph("<b>13.2%</b>", table_cell_style), Paragraph("(Max Bid - Min Bid) / Estimated Value. Low spread indicates cover bidding / artificial price clustering.", table_cell_style)],
        [Paragraph("ratio_to_estimate", table_cell_bold), Paragraph("Price Ratio", table_cell_style), Paragraph("<b>12.9%</b>", table_cell_style), Paragraph("Submitted Bid / Estimated Value. Detects price inflation (>1.15) or predatory under-bidding.", table_cell_style)],
        [Paragraph("win_rate_share", table_cell_bold), Paragraph("Market Share", table_cell_style), Paragraph("<b>8.5%</b>", table_cell_style), Paragraph("Winning vendor's award share in sector (Vendor Wins / Sector Awards).", table_cell_style)],
        [Paragraph("price_z_score", table_cell_bold), Paragraph("Category Benchmark", table_cell_style), Paragraph("<b>3.6%</b>", table_cell_style), Paragraph("(Ratio - Category Mean) / Category StdDev. Category-specific Z-score.", table_cell_style)],
        [Paragraph("single_bidder_flag", table_cell_bold), Paragraph("Indicator Flag", table_cell_style), Paragraph("<b>0.2%</b>", table_cell_style), Paragraph("Binary indicator flag (1 if sole bidder, 0 if multi-bidder tender).", table_cell_style)]
    ]

    features_table = Table(features_data, colWidths=[115, 95, 80, 250])
    features_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SECONDARY_SLATE),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(features_table)
    story.append(Spacer(1, 14))

    # 3. UI CONFIDENCE INTEGRATION
    story.append(Paragraph("3. Prediction Confidence & UI Integration", section_heading))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT_CYAN, spaceAfter=8))
    
    story.append(Paragraph("• <b>Investigation Queue Table:</b> Renders ML Model Confidence % badge inline for every tender in queue.", bullet_style))
    story.append(Paragraph("• <b>Case Detail View:</b> Displays AI & ML Anomaly Attribution card with confidence probability gauge and top feature contributions.", bullet_style))
    story.append(Paragraph("• <b>Settings Lab:</b> Displays ROC-AUC, Accuracy, Precision, Recall metrics cards and retrain button.", bullet_style))

    doc.build(story)
    print(f"Updated ProcureGuard PDF Briefing generated at: {pdf_filename}")

if __name__ == '__main__':
    build_procureguard_pdf()
