import { Language, TranslationDict } from './translations';
import { DepartmentType } from '../types/api';

/**
 * Maps backend department values to clean localized presentation text
 */
export function getLocalizedDepartment(dept: DepartmentType | string | null | undefined, t: TranslationDict): string {
  if (!dept) return t.deptMunicipal;

  const normalized = dept.trim().toLowerCase().replace(/[\s_-]+/g, '');
  if (normalized.includes('water') || normalized.includes('sanitation')) {
    return t.deptWater;
  }
  if (normalized.includes('publicwork') || normalized.includes('road')) {
    return t.deptRoads;
  }
  if (normalized.includes('electric') || normalized.includes('energy') || normalized.includes('power')) {
    return t.deptElectricity;
  }
  if (normalized.includes('health') || normalized.includes('sanitary')) {
    return t.deptHealth;
  }
  if (normalized.includes('waste') || normalized.includes('garbage')) {
    return t.deptWaste;
  }
  if (normalized.includes('municipal') || normalized.includes('corp')) {
    return t.deptMunicipal;
  }
  return dept;
}

const CATEGORY_TRANSLATIONS: Record<string, { en: string; ta: string }> = {
  'water & sanitation': { en: 'Water & Sanitation', ta: 'நீர் மற்றும் சுகாதாரம்' },
  'water supply & sanitation': { en: 'Water Supply & Sanitation', ta: 'நீர் மற்றும் சுகாதாரம்' },
  'water supply': { en: 'Water Supply', ta: 'குடிநீர் வழங்கல்' },
  'water leakage': { en: 'Water Leakage', ta: 'குடிநீர் கசிவு' },
  'drinking water': { en: 'Drinking Water', ta: 'குடிநீர்' },
  'contaminated water': { en: 'Contaminated Water', ta: 'மாசுபட்ட குடிநீர்' },
  'drainage & sewage': { en: 'Drainage & Sewage', ta: 'வடிகால் & கழிவுநீர்' },
  'drainage issue': { en: 'Drainage Issue', ta: 'வடிகால் பிரச்சனை' },
  'sewage leakage': { en: 'Sewage Leakage', ta: 'கழிவுநீர் கசிவு' },
  'roads & infrastructure': { en: 'Roads & Infrastructure', ta: 'பொதுப்பணித்துறை (சாலைகள்)' },
  'public works': { en: 'Public Works', ta: 'பொதுப்பணித்துறை' },
  'road maintenance': { en: 'Road Maintenance', ta: 'சாலை பராமரிப்பு' },
  'potholes': { en: 'Potholes', ta: 'சாலை குழிகள்' },
  'pothole repair': { en: 'Pothole Repair', ta: 'சாலை குழி பழுது' },
  'waste management': { en: 'Waste Management', ta: 'கழிவு மேலாண்மை' },
  'garbage': { en: 'Garbage', ta: 'குப்பை கழிவு' },
  'garbage overflow': { en: 'Garbage Overflow', ta: 'குப்பை தேக்கம்' },
  'solid waste': { en: 'Solid Waste Management', ta: 'திடக்கழிவு மேலாண்மை' },
  'electricity & energy': { en: 'Electricity & Energy', ta: 'மின்சாரம் & ஆற்றல்' },
  'electricity': { en: 'Electricity', ta: 'மின்சாரம்' },
  'power supply': { en: 'Power Supply', ta: 'மின் விநியோகம்' },
  'power outage': { en: 'Power Outage', ta: 'மின் தடை' },
  'streetlights': { en: 'Street Lighting', ta: 'தெருவிளக்குகள்' },
  'street lighting': { en: 'Street Lighting', ta: 'தெருவிளக்குகள்' },
  'public health': { en: 'Public Health', ta: 'பொது சுகாதாரம்' },
  'health': { en: 'Healthcare & Sanitation', ta: 'சுகாதாரம்' },
  'municipal services': { en: 'Municipal Services', ta: 'மாநகராட்சி சேவைகள்' },
  'civic amenities': { en: 'Civic Amenities', ta: 'குடிமை வசதிகள்' },
  'education': { en: 'Education', ta: 'கல்வி' },
  'farmers': { en: 'Farmers', ta: 'விவசாயிகள்' },
  'women': { en: 'Women', ta: 'பெண்கள்' },
  'housing': { en: 'Housing', ta: 'வீட்டு வசதி' },
  'employment': { en: 'Employment', ta: 'வேலைவாய்ப்பு' },
  'senior citizens': { en: 'Senior Citizens', ta: 'முதியோர் நலம்' },
  'energy & sustainability': { en: 'Energy & Sustainability', ta: 'சூரிய மின்சாரம் & ஆற்றல்' },
  'general': { en: 'General', ta: 'பொதுப் பிரிவு' },
};

