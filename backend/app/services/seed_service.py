import json
from sqlalchemy.orm import Session
from app.core.security import hash_password
from app.db.models.user import User
from app.db.models.citizen_profile import CitizenProfile
from app.db.models.scheme import Scheme
from app.db.models.grievance import Grievance
from app.db.models.grievance_update import GrievanceUpdate


def get_verified_schemes_dataset():
    """
    Controlled, verified dataset of genuine Indian government welfare schemes.
    All portals link strictly to official .gov.in / .nic.in / verified government domains.
    Includes English and Tamil (தமிழ்) localization.
    """
    return [
        Scheme(
            code="SCH_001",
            name="PM Surya Ghar: Muft Bijli Yojana",
            name_ta="பிரதமர் சூர்யா கர்: இலவச மின்சார திட்டம்",
            description="Central government rooftop solar subsidy initiative providing direct financial assistance up to ₹78,000 for residential households to install solar panels and generate free electricity up to 300 units monthly.",
            description_ta="குடியிருப்பு வீடுகளில் சூரிய மின் தகடுகள் நிறுவ ₹78,000 வரை நேரடி மானியம் மற்றும் மாதம் 300 யூனிட் வரை இலவச மின்சாரம் வழங்கும் மத்திய அரசு திட்டம்.",
            state="All-India",
            category="Energy & Sustainability",
            department="Ministry of New and Renewable Energy",
            target_groups="homeowners,all,urban,rural,middle_class",
            eligibility_criteria="• Indian citizen residing in an owned residential property\n• Valid grid-connected electricity connection in applicant's name\n• Adequate unshaded rooftop area suitable for solar panel installation\n• Has not availed previous central solar panel subsidy on the same meter",
            eligibility_criteria_ta="• சொந்த குடியிருப்பு வீட்டில் வசிக்கும் இந்திய குடிமகன்\n• விண்ணப்பதாரர் பெயரில் செல்லுபடியாகும் மின் இணைப்பு\n• சோலார் பேனல் அமைக்க நிழல் இல்லாத கூரை இடம்\n• இதற்கு முன் இந்த மின் இணைப்பில் சோலார் மானியம் பெறாதவராக இருத்தல் வேண்டும்",
            eligibility_rules=json.dumps({
                "min_age": 18,
                "is_homeowner": True,
                "target_groups": ["homeowners", "all"]
            }),
            benefits="• Direct bank transfer subsidy of ₹30,000 for 1kW, ₹60,000 for 2kW, and ₹78,000 for 3kW+ systems\n• Up to 300 units of zero-cost electricity per month\n• Subsidized low-interest bank loans at ~7% for remaining balance",
            benefits_ta="• 1kW-க்கு ₹30,000, 2kW-க்கு ₹60,000, 3kW-க்கு ₹78,000 வரை நேரடி வங்கி மானியம்\n• மாதம் 300 யூனிட் வரை இலவச மின்சாரம்\n• எஞ்சிய தொகைக்கு 7% குறைந்த வட்டியில் வங்கிக் கடன்",
            required_documents="Electricity Bill (latest), Aadhaar Card, Proof of Property Ownership, Bank Account Passbook / Cancelled Cheque, Rooftop Photograph",
            official_portal="https://pmsuryaghar.gov.in",
            application_steps="1. Visit the official National Portal at pmsuryaghar.gov.in and register with state and electricity consumer ID.\n2. Submit residential rooftop details and apply for rooftop solar installation.\n3. Await technical feasibility approval from your local DISCOM.\n4. Install solar plant through a DISCOM-registered empaneled vendor.\n5. Apply for net-metering inspection; upon DISCOM commissioning, receive subsidy directly in bank account within 30 days.",
            application_steps_ta="1. pmsuryaghar.gov.in அதிகாரப்பூர்வ இணையதளத்தில் மின் இணைப்பு எண்ணுடன் பதிவு செய்யவும்.\n2. கூரை விவரங்களை சமர்ப்பித்து விண்ணப்பிக்கவும்.\n3. மின்சார வாரியத்தின் (DISCOM) ஒப்புதல் பெறவும்.\n4. பதிவு பெற்ற நிறுவனத்தின் மூலம் சோலார் அமைக்கவும்.\n5. நெட்-மீட்டர் பொருத்தப்பட்ட 30 நாட்களில் மானியம் நேரடியாக வங்கிக் கணக்கில் வரவு வைக்கப்படும்.",
            source_name="Ministry of New and Renewable Energy (MNRE)",
            source_url="https://pmsuryaghar.gov.in",
            last_verified="2026-08-01",
            is_active=True,
        ),
        Scheme(
            code="SCH_002",
            name="PM-Kisan Samman Nidhi",
            name_ta="பிரதம மந்திரி கிசான் சம்மான் நிதி",
            description="Direct income support scheme providing ₹6,000 per year in three equal 4-monthly installments directly to the bank accounts of all landholding farmer families across India.",
            description_ta="நிலமுள்ள அனைத்து விவசாய குடும்பங்களுக்கும் ஆண்டுக்கு ₹6,000 நிதி உதவி மூன்று தவணைகளாக (தலா ₹2,000) நேரடியாக வங்கிக் கணக்கில் வழங்கும் திட்டம்.",
            state="All-India",
            category="Farmers",
            department="Ministry of Agriculture & Farmers Welfare",
            target_groups="farmers,rural,landholders",
            eligibility_criteria="• Small and marginal farmer families with cultivable landholding registered in revenue records\n• Farmer must possess Aadhaar-seeded bank account\n• Institutional landholders, government employees, and income tax payees are excluded",
            eligibility_criteria_ta="• வருவாய் ஆவணங்களில் சாகுபடி நிலம் வைத்துள்ள விவசாய குடும்பங்கள்\n• ஆதார் இணைக்கப்பட்ட வங்கிக் கணக்கு இருக்க வேண்டும்\n• அரசு ஊழியர்கள் மற்றும் வருமான வரி செலுத்துவோருக்கு பொருந்தாது",
            eligibility_rules=json.dumps({
                "is_farmer": True,
                "target_groups": ["farmers", "rural"]
            }),
            benefits="• ₹6,000 annually paid in three installments of ₹2,000 every 4 months (Direct Benefit Transfer)\n• Financial assistance for seeds, fertilizers, and seasonal agricultural expenses",
            benefits_ta="• ஆண்டுக்கு ₹6,000 (4 மாதங்களுக்கு ஒருமுறை ₹2,000 வீதம் நேரடி வங்கி பரிமாற்றம்)\n• விதை, உரம் மற்றும் விவசாய இடுபொருட்கள் வாங்க நிதி உதவி",
            required_documents="Aadhaar Card, Land Revenue Records (Pahani/Patta/RTC), Bank Passbook with IFSC, Active Mobile Number linked to Aadhaar",
            official_portal="https://pmkisan.gov.in",
            application_steps="1. Visit pmkisan.gov.in or nearest Common Service Center (CSC).\n2. Click 'New Farmer Registration' and enter Aadhaar and State details.\n3. Enter land record survey numbers, khata details, and bank account.\n4. Complete e-KYC via Aadhaar OTP.\n5. District agriculture officer verifies land records; installments start upon approval.",
            application_steps_ta="1. pmkisan.gov.in இணையதளம் அல்லது இ-சேவை மையத்திற்கு செல்லவும்.\n2. 'New Farmer Registration' தேர்வு செய்து ஆதார் எண்ணை உள்ளிடவும்.\n3. நில பட்டா மற்றும் வங்கி விவரங்களை உள்ளிடவும்.\n4. ஆதார் ஓடிபி மூலம் இ-கேஒய்சி முடிக்கவும்.\n5. வேளாண் அதிகாரி சரிபார்த்த பின் தவணைத் தொகை வரவு வைக்கப்படும்.",
            source_name="Ministry of Agriculture & Farmers Welfare",
            source_url="https://pmkisan.gov.in",
            last_verified="2026-08-01",
            is_active=True,
        ),
        Scheme(
            code="SCH_003",
            name="Pradhan Mantri Awas Yojana (PMAY-Urban & Gramin)",
            name_ta="பிரதம மந்திரி ஆவாஸ் யோஜனா (வீட்டு வசதி திட்டம்)",
            description="Flagship central housing mission providing financial subsidies up to ₹2.67 Lakhs on home loans and direct house construction grants for homeless and low-income families.",
            description_ta="வீடற்ற மற்றும் குறைந்த வருவாய் கொண்ட குடும்பங்களுக்கு ₹2.67 லட்சம் வரை வீட்டுக் கடன் வட்டி மானியம் மற்றும் நேரடி கட்டுமான உதவி வழங்கும் மத்திய அரசு திட்டம்.",
            state="All-India",
            category="Housing",
            department="Ministry of Housing and Urban Affairs",
            target_groups="bpl,low_income,homeless,women,urban,rural",
            eligibility_criteria="• Beneficiary family must not own a pucca house anywhere in India\n• Annual household income within EWS (up to ₹3 Lakhs) or LIG (₹3-6 Lakhs) brackets\n• Female head of household ownership or co-ownership mandatory for new homes",
            eligibility_criteria_ta="• இந்தியாவில் எங்கும் சொந்தமாக கான்கிரீட் வீடு இல்லாத குடும்பங்கள்\n• ஆண்டு குடும்ப வருமானம் ₹3 லட்சத்திற்குள் (EWS) அல்லது ₹3-6 லட்சத்திற்குள் (LIG)\n• வீட்டின் உரிமையில் பெண் உறுப்பினரின் பெயர் கட்டாயம்",
            eligibility_rules=json.dumps({
                "max_income": 600000,
                "target_groups": ["bpl", "low_income", "homeless", "women"]
            }),
            benefits="• Up to 6.5% interest subsidy on housing loans up to ₹6 Lakhs (up to ₹2.67 Lakhs net savings)\n• Direct construction assistance of ₹1.5 Lakhs for building house on own plot\n• Water, sanitation, electricity, and LPG gas connections provided under convergence",
            benefits_ta="• வீட்டுக் கடன்களுக்கு 6.5% வரை வட்டி மானியம் (ரூ. 2.67 லட்சம் வரை பயன்)\n• சொந்த இடத்தில் வீடு கட்ட ரூ. 1.50 லட்சம் நேரடி மானியம்\n• குடிநீர், கழிப்பறை, மின்சாரம் மற்றும் காஸ் இணைப்பு ஒருங்கிணைப்பு",
            required_documents="Aadhaar Card, Income Certificate from Tahsildar, BPL Ration Card (if applicable), Land Ownership / Allotment Document, Bank Account Details",
            official_portal="https://pmaymis.gov.in",
            application_steps="1. Visit pmaymis.gov.in or apply through local Urban Local Body (ULB) / Municipality.\n2. Select 'Citizen Assessment' and verify Aadhaar number.\n3. Fill in family details, current address, income, and bank account.\n4. Upload income certificate and land/residence proof.\n5. Track application status with Assessment ID.",
            application_steps_ta="1. pmaymis.gov.in இணையதளம் அல்லது நகராட்சி அலுவலகத்தில் விண்ணப்பிக்கவும்.\n2. 'Citizen Assessment' தேர்வு செய்து ஆதார் விவரங்களை உள்ளிடவும்.\n3. குடும்ப வருமானம் மற்றும் வங்கி விவரங்களை பூர்த்தி செய்யவும்.\n4. வருமான சான்றிதழ் மற்றும் இருப்பிட சான்றுகளை பதிவேற்றவும்.\n5. விண்ணப்ப எண்ணை கொண்டு நிலையை சரிபார்க்கவும்.",
            source_name="Ministry of Housing and Urban Affairs",
            source_url="https://pmaymis.gov.in",
            last_verified="2026-08-01",
            is_active=True,
        ),
        Scheme(
            code="SCH_004",
            name="Pradhan Mantri MUDRA Yojana (PMMY)",
            name_ta="பிரதம மந்திரி முத்ரா கடன் திட்டம்",
            description="Collateral-free institutional microfinance business loan scheme providing up to ₹10 Lakhs in Shishu, Kishore, and Tarun categories to empower micro-enterprises and women entrepreneurs.",
            description_ta="சிறு வணிகர்கள் மற்றும் பெண் தொழில்முனைவோருக்கு எவ்வித பிணையமும் இன்றி ₹10 லட்சம் வரை குறைந்த வட்டியில் தொழில் கடன் வழங்கும் மத்திய அரசு திட்டம்.",
            state="All-India",
            category="Women",
            department="Department of Financial Services, Ministry of Finance",
            target_groups="women,entrepreneurs,self_employed,youth,artisans",
            eligibility_criteria="• Indian citizen having a business proposal for non-farm income-generating activity\n• Manufacturing, processing, trading, or service sector micro-enterprises\n• No prior bank default history in credit bureau records",
            eligibility_criteria_ta="• விவசாயம் அல்லாத சிறு தொழில் அல்லது சேவை வணிகம் தொடங்க விரும்பும் இந்திய குடிமக்கள்\n• உற்பத்தி, விற்பனை, கடை, சேவை தொழில்கள் தொடங்குவோர்\n• வங்கிக் கடன் திருப்பிச் செலுத்தாத பதிவுகள் இல்லாதிருத்தல் வேண்டும்",
            eligibility_rules=json.dumps({
                "min_age": 18,
                "target_groups": ["women", "entrepreneurs", "self_employed", "youth"]
            }),
            benefits="• Shishu Loans: up to ₹50,000 (for new startups/small vendors)\n• Kishore Loans: ₹50,000 to ₹5 Lakhs (for business expansion)\n• Tarun Loans: ₹5 Lakhs to ₹10 Lakhs (for established micro-units)\n• 100% collateral-free with competitive interest rates and MUDRA debit card",
            benefits_ta="• சிசு கடன்: ₹50,000 வரை (புதிய தொழில் தொடங்க)\n• கிஷோர் கடன்: ₹50,000 முதல் ₹5 லட்சம் வரை (தொழில் விரிவாக்கம்)\n• தருண் கடன்: ₹5 லட்சம் முதல் ₹10 லட்சம் வரை\n• பிணையம் இல்லாத கடன் மற்றும் முத்ரா கார்டு",
            required_documents="Proof of Identity (Aadhaar/Voter ID), Proof of Residence, Business Enterprise Registration/Udyam Certificate, Quotation for machinery/equipment to be purchased, Bank Statement for last 6 months",
            official_portal="https://www.mudra.org.in",
            application_steps="1. Prepare business plan and cost estimate for equipment/inventory.\n2. Visit udyamimitra.in or apply directly at any commercial, rural, or cooperative bank branch.\n3. Fill in MUDRA application form with business proposal details.\n4. Submit KYC and business registration documents.\n5. Loan sanctioned and disbursed with MUDRA RuPay Card.",
            application_steps_ta="1. தொழில் திட்டம் மற்றும் தேவையான உபகரணங்களின் விலை பட்டியலை தயார் செய்யவும்.\n2. udyamimitra.in இணையதளம் அல்லது அருகிலுள்ள வங்கிக் கிளையை அணுகவும்.\n3. முத்ரா விண்ணப்பப் படிவத்தை பூர்த்தி செய்து சமர்ப்பிக்கவும்.\n4. ஆவணங்கள் சரிபார்க்கப்பட்டு கடன் ஒப்புதல் வழங்கப்படும்.",
            source_name="Department of Financial Services, Ministry of Finance",
            source_url="https://www.mudra.org.in",
            last_verified="2026-08-01",
            is_active=True,
        ),
        Scheme(
            code="SCH_005",
            name="National Social Assistance Programme (NSAP) Senior Pension",
            name_ta="தேசிய முதியோர் ஓய்வூதியத் திட்டம் (IGNOAPS)",
            description="Monthly direct social security pension support provided to elderly citizens aged 60 and above belonging to below poverty line households.",
            description_ta="வறுமைக் கோட்டிற்கு கீழ் உள்ள 60 வயது மற்றும் அதற்கு மேற்பட்ட முதியோருக்கு மாதந்தோறும் சமூக பாதுகாப்பு ஓய்வூதியம் வழங்கும் திட்டம்.",
            state="All-India",
            category="Senior Citizens",
            department="Ministry of Rural Development",
            target_groups="senior_citizens,elderly,bpl",
            eligibility_criteria="• Applicant must be 60 years of age or older\n• Applicant must belong to a household living Below Poverty Line (BPL) according to official criteria\n• Must have active bank or post office account linked to Aadhaar",
            eligibility_criteria_ta="• விண்ணப்பதாரர் 60 வயது அல்லது அதற்கு மேற்பட்டவராக இருத்தல் வேண்டும்\n• அதிகாரப்பூர்வ வறுமைக் கோட்டிற்கு கீழ் (BPL) உள்ள குடும்பத்தை சேர்ந்தவர்\n• ஆதார் இணைக்கப்பட்ட வங்கிக் கணக்கு இருக்க வேண்டும்",
            eligibility_rules=json.dumps({
                "min_age": 60,
                "is_bpl": True,
                "target_groups": ["senior_citizens", "bpl"]
            }),
            benefits="• Direct monthly pension credited to beneficiary's Jan Dhan bank or post office account\n• Free healthcare convergence under Ayushman Bharat\n• Additional central state top-up based on age (enhanced pension for 80+ years)",
            benefits_ta="• வங்கிக் கணக்கில் நேரடியாக மாத ஓய்வூதியத் தொகை வரவு வைக்கப்படும்\n• ஆயுஷ்மான் பாரத் இலவச மருத்துவ காப்பீட்டு இணைப்பு\n• 80 வயதுக்கு மேற்பட்டோருக்கு கூடுதல் ஓய்வூதிய உதவி",
            required_documents="Aadhaar Card, Age Proof (Birth Certificate / Voter ID / School Certificate), BPL Ration Card, Bank Passbook, Passport Size Photograph",
            official_portal="https://nsap.nic.in",
            application_steps="1. Obtain application form from local Gram Panchayat / Municipal Ward Office or visit nsap.nic.in.\n2. Submit filled form with age proof, BPL card copy, and bank details.\n3. Village Administrative Officer / Municipal Officer conducts field verification.\n4. District Social Welfare Officer sanctions pension order.\n5. Monthly pension is directly credited to bank/post office account.",
            application_steps_ta="1. கிராம பஞ்சாயத்து / நகராட்சி அலுவலகத்தில் விண்ணப்ப படிவத்தை பெறவும்.\n2. வயது சான்று, பி.பி.எல் அட்டை மற்றும் வங்கி கணக்கு நகலுடன் சமர்ப்பிக்கவும்.\n3. கிராம நிர்வாக அதிகாரி சரிபார்ப்பு செய்வார்.\n4. சமூக நலத்துறை அதிகாரி ஓய்வூதிய ஆணை பிறப்பிப்பார்.\n5. மாதந்தோறும் வங்கிக் கணக்கில் பணம் வரவு வைக்கப்படும்.",
            source_name="Ministry of Rural Development",
            source_url="https://nsap.nic.in",
            last_verified="2026-08-01",
            is_active=True,
        ),
        Scheme(
            code="SCH_006",
            name="National Scholarship Portal: Central Sector Scheme for College Students",
            name_ta="தேசிய கல்வி உதவித்தொகை திட்டம் (கல்லூரி மாணவர்கள்)",
            description="Merit-cum-means financial scholarship providing ₹12,000 to ₹20,000 annually to meritorious students from low-income families pursuing regular graduate and post-graduate college degrees.",
            description_ta="குறைந்த வருவாய் குடும்பங்களை சேர்ந்த தகுதியான கல்லூரி மற்றும் பல்கலைக்கழக மாணவர்களுக்கு ஆண்டுக்கு ₹12,000 முதல் ₹20,000 வரை கல்வி உதவித்தொகை வழங்கும் மத்திய அரசு திட்டம்.",
            state="All-India",
            category="Education",
            department="Department of Higher Education, Ministry of Education",
            target_groups="students,youth,college_students",
            eligibility_criteria="• Scored above 80th percentile in relevant stream in Class 12 / Higher Secondary board exam\n• Pursuing regular (non-correspondence) undergraduate or postgraduate degree in a recognized college/university\n• Total gross annual family income must not exceed ₹4.50 Lakhs per annum\n• Must not be availing any other government scholarship",
            eligibility_criteria_ta="• 12-ம் வகுப்பு பொதுத்தேர்வில் 80% க்கும் மேல் மதிப்பெண் பெற்றிருக்க வேண்டும்\n• அங்கீகரிக்கப்பட்ட கல்லூரியில் வழக்கமான இளங்கலை அல்லது முதுகலை படிப்பவர்\n• குடும்ப ஆண்டு வருமானம் ₹4.50 லட்சத்திற்கு மிகாமல் இருக்க வேண்டும்\n• பிற அரசு உதவித்தொகை பெறாதவராக இருத்தல் வேண்டும்",
            eligibility_rules=json.dumps({
                "min_age": 17,
                "max_age": 26,
                "is_student": True,
                "max_income": 450000,
                "target_groups": ["students", "youth"]
            }),
            benefits="• ₹12,000 per annum for the first three years of undergraduate studies\n• ₹20,000 per annum for postgraduate studies and 4th/5th year professional courses\n• Disbursed directly into student's Aadhaar-seeded bank account via Direct Benefit Transfer (DBT)",
            benefits_ta="• இளங்கலை படிப்புகளுக்கு ஆண்டுக்கு ₹12,000 உதவித்தொகை\n• முதுகலை மற்றும் தொழில்முறை படிப்புகளுக்கு ஆண்டுக்கு ₹20,000 உதவித்தொகை\n• மாணவரின் வங்கிக் கணக்கில் நேரடியாக வரவு வைக்கப்படும்",
            required_documents="Class 12 Marksheet, College Admission Bonafide Certificate & College ID, Income Certificate from competent authority, Aadhaar Card, Student's Bank Passbook",
            official_portal="https://scholarships.gov.in",
            application_steps="1. Register on the National Scholarship Portal at scholarships.gov.in using Aadhaar and mobile number.\n2. Fill in student profile and select 'Central Sector Scheme of Scholarships for College and University Students'.\n3. Upload 12th marksheet, income certificate, and college bonafide certificate.\n4. Submit application for institute-level electronic verification.\n5. State education department verifies merit list; scholarship is disbursed via DBT.",
            application_steps_ta="1. scholarships.gov.in இணையதளத்தில் ஆதார் மற்றும் மொபைல் எண்ணுடன் பதிவு செய்யவும்.\n2. கல்லூரி விவரங்கள் மற்றும் திட்டத்தை தேர்வு செய்யவும்.\n3. மதிப்பெண் சான்றிதழ், வருமான சான்று மற்றும் கல்லூரி சான்றிதழை பதிவேற்றவும்.\n4. கல்லூரி மற்றும் கல்வித்துறை சரிபார்ப்புக்கு பின் உதவித்தொகை வங்கிக்கு அனுப்பப்படும்.",
            source_name="Department of Higher Education, Ministry of Education",
            source_url="https://scholarships.gov.in",
            last_verified="2026-08-01",
            is_active=True,
        ),
        Scheme(
            code="SCH_007",
            name="Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
            name_ta="ஆயுஷ்மான் பாரத் பிரதம மந்திரி ஜன் ஆரோக்கிய யோஜனா",
            description="World's largest health assurance scheme providing cashless secondary and tertiary hospitalization cover up to ₹5 Lakhs per family per year across 27,000+ empaneled hospitals.",
            description_ta="ஏழை மற்றும் நடுத்தர குடும்பங்களுக்கு ஆண்டுக்கு ₹5 லட்சம் வரை அரசு மற்றும் தனியார் மருத்துவமனைகளில் இலவச சிகிச்சை வழங்கும் உலகின் மிகப்பெரிய மருத்துவ காப்பீட்டுத் திட்டம்.",
            state="All-India",
            category="Health",
            department="National Health Authority, Ministry of Health and Family Welfare",
            target_groups="bpl,low_income,families,all",
            eligibility_criteria="• Families listed in Socio-Economic Caste Census (SECC) database or active BPL ration card holders\n• Rural households with kutcha walls/roof, landless laborers, or manual workers\n• Urban households in 11 defined occupational categories (drivers, construction workers, domestic staff, etc.)",
            eligibility_criteria_ta="• SECC கணக்கெடுப்பு அல்லது BPL குடும்ப அட்டை உள்ள ஏழை குடும்பங்கள்\n• நிலமற்ற விவசாய கூலிகள், முறைசாரா தொழிலாளர்கள், கட்டிட தொழிலாளர்கள்\n• குடும்பத்தில் உள்ள அனைத்து உறுப்பினர்களுக்கும் பொருந்தும்",
            eligibility_rules=json.dumps({
                "is_bpl": True,
                "target_groups": ["bpl", "low_income", "families"]
            }),
            benefits="• Up to ₹5,00,000 annual cashless hospitalization coverage per family\n• Covers 1,900+ medical procedures, surgeries, ICU, diagnostics, and medicines\n• Zero out-of-pocket expenses at both public and private empaneled hospitals nationwide\n• Pre-existing medical conditions covered from Day 1",
            benefits_ta="• குடும்பத்திற்கு ஆண்டுக்கு ₹5,00,000 வரை இலவச மருத்துவ சிகிச்சை\n• 1,900 க்கும் மேற்பட்ட அறுவை சிகிச்சைகள், மருந்துகள் மற்றும் பரிசோதனைகள்\n• அங்கீகரிக்கப்பட்ட அரசு மற்றும் தனியார் மருத்துவமனைகளில் பணமில்லா சிகிச்சை\n• முந்தைய நோய்களுக்கும் முதல் நாளிலிருந்தே காப்பீடு உண்டு",
            required_documents="Aadhaar Card, BPL Ration Card / NFSA Card, Active Mobile Number for OTP Verification",
            official_portal="https://pmjay.gov.in",
            application_steps="1. Check eligibility online at beneficiary.nha.gov.in or visit any nearest government hospital Ayushman Kiosk.\n2. Authenticate using Aadhaar OTP or biometric scan.\n3. Download and print Ayushman Golden Card.\n4. Present Ayushman Card at any empaneled hospital reception for instant cashless admission.",
            application_steps_ta="1. beneficiary.nha.gov.in இணையதளம் அல்லது அரசு மருத்துவமனையின் ஆயுஷ்மான் மையத்திற்கு செல்லவும்.\n2. ஆதார் ஓடிபி அல்லது கைரேகை மூலம் சரிபார்க்கவும்.\n3. ஆயுஷ்மான் அட்டை (Ayushman Card) பதிவிறக்கம் செய்யவும்.\n4. அங்கீகரிக்கப்பட்ட மருத்துவமனைகளில் அட்டையை காண்பித்து இலவச சிகிச்சை பெறலாம்.",
            source_name="National Health Authority (NHA)",
            source_url="https://pmjay.gov.in",
            last_verified="2026-08-01",
            is_active=True,
        ),
        Scheme(
            code="SCH_008",
            name="PM SVANidhi: Micro-Credit Scheme for Street Vendors",
            name_ta="பிரதம மந்திரி ஸ்வநிதி திட்டம் (தெருவோர வியாபாரிகள் கடன்)",
            description="Affordable working capital collateral-free micro-credit loan scheme providing initial ₹10,000, progressing to ₹20,000 and ₹50,000 with 7% interest subsidy for urban street vendors.",
            description_ta="தெருவோர வியாபாரிகளுக்கு ஆரம்பத்தில் ₹10,000 முதல் ₹50,000 வரை 7% வட்டி மானியத்துடன் பிணையமில்லா தொழிற்கடன் வழங்கும் மத்திய அரசு திட்டம்.",
            state="All-India",
            category="Employment",
            department="Ministry of Housing and Urban Affairs",
            target_groups="street_vendors,self_employed,urban,low_income",
            eligibility_criteria="• Street vendors / hawkers operating in urban areas\n• Possessing Certificate of Vending / Identity Card issued by Urban Local Body (ULB)\n• Vendors identified in ULB survey or having recommendation letter from Town Vending Committee (TVC)",
            eligibility_criteria_ta="• நகர்ப்புறங்களில் தெருவோர வியாபாரம் அல்லது தள்ளுவண்டி வியாபாரம் செய்வோர்\n• உள்ளாட்சி அமைப்பு வழங்கிய விற்பனை அட்டை (Vending ID) வைத்திருப்பவர்கள்\n• நகர்ப்புற விற்பனை குழுவின் பரிந்துரை பெற்றவர்கள்",
            eligibility_rules=json.dumps({
                "min_age": 18,
                "target_groups": ["street_vendors", "self_employed", "urban"]
            }),
            benefits="• 1st Tranche: ₹10,000 working capital loan (1-year tenure)\n• 2nd Tranche: ₹20,000 on timely repayment of 1st loan\n• 3rd Tranche: ₹50,000 for business scale-up\n• 7% interest subsidy credited directly to bank account quarterly + ₹1,200 cashback on digital transactions",
            benefits_ta="• முதல் தவணை: ₹10,000 தொழிற்கடன் (1 ஆண்டு காலம்)\n• சரியான திருப்பிச் செலுத்துதலில் 2-ம் தவணை ₹20,000 மற்றும் 3-ம் தவணை ₹50,000\n• 7% வட்டி மானியம் நேரடியாக வங்கிக் கணக்கில் வரவு\n• டிஜிட்டல் பரிவர்த்தனைகளுக்கு ஆண்டுக்கு ₹1,200 வரை கேஷ்பேக்",
            required_documents="Aadhaar Card, Vending Identity Card / Certificate of Vending, Bank Account Passbook, Proof of UPI / Digital Payment setup (for cashback)",
            official_portal="https://pmsvanidhi.mohua.gov.in",
            application_steps="1. Visit pmsvanidhi.mohua.gov.in or contact nearest CSC / Municipal Ward office.\n2. Verify Aadhaar number and enter Vending ID number.\n3. Select preferred lending institution (bank or microfinance institution).\n4. Submit digital application; bank processes and disburses loan into savings account within 7 days.",
            application_steps_ta="1. pmsvanidhi.mohua.gov.in இணையதளம் அல்லது நகராட்சி அலுவலகத்தை அணுகவும்.\n2. ஆதார் மற்றும் வியாபார அட்டை எண்ணை உள்ளிடவும்.\n3. வங்கியை தேர்வு செய்து விண்ணப்பத்தை சமர்ப்பிக்கவும்.\n4. வங்கி சரிபார்த்து 7 நாட்களுக்குள் கடன் தொகையை கணக்கில் செலுத்தும்.",
            source_name="Ministry of Housing and Urban Affairs",
            source_url="https://pmsvanidhi.mohua.gov.in",
            last_verified="2026-08-01",
            is_active=True,
        ),
        Scheme(
            code="SCH_009",
            name="PM Vishwakarma Scheme (Traditional Artisans & Craftsmen)",
            name_ta="பிரதமர் விஸ்வகர்மா திட்டம் (கைவினைஞர்கள் உதவி)",
            description="Comprehensive scheme offering recognition, modern toolkit incentives up to ₹15,000, enterprise development training, and collateral-free loans up to ₹3 Lakhs at 5% interest for 18 traditional trade craftsmen.",
            description_ta="18 வகையான பாரம்பரிய கைவினைஞர்கள் மற்றும் தொழிலாளர்களுக்கு ₹15,000 கருவி மானியம், பயிற்சி மற்றும் ₹3 லட்சம் வரை 5% குறைந்த வட்டியில் பிணையமில்லா தொழில் கடன் வழங்கும் திட்டம்.",
            state="All-India",
            category="Employment",
            department="Ministry of Micro, Small and Medium Enterprises",
            target_groups="artisans,craftsmen,self_employed,traditional_workers",
            eligibility_criteria="• Artisan or craftsman working on hands-on tools in one of 18 eligible traditional trades (Carpenters, Blacksmiths, Potters, Masons, Tailors, Barbers, Cobblers, Sculptors, etc.)\n• Minimum age of 18 years on the date of application\n• Engaged in trade on self-employment basis; only one member per family eligible",
            eligibility_criteria_ta="• 18 பாரம்பரிய தொழில்களில் (தச்சர், கொல்லர், குயவர், கொத்தனார், தையல்காரர், சிகையலங்கார நிபுணர் போன்றவை) கைகளால் பணிபுரியும் கைவினைஞர்கள்\n• குறைந்தபட்ச வயது 18 ஆண்டுகள்\n• குடும்பத்தில் ஒருவருக்கு மட்டுமே விண்ணப்பிக்க தகுதி உண்டு",
            eligibility_rules=json.dumps({
                "min_age": 18,
                "target_groups": ["artisans", "craftsmen", "self_employed"]
            }),
            benefits="• PM Vishwakarma Certificate & ID Card recognizing official artisan status\n• ₹15,000 e-voucher for purchasing modern trade toolkits\n• 5-7 days basic skill training with ₹500/day stipend\n• Collateral-free enterprise credit: ₹1 Lakh (1st tranche) and ₹2 Lakhs (2nd tranche) at concessional 5% interest rate",
            benefits_ta="• விஸ்வகர்மா அதிகாரப்பூர்வ அடையாள அட்டை மற்றும் சான்றிதழ்\n• நவீன உபகரணங்கள் வாங்க ₹15,000 இ-வவுச்சர் மானியம்\n• தினசரி ₹500 உதவித்தொகையுடன் 5-7 நாட்கள் திறன் பயிற்சி\n• 5% குறைந்த வட்டியில் ₹1 லட்சம் (1-ம் தவணை) மற்றும் ₹2 லட்சம் (2-ம் தவணை) பிணையமில்லா கடன்",
            required_documents="Aadhaar Card, Mobile Number linked to Aadhaar, Bank Account Passbook, Ration Card, Trade Proof / Self-Declaration",
            official_portal="https://pmvishwakarma.gov.in",
            application_steps="1. Visit nearest Common Service Center (CSC) with Aadhaar and mobile phone.\n2. Complete biometric authentication and trade registration on pmvishwakarma.gov.in.\n3. Gram Panchayat / Urban Local Body conducts verification.\n4. Complete basic training at designated skill center and receive ₹15,000 toolkit voucher.\n5. Apply for enterprise development loan at 5% interest via bank.",
            application_steps_ta="1. ஆதார் மற்றும் மொபைல் போனுடன் அருகிலுள்ள இ-சேவை மையத்தை அணுகவும்.\n2. கைரேகை சரிபார்ப்புடன் கைவினைஞர் பதிவை முடிக்கவும்.\n3. உள்ளாட்சி அமைப்பு சரிபார்த்த பின் திறன் பயிற்சி வழங்கப்படும்.\n4. பயிற்சி முடித்து ₹15,000 கருவி மானியம் மற்றும் தொழிற்கடன் பெறலாம்.",
            source_name="Ministry of Micro, Small and Medium Enterprises (MSME)",
            source_url="https://pmvishwakarma.gov.in",
            last_verified="2026-08-01",
            is_active=True,
        ),
        Scheme(
            code="SCH_010",
            name="Karnataka Gruha Jyothi Scheme (Free Domestic Electricity)",
            name_ta="கர்நாடக கிருஹ ஜோதி திட்டம் (இலவச வீட்டு மின்சாரம்)",
            description="State welfare scheme providing up to 200 units of zero-cost electricity every month to all residential households in Karnataka.",
            description_ta="கர்நாடகாவில் உள்ள அனைத்து குடியிருப்பு வீடுகளுக்கும் மாதம் 200 யூனிட் வரை முற்றிலும் இலவச மின்சாரம் வழங்கும் மாநில அரசு திட்டம்.",
            state="Karnataka",
            category="Energy & Sustainability",
            department="Energy Department, Government of Karnataka",
            target_groups="karnataka_residents,all,households,urban,rural",
            eligibility_criteria="• Domestic residential electricity consumer residing in Karnataka (owners and registered tenants eligible)\n• Commercial and industrial connections are strictly excluded\n• Average annual consumption must be within the 200 units threshold limit",
            eligibility_criteria_ta="• கர்நாடகாவில் வசிக்கும் வீட்டு மின் இணைப்பு நுகர்வோர் (சொந்த வீடு மற்றும் வாடகைதாரர்கள்)\n• வணிக மற்றும் தொழில் நிறுவன மின் இணைப்புகளுக்கு பொருந்தாது\n• சராசரி பயன்பாடு 200 யூனிட்டுகளுக்குள் இருக்க வேண்டும்",
            eligibility_rules=json.dumps({
                "state": "Karnataka",
                "target_groups": ["karnataka_residents", "all"]
            }),
            benefits="• Up to 200 units of free electricity every billing month\n• Zero electricity bill (net zero payable) if monthly consumption is within consumer's entitled entitlement quota",
            benefits_ta="• ஒவ்வொரு மாதமும் 200 யூனிட் வரை இலவச மின்சாரம்\n• நிர்ணயிக்கப்பட்ட அளவுக்குள் மின்சாரம் பயன்படுத்தினால் பூஜ்ஜிய மின் கட்டணம் (Zero Bill)",
            required_documents="Aadhaar Card, Electricity Connection Account ID / Meter Consumer Number, Rental Agreement / Property Proof (for tenants), Active Mobile Number",
            official_portal="https://sevasindhuservices.karnataka.gov.in",
            application_steps="1. Visit the Karnataka Seva Sindhu portal at sevasindhuservices.karnataka.gov.in.\n2. Click on 'Gruha Jyothi' application link.\n3. Enter DISCOM name (e.g., BESCOM/MESCOM/HESCOM/GESCOM) and 10-digit Account ID.\n4. Authenticate using consumer Aadhaar number and submit.\n5. Zero-cost entitlement reflects automatically in subsequent monthly electricity bills.",
            application_steps_ta="1. sevasindhuservices.karnataka.gov.in சேவா சிந்து இணையதளத்திற்கு செல்லவும்.\n2. 'Gruha Jyothi' திட்டத்தை தேர்வு செய்யவும்.\n3. மின்சார வாரியம் (BESCOM போன்றவை) மற்றும் மின் கணக்கு எண்ணை உள்ளிடவும்.\n4. ஆதார் எண்ணை உள்ளிட்டு உறுதிப்படுத்தவும்.\n5. அடுத்த மாத மின் கட்டணத்தில் இலவச மின்சார கழிவு தானாக சேர்க்கப்படும்.",
            source_name="Energy Department, Government of Karnataka",
            source_url="https://sevasindhuservices.karnataka.gov.in",
            last_verified="2026-08-01",
            is_active=True,
        ),
    ]


