export interface GovernmentUpdate {
  id: string;
  date: string;
  date_ta: string;
  department: string;
  department_ta: string;
  category: 'Notice' | 'Deadline' | 'New Service' | 'Advisory';
  category_ta: string;
  title: string;
  title_ta: string;
  summary: string;
  summary_ta: string;
  source_portal_name: string;
  source_url: string;
}

export const GOVERNMENT_UPDATES: GovernmentUpdate[] = [
  {
    id: 'update-aadhaar-pan',
    date: '15 Aug 2026',
    date_ta: '15 ஆகஸ்ட் 2026',
    department: 'Ministry of Finance & CBDT',
    department_ta: 'நிதி அமைச்சகம் மற்றும் வருமான வரித்துறை',
    category: 'Advisory',
    category_ta: 'அரசு அறிவிப்பு',
    title: 'Mandatory Aadhaar-PAN Linking & Biometric Re-validation Guidelines',
    title_ta: 'ஆதார் - பான் அட்டை இணைப்பு மற்றும் பயோமெட்ரிக் வழிகாட்டுதல்கள்',
    summary: 'Taxpayers are advised to ensure demographic details match exactly between PAN and Aadhaar to prevent TDS discrepancies and inoperative status.',
    summary_ta: 'பான் மற்றும் ஆதார் அட்டைகளில் உள்ள பெயர் மற்றும் பிறந்த தேதி விவரங்கள் ஒரே மாதிரியாக இருப்பதை உறுதி செய்யுமாறு வரி செலுத்துவோர் கேட்டுக்கொள்ளப்படுகிறார்கள்.',
    source_portal_name: 'Income Tax e-Filing Portal',
    source_url: 'https://www.incometax.gov.in',
  },
  {
    id: 'update-scholarships',
    date: '10 Aug 2026',
    date_ta: '10 ஆகஸ்ட் 2026',
    department: 'Ministry of Education & NSP',
    department_ta: 'கல்வி அமைச்சகம் மற்றும் தேசிய உதவித்தொகை தளம்',
    category: 'Deadline',
    category_ta: 'விண்ணப்ப காலக்கெடு',
    title: 'National Scholarship Portal (NSP) AY 2026-27 Applications Open',
    title_ta: 'தேசிய கல்வி உதவித்தொகை தளம் (NSP) 2026-27 விண்ணப்பங்கள் தொடக்கம்',
    summary: 'Central sector and state merit-cum-means scholarship applications are open for pre-matric and post-matric students holding valid income certificates.',
    summary_ta: 'பள்ளி மற்றும் கல்லூரி மாணவர்களுக்கான மத்திய, மாநில கல்வி உதவித்தொகை விண்ணப்பங்கள் தேசிய உதவித்தொகை தளத்தில் தொடங்கப்பட்டுள்ளன.',
    source_portal_name: 'National Scholarship Portal',
    source_url: 'https://scholarships.gov.in',
  },
  {
    id: 'update-solar-subsidy',
    date: '01 Aug 2026',
    date_ta: '01 ஆகஸ்ட் 2026',
    department: 'Ministry of New & Renewable Energy',
    department_ta: 'புதிய மற்றும் புதுப்பிக்கத்தக்க எரிசக்தி அமைச்சகம்',
    category: 'New Service',
    category_ta: 'புதிய திட்டம்',
    title: 'Fast-Track Net Meter Approvals for Residential Rooftop Solar',
    title_ta: 'வீட்டு கூரை சோலார் திட்டத்திற்கு விரைவு நெட்-மீட்டர் அனுமதி',
    summary: 'State electricity distribution companies have initiated a 15-day SLA for feasibility clearances and direct bank account subsidy transfers under PM Surya Ghar.',
    summary_ta: 'பிரதமர் சூர்ய கர் திட்டத்தின் கீழ் வீடுகளுக்கு சோலார் அமைக்கும் விண்ணப்பங்களுக்கு 15 நாட்களுக்குள் ஒப்புதல் வழங்க உத்தரவிடப்பட்டுள்ளது.',
    source_portal_name: 'PM Surya Ghar National Portal',
    source_url: 'https://pmsuryaghar.gov.in',
  },
];