/**
 * Returns localized category label
 */
export function getLocalizedCategory(category: string | null | undefined, language: Language): string {
  if (!category) return language === 'ta' ? 'பொதுப் பிரிவு' : 'General';
  const key = category.trim().toLowerCase();
  if (CATEGORY_TRANSLATIONS[key]) {
    return CATEGORY_TRANSLATIONS[key][language];
  }
  return category;
}

// -------------------------------------------------------------
// DYNAMIC GRIEVANCE TITLES DICTIONARY & PATTERN ENGINE
// -------------------------------------------------------------
const TITLE_DICTIONARY: Record<string, string> = {
  'severe water contamination near colony pump': 'குடியிருப்பு பகுதி குடிநீர் குழாயில் கடுமையான நீர் மாசுபாடு',
  'severe water pipe leakage near 4th cross main road': '4வது குறுக்கு பிரதான சாலையில் கடுமையான குடிநீர் குழாய் கசிவு',
  'severe drain leakage and foul sewage odor near market': 'சந்தைக்கு அருகில் கடுமையான கழிவுநீர் கசிவு மற்றும் துர்நாற்றம்',
  'broken main water valve near water tank': 'நீர் தொட்டி அருகே பிரதான நீர் வால்வு பழுதடைந்துள்ளது',
  'large deep pothole causing traffic jam near market road': 'சந்தை சாலையில் போக்குவரத்து நெரிசலை ஏற்படுத்தும் பெரிய சாலை குழி',
  'garbage overflow and uncleared waste near community park': 'சமூக பூங்கா அருகே குப்பை தேக்கம் மற்றும் அகற்றப்படாத கழிவுகள்',
  'power outage and non-functioning streetlights on 7th avenue': '7வது அவென்யூவில் மின் தடை மற்றும் எரியாத தெருவிளக்குகள்',
  'severe sewage overflow on 12th main road': '12வது மெயின் ரோட்டில் கடுமையான கழிவுநீர் பெருக்கெடுத்து ஓடுகிறது',
  'deep dangerous potholes on 100ft ring road': '100 அடி ரிங் ரோட்டில் ஆழமான ஆபத்தான சாலை குழிகள்',
  'broken canal gate causing agricultural water shortage': 'கால்வாய் மதகு உடைப்பால் விவசாய நீர் தட்டுப்பாடு',
  'garbage not collected': 'குப்பை சேகரிக்கப்படவில்லை',
  'overflowing drain on main road': 'பிரதான சாலையில் கழிவுநீர் பெருக்கெடுத்து ஓடுகிறது',
  'damaged street light pole': 'சேதமடைந்த தெருவிளக்கு கம்பம்',
  'contaminated drinking water in residential pipeline': 'குடியிருப்பு விநியோக குழாயில் மாசுபட்ட குடிநீர்',
};