def seed_database(db: Session) -> None:
    """
    Seed initial demonstration data for the CivicOS platform.
    Seeds demo citizens, department officers, realistic grievances, and verified welfare schemes.
    """
    # 1. Check if database is already seeded with users
    if not db.query(User).first():
        # Seed Demo Citizens
        priya = User(
            name="Priya Sharma",
            email="citizen.priya@example.com",
            password_hash=hash_password("demo123"),
            role="citizen",
            department=None,
            state="Karnataka",
            district="Bengaluru Urban",
            preferred_language="en",
        )
        db.add(priya)

        ramesh = User(
            name="Ramesh Patel",
            email="citizen.ramesh@example.com",
            password_hash=hash_password("demo123"),
            role="citizen",
            department=None,
            state="Karnataka",
            district="Mandya",
            preferred_language="en",
        )
        db.add(ramesh)

        # Seed Demo Department Officers
        rajesh = User(
            name="Rajesh Kumar",
            email="officer.rajesh@civicos.gov",
            password_hash=hash_password("demo123"),
            role="officer",
            department="Water_Sanitation",
            state="Karnataka",
            district="Bengaluru Urban",
            preferred_language="en",
        )
        db.add(rajesh)

        anita = User(
            name="Anita Desai",
            email="officer.anita@civicos.gov",
            password_hash=hash_password("demo123"),
            role="officer",
            department="Public_Works",
            state="Karnataka",
            district="Bengaluru Urban",
            preferred_language="en",
        )
        db.add(anita)

        db.commit()
        db.refresh(priya)
        db.refresh(ramesh)
        db.refresh(rajesh)
        db.refresh(anita)

        # Seed Citizen Twin Profiles
        priya_profile = CitizenProfile(
            user_id=priya.id,
            age=32,
            gender="female",
            occupation="Self-Employed / Boutique Owner",
            income_range="2.5L - 5L",
            location="Indiranagar, Bengaluru Urban",
            residence_type="urban",
            family_context="4 members (2 adults, 2 children)",
            is_bpl=False,
            has_disability=False,
            interests="Solar Energy, Women Entrepreneurship, Urban Sanitation",
        )
        db.add(priya_profile)

        ramesh_profile = CitizenProfile(
            user_id=ramesh.id,
            age=48,
            gender="male",
            occupation="Smallholder Farmer",
            income_range="< 2.5L",
            location="Pandavapura, Mandya",
            residence_type="rural",
            family_context="5 members (3 dependents)",
            is_bpl=True,
            has_disability=False,
            interests="Crop Insurance, Micro Irrigation, Solar Water Pump",
        )
        db.add(ramesh_profile)

        # Seed Sample Grievances
        g1 = Grievance(
            tracking_id="GRV-2026-A19F82",
            citizen_id=priya.id,
            title="Severe sewage overflow on 12th Main Road",
            description="The main stormwater drain near 12th Main Indiranagar has backed up and contaminated sewage water is spilling onto the street, creating severe foul smell and health hazard.",
            location="12th Main Road, Indiranagar, Bengaluru",
            landmark="Opposite BDA Complex",
            category="Water & Sanitation",
            priority="HIGH",
            department="Water_Sanitation",
            status="IN_PROGRESS",
            assigned_officer_id=rajesh.id,
            ai_summary="Sewage drain blockage causing overflow on public transit road. Poses sanitation and health risk.",
            urgency_score=0.85,
        )
        db.add(g1)
        db.commit()
        db.refresh(g1)

        db.add(
            GrievanceUpdate(
                grievance_id=g1.id,
                officer_id=None,
                status="SUBMITTED",
                remarks="Grievance filed via CivicOS Citizen App.",
            )
        )
        db.add(
            GrievanceUpdate(
                grievance_id=g1.id,
                officer_id=rajesh.id,
                status="IN_PROGRESS",
                remarks="Sanitation jetting team BWSSB-Unit-4 dispatched to site.",
            )
        )

        g2 = Grievance(
            tracking_id="GRV-2026-B88C14",
            citizen_id=priya.id,
            title="Deep dangerous potholes on 100ft Ring Road",
            description="Multiple large potholes formed after recent rains near the metro pillar 142. Two two-wheelers skidded yesterday.",
            location="100 Feet Ring Road, Indiranagar",
            landmark="Near Metro Pillar 142",
            category="Roads & Infrastructure",
            priority="MEDIUM",
            department="Public_Works",
            status="SUBMITTED",
            assigned_officer_id=anita.id,
            ai_summary="Pothole cluster causing traffic hazard and vehicle damage near metro pillar.",
            urgency_score=0.65,
        )
        db.add(g2)
        db.commit()
        db.refresh(g2)

        db.add(
            GrievanceUpdate(
                grievance_id=g2.id,
                officer_id=None,
                status="SUBMITTED",
                remarks="Grievance submitted by citizen.",
            )
        )
        db.commit()

        g3 = Grievance(
            tracking_id="GRV-2026-C44D91",
            citizen_id=ramesh.id,
            title="Broken canal gate causing agricultural water shortage",
            description="The distributary sluice gate on Canal-7 is jammed, preventing water flow to over 40 acres of paddy crops in Pandavapura.",
            location="Distributary Canal-7, Pandavapura",
            landmark="Near Old Sluice Bridge",
            category="Water & Sanitation",
            priority="CRITICAL",
            department="Water_Sanitation",
            status="SUBMITTED",
            assigned_officer_id=None,
            ai_summary="Canal gate blockage threatening irrigation water supply to 40+ acres of agricultural crops.",
            urgency_score=0.92,
        )
        db.add(g3)
        db.commit()
        db.refresh(g3)

        db.add(
            GrievanceUpdate(
                grievance_id=g3.id,
                officer_id=None,
                status="SUBMITTED",
                remarks="Agricultural grievance filed by citizen.",
            )
        )
        db.commit()

    # 2. Update or Seed Welfare Schemes Dataset
    existing_codes = {s.code for s in db.query(Scheme).all()}
    for scheme in get_verified_schemes_dataset():
        if scheme.code not in existing_codes:
            db.add(scheme)
        else:
            # Update existing scheme record with full verified dataset
            existing = db.query(Scheme).filter(Scheme.code == scheme.code).first()
            if existing:
                existing.name = scheme.name
                existing.name_ta = scheme.name_ta
                existing.description = scheme.description
                existing.description_ta = scheme.description_ta
                existing.state = scheme.state
                existing.category = scheme.category
                existing.department = scheme.department
                existing.target_groups = scheme.target_groups
                existing.eligibility_criteria = scheme.eligibility_criteria
                existing.eligibility_criteria_ta = scheme.eligibility_criteria_ta
                existing.eligibility_rules = scheme.eligibility_rules
                existing.benefits = scheme.benefits
                existing.benefits_ta = scheme.benefits_ta
                existing.required_documents = scheme.required_documents
                existing.official_portal = scheme.official_portal
                existing.application_steps = scheme.application_steps
                existing.application_steps_ta = scheme.application_steps_ta
                existing.source_name = scheme.source_name
                existing.source_url = scheme.source_url
                existing.last_verified = scheme.last_verified
    
    db.commit()