export function getLocalizedTitle(title: string | null | undefined, language: Language): string {
  if (!title) return '';
  if (language === 'en') return title;

  const key = title.trim().toLowerCase();
  if (TITLE_DICTIONARY[key]) {
    return TITLE_DICTIONARY[key];
  }

  let translated = title;
  const replacements: [RegExp, string][] = [
    [/severe water contamination/gi, 'கடுமையான குடிநீர் மாசுபாடு'],
    [/water contamination/gi, 'குடிநீர் மாசுபாடு'],
    [/severe water pipe leakage/gi, 'கடுமையான குடிநீர் குழாய் கசிவு'],
    [/water pipe leakage/gi, 'குடிநீர் குழாய் கசிவு'],
    [/water leakage/gi, 'குடிநீர் கசிவு'],
    [/drain leakage/gi, 'கழிவுநீர் கசிவு'],
    [/severe sewage overflow/gi, 'கடுமையான கழிவுநீர் பெருக்கம்'],
    [/sewage overflow/gi, 'கழிவுநீர் பெருக்கம்'],
    [/foul sewage odor/gi, 'கழிவுநீர் துர்நாற்றம்'],
    [/broken main water valve/gi, 'பழுதடைந்த பிரதான நீர் வால்வு'],
    [/deep dangerous potholes/gi, 'ஆழமான ஆபத்தான சாலை குழிகள்'],
    [/large deep pothole/gi, 'பெரிய ஆழமான சாலை குழி'],
    [/deep pothole/gi, 'ஆழமான சாலை குழி'],
    [/pothole/gi, 'சாலை குழி'],
    [/broken canal gate/gi, 'உடைந்த கால்வாய் மதகு'],
    [/agricultural water shortage/gi, 'விவசாய நீர் தட்டுப்பாடு'],
    [/garbage overflow/gi, 'குப்பை தேக்கம்'],
    [/uncleared waste/gi, 'அகற்றப்படாத கழிவுகள்'],
    [/power outage/gi, 'மின் தடை'],
    [/non-functioning streetlights/gi, 'எரியாத தெருவிளக்குகள்'],
    [/street light pole/gi, 'தெருவிளக்கு கம்பம்'],
    [/street light|streetlights/gi, 'தெருவிளக்கு'],
    [/causing traffic jam/gi, 'போக்குவரத்து நெரிசலை ஏற்படுத்துகிறது'],
    [/near colony pump/gi, 'குடியிருப்பு பம்ப் அருகே'],
    [/near community park/gi, 'சமூக பூங்கா அருகில்'],
    [/near market road/gi, 'சந்தை சாலை அருகே'],
    [/near market/gi, 'சந்தை அருகே'],
    [/near water tank/gi, 'நீர் தொட்டி அருகே'],
    [/on 7th avenue/gi, '7வது அவென்யூவில்'],
    [/on 12th main road/gi, '12வது மெயின் ரோட்டில்'],
    [/on 100ft ring road/gi, '100 அடி ரிங் ரோட்டில்'],
    [/near 4th cross/gi, '4வது குறுக்கு சாலை அருகே'],
    [/on 4th cross/gi, '4வது குறுக்கு சாலையில்'],
    [/on 8th cross|near 8th cross/gi, '8வது கிராஸில்'],
  ];

  for (const [pattern, repl] of replacements) {
    translated = translated.replace(pattern, repl);
  }

  return translated;
}

// -------------------------------------------------------------
// DYNAMIC GRIEVANCE DESCRIPTIONS & SUMMARIES
// -------------------------------------------------------------
const DESCRIPTION_DICTIONARY: Record<string, string> = {
  'murky foul-smelling water coming from domestic supply line.': 'குடிநீர் விநியோக குழாயிலிருந்து கலங்கிய துர்நாற்றமுள்ள நீர் வருகிறது.',
  'water supply pipeline breakage reported causing road flooding and low pressure in neighborhood.': 'குடிநீர் குழாய் உடைப்பால் சாலையில் நீர் தேக்கம் மற்றும் குடியிருப்புகளில் குறைந்த நீர் அழுத்தம் ஏற்பட்டுள்ளது.',
  'deep road depression and asphalt damage reported on active vehicular lane.': 'வாகனப் பாதையில் ஆழமான சாலை குழி மற்றும் தார் சேதம் பதிவாகியுள்ளது.',
  'solid waste accumulation and uncleared community garbage bin creating hygiene hazard.': 'குப்பைத் தொட்டியில் தேங்கியுள்ள கழிவுகள் பொது சுகாதாரக் கேட்டை ஏற்படுத்துகின்றன.',
  'power outage and non-functioning streetlights creating public safety and transit concerns.': 'மின் தடை மற்றும் எரியாத தெருவிளக்குகளால் பொதுமக்கள் பாதுகாப்பிற்கு அச்சுறுத்தல் ஏற்பட்டுள்ளது.',
  'sewage or drain water overflowing onto the public street posing health hazards.': 'பொதுச் சாலையில் கழிவுநீர் பெருக்கெடுத்து ஓடி சுகாதார அபாயத்தை ஏற்படுத்துகிறது.',
  'severe water contamination and foul odor reported near residential pump.': 'குடியிருப்பு பம்ப் அருகே கடுமையான குடிநீர் மாசுபாடு மற்றும் துர்நாற்றம் பதிவாகியுள்ளது.',
  'potential immediate impact on residents.': 'பொதுமக்கள் மீது உடனடி பாதிப்பு ஏற்பட வாய்ப்புள்ளது.',
  'the main stormwater drain near 12th main indiranagar has backed up and contaminated sewage water is spilling onto the street, creating severe foul smell and health hazard.': '12வது மெயின் இந்திராநகர் அருகே உள்ள பிரதான மழைநீர் வடிகால் அடைபட்டு, கழிவுநீர் சாலையில் பெருக்கெடுத்து ஓடி, கடுமையான துர்நாற்றத்தையும் சுகாதார ஆபத்தையும் உருவாக்குகிறது.',
  'sewage drain blockage causing overflow on public transit road. poses sanitation and health risk.': 'பொதுப் போக்குவரத்து சாலையில் கழிவுநீர் வடிகால் அடைப்பால் நீர் தேங்கியுள்ளது. இது சுகாதாரக் கேட்டை உருவாக்குகிறது.',
  'multiple large potholes formed after recent rains near the metro pillar 142. two two-wheelers skidded yesterday.': 'சமீபத்திய மழையால் மெட்ரோ தூண் 142 அருகே பல பெரிய குழிகள் உருவாகியுள்ளன. நேற்று இரண்டு இருசக்கர வாகனங்கள் வழுக்கி விழுந்தன.',
  'pothole cluster causing traffic hazard and vehicle damage near metro pillar.': 'மெட்ரோ தூண் அருகே சாலை குழிகள் போக்குவரத்து நெரிசலையும் வாகன சேதத்தையும் ஏற்படுத்துகின்றன.',
  'the distributary sluice gate on canal-7 is jammed, preventing water flow to over 40 acres of paddy crops in pandavapura.': 'கால்வாய்-7ல் உள்ள பகிர்மான மதகு கதவு பழுதடைந்துள்ளதால் பாண்டவபுராவில் 40 ஏக்கருக்கும் மேற்பட்ட நெற்பயிர்களுக்கு நீர் செல்வது தடைபட்டுள்ளது.',
  'canal gate blockage threatening irrigation water supply to 40+ acres of agricultural crops.': 'கால்வாய் மதகு அடைப்பால் 40+ ஏக்கர் விவசாய பயிர்களுக்கான பாசன நீர் விநியோகம் பாதிக்கப்பட்டுள்ளது.',
};

export function getLocalizedDescription(desc: string | null | undefined, language: Language): string {
  if (!desc) return '';
  if (language === 'en') return desc;

  const key = desc.trim().toLowerCase();
  if (DESCRIPTION_DICTIONARY[key]) {
    return DESCRIPTION_DICTIONARY[key];
  }

  let translated = desc;
  const replacements: [RegExp, string][] = [
    [/murky foul-smelling water coming from domestic supply line/gi, 'குடிநீர் விநியோக குழாயிலிருந்து கலங்கிய துர்நாற்றமுள்ள நீர் வருகிறது'],
    [/murky foul-smelling water/gi, 'கலங்கிய துர்நாற்றமுள்ள நீர்'],
    [/domestic supply line/gi, 'குடிநீர் விநியோக குழாய்'],
    [/water supply pipeline breakage reported causing road flooding/gi, 'குடிநீர் குழாய் உடைப்பால் சாலையில் நீர் தேக்கம் ஏற்பட்டுள்ளது'],
    [/and low pressure in neighborhood/gi, 'மற்றும் குடியிருப்புகளில் குறைந்த நீர் அழுத்தம் நிலவுகிறது'],
    [/deep road depression and asphalt damage reported on active vehicular lane/gi, 'வாகனப் பாதையில் ஆழமான சாலை குழி மற்றும் தார் சேதம் பதிவாகியுள்ளது'],
    [/deep road depression/gi, 'ஆழமான சாலை குழி'],
    [/asphalt damage/gi, 'தார் சாலை சேதம்'],
    [/solid waste accumulation and uncleared community garbage bin/gi, 'குப்பைத் தொட்டியில் கழிவுகள் தேங்கி அகற்றப்படாமல் உள்ளன'],
    [/creating hygiene hazard/gi, 'பொது சுகாதாரக் கேட்டை ஏற்படுத்துகிறது'],
    [/power outage and non-functioning streetlights/gi, 'மின் தடை மற்றும் எரியாத தெருவிளக்குகள் பதிவாகியுள்ளன'],
    [/creating public safety and transit concerns/gi, 'பொதுமக்கள் பாதுகாப்பு மற்றும் போக்குவரத்திற்கு அச்சுறுத்தலாக உள்ளது'],
    [/sewage or drain water overflowing onto the public street/gi, 'பொதுச் சாலையில் கழிவுநீர் பெருக்கெடுத்து ஓடுகிறது'],
    [/posing health hazards/gi, 'சுகாதார அபாயத்தை ஏற்படுத்துகிறது'],
    [/severe water contamination and foul odor reported near residential pump/gi, 'குடியிருப்பு பம்ப் அருகே கடுமையான குடிநீர் மாசுபாடு மற்றும் துர்நாற்றம் பதிவாகியுள்ளது'],
    [/severe water contamination and foul odor/gi, 'கடுமையான குடிநீர் மாசுபாடு மற்றும் துர்நாற்றம்'],
    [/potential immediate impact on residents/gi, 'பொதுமக்கள் மீது உடனடி பாதிப்பு ஏற்பட வாய்ப்புள்ளது'],
    [/the main stormwater drain near 12th main indiranagar has backed up/gi, '12வது மெயின் இந்திராநகர் அருகே பிரதான மழைநீர் வடிகால் அடைபட்டுள்ளது'],
    [/contaminated sewage water is spilling onto the street/gi, 'கழிவுநீர் சாலையில் பெருக்கெடுத்து ஓடுகிறது'],
    [/creating severe foul smell and health hazard/gi, 'கடுமையான துர்நாற்றத்தையும் சுகாதார ஆபத்தையும் உருவாக்குகிறது'],
    [/multiple large potholes formed after recent rains/gi, 'சமீபத்திய மழையால் பல பெரிய குழிகள் உருவாகியுள்ளன'],
    [/two two-wheelers skidded yesterday/gi, 'நேற்று இரண்டு இருசக்கர வாகனங்கள் வழுக்கி விழுந்தன'],
    [/pothole cluster causing traffic hazard and vehicle damage/gi, 'சாலை குழிகள் போக்குவரத்து நெரிசலையும் வாகன சேதத்தையும் ஏற்படுத்துகின்றன'],
    [/the distributary sluice gate on canal-7 is jammed/gi, 'கால்வாய்-7ல் உள்ள பகிர்மான மதகு கதவு பழுதடைந்துள்ளது'],
    [/preventing water flow to over 40 acres of paddy crops/gi, '40 ஏக்கருக்கும் மேற்பட்ட நெற்பயிர்களுக்கு நீர் செல்வது தடைபட்டுள்ளது'],
    [/canal gate blockage threatening irrigation water supply/gi, 'கால்வாய் மதகு அடைப்பால் பாசன நீர் விநியோகம் பாதிக்கப்பட்டுள்ளது'],
  ];

  for (const [pattern, repl] of replacements) {
    translated = translated.replace(pattern, repl);
  }

  return translated;
}

export function getLocalizedSummary(summary: string | null | undefined, language: Language): string {
  return getLocalizedDescription(summary, language);
}

// -------------------------------------------------------------
// DYNAMIC AI ACTIONS & RECOMMENDATIONS
// -------------------------------------------------------------
const ACTION_DICTIONARY: Record<string, string> = {
  'dispatch a field inspection team immediately to assess the rupture and initiate emergency containment and repair procedures.': 'கள ஆய்வு குழுவை உடனடியாக அனுப்பி பாதிப்பை மதிப்பீடு செய்து, அவசர பழுதுநீக்கும் பணிகளைத் தொடங்கவும்.',
  'dispatch a field inspection team to assess the rupture and initiate emergency containment and repair procedures.': 'கசிவை ஆய்வு செய்து, அவசர தடுப்பு மற்றும் பழுதுபார்ப்பு நடவடிக்கைகளைத் தொடங்க கள ஆய்வுக் குழுவை அனுப்பவும்.',
  'dispatch a field inspection team immediately.': 'கள ஆய்வு குழுவை உடனடியாக அனுப்பவும்.',
  'dispatch pipeline maintenance squad with emergency valve shutoff tools.': 'அவசர வால்வு அடைப்பு கருவிகளுடன் குழாய் பராமரிப்பு குழுவை அனுப்பவும்.',
  'dispatch road repair gang with cold mix asphalt and safety barricades.': 'பாதுகாப்பு தடுப்புகள் மற்றும் தார் கலவையுடன் சாலை பழுதுநீக்கும் குழுவை அனுப்பவும்.',
  'dispatch municipal compactor truck and solid waste cleanup crew.': 'நகராட்சி குப்பை அள்ளும் வாகனம் மற்றும் துப்புரவு பணியாளர்களை அனுப்பவும்.',
  'dispatch electrical line team with replacement fuses and bucket truck.': 'மாற்று ஃப்யூஸ்கள் மற்றும் ஏணி வாகனத்துடன் மின்வாரிய களப்பணியாளர்களை அனுப்பவும்.',
  'dispatch sanitation jetting vehicle and suction crew to clear blockage.': 'அடைப்பை நீக்க துப்புரவு ஜெட்டிங் மற்றும் உறிஞ்சும் வாகனக் குழுவை அனுப்பவும்.',
  'dispatch water quality testing team with emergency chlorination and lab testing kit.': 'குளோரினேஷன் மற்றும் ஆய்வகப் பரிசோதனை கருவிகளுடன் குடிநீர் தர பரிசோதனைக் குழுவை அனுப்பவும்.',
  'assign a sanitation crew and update the grievance status.': 'துப்புரவுக் குழுவை நியமித்து புகார் நிலையைப் புதுப்பிக்கவும்.',
  'dispatch a water supply and sanitation field team for immediate inspection.': 'உடனடி கள ஆய்வுக்கு குடிநீர் வழங்கல் மற்றும் வடிகால் களப்பணியாளர்களை அனுப்பவும்.',
  'deploy municipal sanitation vehicle and waste clearance crew for immediate collection.': 'உடனடி சேகரிப்பிற்கு நகராட்சி துப்புரவு வாகனம் மற்றும் கழிவு அகற்றும் குழுவை அனுப்பவும்.',
  'dispatch water supply & sanitation field engineers to inspect pipeline/drainage and isolate issue.': 'குழாய்/வடிகாலை ஆய்வு செய்து பிரச்சனையை சரிசெய்ய குடிநீர் வழங்கல் & வடிகால் பொறியாளர்களை அனுப்பவும்.',
  'dispatch public works road maintenance crew for immediate on-site inspection and asphalt patch repair.': 'உடனடி கள ஆய்வு மற்றும் தார் ஒட்டுவேலை பழுதுநீக்கத்திற்கு பொதுப்பணி சாலை பராமரிப்புக் குழுவை அனுப்பவும்.',
  'dispatch electricity board line maintenance crew and inspect equipment/cables for safety.': 'மின்வாரிய பாதை பராமரிப்புக் குழுவை அனுப்பி உபகரணங்கள் மற்றும் கேபிள்களை ஆய்வு செய்யவும்.',
  'alert local public health officer and schedule sanitation/fumigation team inspection.': 'உள்ளூர் பொது சுகாதார அலுவலரை எச்சரித்து துப்புரவு/புகை தெளிப்பு குழு ஆய்வை திட்டமிடவும்.',
};

export function getLocalizedAction(action: string | null | undefined, language: Language): string {
  if (!action) return '';
  if (language === 'en') return action;

  const key = action.trim().toLowerCase();
  if (ACTION_DICTIONARY[key]) {
    return ACTION_DICTIONARY[key];
  }

  let translated = action;
  const replacements: [RegExp, string][] = [
    [/dispatch a field inspection team immediately to assess the rupture and initiate emergency containment/gi, 'கள ஆய்வு குழுவை உடனடியாக அனுப்பி அவசர தடுப்பு நடவடிக்கைகளைத் தொடங்கவும்'],
    [/dispatch a field inspection team immediately/gi, 'கள ஆய்வு குழுவை உடனடியாக அனுப்பவும்'],
    [/dispatch a field inspection team/gi, 'கள ஆய்வுக் குழுவை அனுப்பவும்'],
    [/dispatch pipeline maintenance squad/gi, 'குழாய் பராமரிப்பு குழுவை அனுப்பவும்'],
    [/dispatch road repair gang/gi, 'சாலை பழுதுநீக்கும் குழுவை அனுப்பவும்'],
    [/dispatch municipal compactor truck/gi, 'நகராட்சி குப்பை அள்ளும் வாகனத்தை அனுப்பவும்'],
    [/dispatch electrical line team/gi, 'மின்வாரிய களப்பணியாளர்களை அனுப்பவும்'],
    [/dispatch sanitation jetting vehicle/gi, 'துப்புரவு ஜெட்டிங் வாகனத்தை அனுப்பவும்'],
    [/dispatch water quality testing team/gi, 'குடிநீர் தர பரிசோதனைக் குழுவை அனுப்பவும்'],
    [/deploy municipal sanitation vehicle/gi, 'நகராட்சி துப்புரவு வாகனத்தை அனுப்பவும்'],
    [/dispatch water supply & sanitation field engineers/gi, 'குடிநீர் வழங்கல் & வடிகால் பொறியாளர்களை அனுப்பவும்'],
    [/dispatch public works road maintenance crew/gi, 'பொதுப்பணி சாலை பராமரிப்புக் குழுவை அனுப்பவும்'],
    [/dispatch electricity board line maintenance crew/gi, 'மின்வாரிய பாதை பராமரிப்புக் குழுவை அனுப்பவும்'],
    [/alert local public health officer/gi, 'உள்ளூர் பொது சுகாதார அலுவலரை எச்சரிக்கவும்'],
    [/public health risk detected/gi, 'பொது சுகாதார ஆபத்து கண்டறியப்பட்டுள்ளது'],
    [/immediate attention required/gi, 'உடனடி கவனம் தேவை'],
  ];

  for (const [pattern, repl] of replacements) {
    translated = translated.replace(pattern, repl);
  }

  return translated;
}

// -------------------------------------------------------------
// DYNAMIC OFFICER REMARKS IN TIMELINE
// -------------------------------------------------------------
const REMARKS_DICTIONARY: Record<string, string> = {
  'grievance filed via civicos citizen app.': 'CivicOS குடிமக்கள் தளம் வழியாக புகார் பதிவு செய்யப்பட்டது.',
  'sanitation jetting team bwssb-unit-4 dispatched to site.': 'துப்புரவு ஜெட்டிங் குழு BWSSB-Unit-4 சம்பவ இடத்திற்கு அனுப்பப்பட்டது.',
  'sanitation jetting crew and vehicle dispatched to location.': 'துப்புரவு ஜெட்டிங் குழுவும் வாகனமும் சம்பவ இடத்திற்கு அனுப்பப்பட்டன.',
  'grievance submitted by citizen.': 'குடிமகனால் புகார் சமர்ப்பிக்கப்பட்டது.',
  'agricultural grievance filed by citizen.': 'விவசாய புகார் குடிமகனால் பதிவு செய்யப்பட்டது.',
  'inspection completed by field engineer. repairs actively underway.': 'களப் பொறியாளரால் ஆய்வு நிறைவடைந்து, பழுதுநீக்கும் பணிகள் தீவிரமாக நடைபெற்று வருகின்றன.',
  'obstruction cleared and valve pressure restored to normal.': 'அடைப்பு நீக்கப்பட்டு வால்வு நீர் அழுத்தம் சீராக்கப்பட்டது.',
  'road asphalt patch work completed and site reopened.': 'சாலை தார் போடும் பணி முடிக்கப்பட்டு போக்குவரத்து சீரானது.',
  'transformer fuse replaced and power grid normalized.': 'மின்மாற்றி பியூஸ் மாற்றப்பட்டு மின் விநியோகம் சீரானது.',
  're-inspected on-site. issue verified as resolved.': 'களத்தில் மீண்டும் ஆய்வு செய்யப்பட்டு பிரச்சனை தீர்க்கப்பட்டதாக உறுதி செய்யப்பட்டது.',
  'status update logged without additional remarks.': 'கூடுதல் குறிப்புகள் இன்றி நிலை மாற்றம் பதிவு செய்யப்பட்டுள்ளது.',
};

export function getLocalizedRemarks(remarks: string | null | undefined, language: Language): string {
  if (!remarks) return '';
  if (language === 'en') return remarks;

  const key = remarks.trim().toLowerCase();
  if (REMARKS_DICTIONARY[key]) {
    return REMARKS_DICTIONARY[key];
  }

  let translated = remarks;
  const replacements: [RegExp, string][] = [
    [/grievance filed via civicos citizen app/gi, 'CivicOS குடிமக்கள் தளம் வழியாக புகார் பதிவு செய்யப்பட்டது'],
    [/sanitation jetting team bwssb-unit-4 dispatched to site/gi, 'துப்புரவு ஜெட்டிங் குழு BWSSB-Unit-4 சம்பவ இடத்திற்கு அனுப்பப்பட்டது'],
    [/sanitation jetting crew and vehicle dispatched to location/gi, 'துப்புரவு ஜெட்டிங் குழுவும் வாகனமும் சம்பவ இடத்திற்கு அனுப்பப்பட்டன'],
    [/grievance submitted by citizen/gi, 'குடிமகனால் புகார் சமர்ப்பிக்கப்பட்டது'],
    [/agricultural grievance filed by citizen/gi, 'விவசாய புகார் குடிமகனால் பதிவு செய்யப்பட்டது'],
    [/inspection completed by field engineer/gi, 'களப் பொறியாளரால் ஆய்வு நிறைவடைந்தது'],
    [/repairs actively underway/gi, 'பழுதுநீக்கும் பணிகள் தீவிரமாக நடைபெற்று வருகின்றன'],
    [/obstruction cleared and valve pressure restored/gi, 'அடைப்பு நீக்கப்பட்டு வால்வு நீர் அழுத்தம் சீராக்கப்பட்டது'],
    [/road asphalt patch work completed and site reopened/gi, 'சாலை தார் போடும் பணி முடிக்கப்பட்டு போக்குவரத்து சீரானது'],
    [/transformer fuse replaced and power grid normalized/gi, 'மின்மாற்றி பியூஸ் மாற்றப்பட்டு மின் விநியோகம் சீரானது'],
    [/re-inspected on-site/gi, 'களத்தில் மீண்டும் ஆய்வு செய்யப்பட்டது'],
    [/issue verified as resolved/gi, 'பிரச்சனை தீர்க்கப்பட்டதாக உறுதி செய்யப்பட்டது'],
  ];

  for (const [pattern, repl] of replacements) {
    translated = translated.replace(pattern, repl);
  }

  return translated;
}

// -------------------------------------------------------------
// DYNAMIC LOCATIONS AND LANDMARKS
// -------------------------------------------------------------
const LOCATION_DICTIONARY: Record<string, string> = {
  'indiranagar 8th cross': 'இந்திராநகர் 8வது கிராஸ்',
  'indiranagar 12th main road, bengaluru': 'இந்திரா நகர் 12வது மெயின் ரோடு, பெங்களூரு',
  '12th main road, indiranagar, bengaluru': '12வது மெயின் ரோடு, இந்திரா நகர், பெங்களூரு',
  'indiranagar 12th main road': 'இந்திரா நகர் 12வது மெயின் ரோடு',
  '12th main road, indiranagar': '12வது மெயின் ரோடு, இந்திரா நகர்',
  '100 feet ring road, indiranagar': '100 அடி ரிங் ரோடு, இந்திரா நகர்',
  '100ft ring road': '100 அடி ரிங் ரோடு',
  'opposite bda complex': 'பிடிஏ வளாகம் எதிரில்',
  'near bda complex': 'பிடிஏ வளாகம் அருகில்',
  'near bda shopping complex': 'பிடிஏ வணிக வளாகம் அருகில்',
  'near metro pillar 142': 'மெட்ரோ தூண் 142 அருகில்',
  'metro pillar 142': 'மெட்ரோ தூண் 142',
  'distributary canal-7, pandavapura': 'பகிர்மான கால்வாய்-7, பாண்டவபுரா',
  'distributary canal-7': 'பகிர்மான கால்வாய்-7',
  'near old sluice bridge': 'பழைய மதகு பாலம் அருகில்',
  'old sluice bridge': 'பழைய மதகு பாலம்',
  'pandavapura, mandya': 'பாண்டவபுரா, மாண்டியா',
  'pandavapura': 'பாண்டவபுரா',
  'mandya': 'மாண்டியா',
  'near community park': 'சமூக பூங்கா அருகில்',
  'near water tank': 'நீர் தொட்டி அருகே',
  'near market road': 'சந்தை சாலை அருகே',
  'near 4th cross': '4வது குறுக்கு சாலை அருகே',
  'near colony pump': 'குடியிருப்பு பம்ப் அருகே',
  'indiranagar': 'இந்திரா நகர்',
  'jayanagar': 'ஜெயநகர்',
  'koramangala': 'கோரமங்களா',
  'mg road': 'எம்.ஜி. ரோடு',
  'gandhi nagar': 'காந்தி நகர்',
  'market road': 'சந்தை சாலை',
  'water tank': 'நீர் தொட்டி',
  'community park': 'சமூக பூங்கா',
  'colony pump': 'குடியிருப்பு பம்ப்',
  '7th avenue': '7வது அவென்யூ',
  '12th main road': '12வது மெயின் ரோடு',
  '4th cross': '4வது குறுக்கு தெரு',
  '8th cross': '8வது கிராஸ்',
  'main road': 'பிரதான சாலை',
  'cross road': 'குறுக்கு சாலை',
  'bengaluru urban': 'பெங்களூரு நகர்ப்புறம்',
  'bengaluru': 'பெங்களூரு',
  'karnataka, india': 'கர்நாடகா, இந்தியா',
  'karnataka': 'கர்நாடகா',
  'tamil nadu': 'தமிழ்நாடு',
  'maharashtra': 'மகாராஷ்டிரா',
  'delhi': 'டெல்லி',
};

export function getLocalizedLocation(location: string | null | undefined, language: Language): string {
  if (!location) return '';
  if (language === 'en') return location;

  const lower = location.toLowerCase().trim();
  if (LOCATION_DICTIONARY[lower]) {
    return LOCATION_DICTIONARY[lower];
  }

  let translated = location;
  for (const [eng, tam] of Object.entries(LOCATION_DICTIONARY)) {
    const regex = new RegExp(`\\b${eng}\\b`, 'gi');
    translated = translated.replace(regex, tam);
  }
  return translated;
}

