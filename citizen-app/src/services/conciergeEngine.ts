import { GovernmentService } from './serviceTypes';
import { ServiceResolver } from './serviceResolver';

export type ConciergeIntent =
  | 'SERVICE'
  | 'WELFARE'
  | 'GRIEVANCE'
  | 'DOCUMENT'
  | 'LIFE_EVENT'
  | 'UNKNOWN';

export interface LifeEventStep {
  title: string;
  title_ta: string;
  desc: string;
  desc_ta: string;
  serviceSlug?: string;
  actionType: 'SERVICE' | 'WELFARE' | 'PROFILE' | 'GUIDE';
}

export interface ConciergeResult {
  intent: ConciergeIntent;
  query: string;
  headline: string;
  headline_ta: string;
  summary: string;
  summary_ta: string;
  service?: GovernmentService;
  matchedServices?: GovernmentService[];
  grievanceCategory?: string;
  suggestedGrievanceTitle?: string;
  welfareCategory?: string;
  lifeEventSteps?: LifeEventStep[];
  officialPortalName?: string;
  officialPortalUrl?: string;
  confidence: number;
  isDeterministic: boolean;
}

export class ConciergeEngine {
  /**
   * Main entry point for interpreting citizen natural language requests
   * using a layered, grounded deterministic + AI approach.
   */
  public static interpret(query: string, language: 'en' | 'ta' = 'en'): ConciergeResult {
    const raw = query.trim().toLowerCase();
    if (!raw) {
      return {
        intent: 'UNKNOWN',
        query,
        headline: 'How can CivicOS help you today?',
        headline_ta: 'CivicOS உங்களுக்கு எவ்வாறு உதவ முடியும்?',
        summary: 'Ask about government services, certificates, welfare schemes, or civic issues.',
        summary_ta: 'அரசு சேவைகள், சான்றிதழ்கள், நலத்திட்டங்கள் அல்லது பொதுப் பிரச்சனைகள் குறித்து கேளுங்கள்.',
        confidence: 1.0,
        isDeterministic: true,
      };
    }

    // -------------------------------------------------------------
    // LAYER 1: GRIEVANCE / CIVIC ISSUE RECOGNITION
    // -------------------------------------------------------------
    const grievanceKeywords = [
      // Water
      'water leak', 'pipe burst', 'water logging', 'waterlogging', 'dirty water', 'water supply', 'no water',
      'குடிநீர்', 'நீர் கசிவு', 'தண்ணீர் பிரச்சனை', 'குழாய் உடைப்பு',
      // Streetlight / Electricity
      'streetlight', 'street light', 'broken light', 'power cut', 'electricity cut', 'sparking wire', 'meter issue',
      'தெருவிளக்கு', 'மின்வெட்டு', 'மின்சாரம்', 'விளக்கு எரியவில்லை',
      // Roads / Potholes
      'pothole', 'broken road', 'road damaged', 'drainage overflow', 'open manhole', 'footpath damaged',
      'குண்டு குழி', 'சேதமடைந்த சாலை', 'சாக்கடை', 'பாதாள சாக்கடை',
      // Waste / Garbage
      'garbage', 'waste', 'trash dumped', 'uncleaned dustbin', 'dead animal', 'debris',
      'குப்பை', 'கழிவு', 'சாக்கடை அடைப்பு',
      // General Report verbs
      'report', 'complain', 'complaint', 'broken', 'damaged', 'leaking', 'overflowing',
      'புகார்', 'உடைந்தது', 'பழுதானது', 'பிரச்சனை',
    ];

    const isGrievanceMatch = grievanceKeywords.some((kw) => raw.includes(kw));
    if (isGrievanceMatch) {
      let cat = 'General Civic Issue';
      let title = query;
      let headline = 'Civic Problem Identified';
      let headline_ta = 'பொதுப் பிரச்சனை அடையாளம் காணப்பட்டது';
      let summary = 'You can officially report this issue to municipal authorities through CivicOS.';
      let summary_ta = 'இந்த பிரச்சனையை CivicOS மூலம் அதிகாரப்பூர்வமாக நகராட்சி அதிகாரிகளுக்கு புகாரளிக்கலாம்.';

      if (raw.includes('water') || raw.includes('pipe') || raw.includes('நீர்') || raw.includes('குழாய்')) {
        cat = 'Water & Sanitation';
        title = 'Water leakage / supply disruption report';
        headline = 'Water & Sanitation Issue Identified';
        headline_ta = 'குடிநீர் மற்றும் கழிவுநீர் பிரச்சனை';
        summary = 'CivicOS can automatically route this to the Water & Sanitation department for field inspection.';
        summary_ta = 'CivicOS இதை கள ஆய்விற்காக தானாகவே குடிநீர் வடிகால் வாரியத்திற்கு அனுப்பும்.';
      } else if (raw.includes('light') || raw.includes('power') || raw.includes('மின்') || raw.includes('விளக்கு')) {
        cat = 'Electricity';
        title = 'Streetlight / electrical outage report';
        headline = 'Streetlight / Electrical Issue Identified';
        headline_ta = 'தெருவிளக்கு / மின்சார பிரச்சனை';
        summary = 'CivicOS can route this directly to the municipal electrical engineering wing.';
        summary_ta = 'CivicOS இதை நேரடியாக மின்சார பொறியியல் பிரிவுக்கு அனுப்பும்.';
      } else if (raw.includes('road') || raw.includes('pothole') || raw.includes('drain') || raw.includes('சாலை') || raw.includes('குழி')) {
        cat = 'Roads & Infrastructure';
        title = 'Damaged road / pothole hazard report';
        headline = 'Road Infrastructure Issue Identified';
        headline_ta = 'சாலை மற்றும் உள்கட்டமைப்பு பிரச்சனை';
        summary = 'CivicOS routes road damage directly to the Public Works department with SLA tracking.';
        summary_ta = 'CivicOS சாலை பராமரிப்பு புகார்களை பொதுப்பணித்துறைக்கு SLA காலக்கெடுவுடன் அனுப்பும்.';
      } else if (raw.includes('garbage') || raw.includes('waste') || raw.includes('trash') || raw.includes('குப்பை')) {
        cat = 'Waste Management';
        title = 'Garbage clearance / sanitation report';
        headline = 'Sanitation & Waste Issue Identified';
        headline_ta = 'சுகாதாரம் மற்றும் குப்பை மேலாண்மை';
        summary = 'CivicOS can alert the sanitation inspector and municipal waste collection team.';
        summary_ta = 'CivicOS நகராட்சி தூய்மைப் பணி ஆய்வாளருக்கு உடனடி எச்சரிக்கை அனுப்பும்.';
      }

      return {
        intent: 'GRIEVANCE',
        query,
        headline,
        headline_ta,
        summary,
        summary_ta,
        grievanceCategory: cat,
        suggestedGrievanceTitle: title,
        confidence: 0.95,
        isDeterministic: true,
      };
    }

    // -------------------------------------------------------------
    // LAYER 2: LIFE EVENT RECOGNITION
    // -------------------------------------------------------------
    const lifeEventMap: Record<string, { title: string; title_ta: string; steps: LifeEventStep[] }> = {
      marriage: {
        title: 'Marriage & Family Milestones',
        title_ta: 'திருமணம் மற்றும் குடும்ப நிகழ்வுகள்',
        steps: [
          {
            title: 'Marriage Certificate',
            title_ta: 'திருமண சான்றிதழ்',
            desc: 'Register marriage under State Special/Hindu Marriage Act.',
            desc_ta: 'மாநில பதிவுத் துறையில் திருமணத்தை பதிவு செய்யவும்.',
            serviceSlug: 'marriage-certificate',
            actionType: 'SERVICE',
          },
          {
            title: 'Aadhaar Name & Address Update',
            title_ta: 'ஆதார் பெயர் மற்றும் முகவரி மாற்றம்',
            desc: 'Update spouse name and updated residence details.',
            desc_ta: 'துணைவர் பெயர் மற்றும் புதிய முகவரியை புதுப்பிக்கவும்.',
            serviceSlug: 'aadhaar-services',
            actionType: 'SERVICE',
          },
          {
            title: 'Ration Card Addition',
            title_ta: 'குடும்ப அட்டையில் பெயர் சேர்த்தல்',
            desc: 'Add new spouse member to Smart Family Card.',
            desc_ta: 'குடும்ப அட்டையில் புதிய உறுப்பினரை இணைக்கவும்.',
            serviceSlug: 'ration-card',
            actionType: 'SERVICE',
          },
        ],
      },
      address: {
        title: 'Relocation & Address Change',
        title_ta: 'புதிய இடத்திற்கு மாறுதல் & முகவரி மாற்றம்',
        steps: [
          {
            title: 'Aadhaar Address Update',
            title_ta: 'ஆதார் முகவரி மாற்றம்',
            desc: 'Update residential address online with valid proof.',
            desc_ta: 'சரியான முகவரி சான்றுடன் ஆன்லைனில் ஆதார் முகவரியை மாற்றவும்.',
            serviceSlug: 'aadhaar-services',
            actionType: 'SERVICE',
          },
          {
            title: 'Voter ID Constituency Shift (Form 8)',
            title_ta: 'வாக்காளர் அட்டை தொகுதி மாற்றம் (படிவம் 8)',
            desc: 'Transfer voter registration to your new assembly constituency.',
            desc_ta: 'புதிய சட்டமன்ற தொகுதிக்கு வாக்காளர் பதிவை மாற்றவும்.',
            serviceSlug: 'voter-id',
            actionType: 'SERVICE',
          },
          {
            title: 'Driving Licence Address Change',
            title_ta: 'ஓட்டுநர் உரிம முகவரி மாற்றம்',
            desc: 'Update address on Sarathi Parivahan portal.',
            desc_ta: 'சாரதி பரிவாஹன் தளத்தில் புதிய முகவரியை பதிவு செய்யவும்.',
            serviceSlug: 'driving-licence',
            actionType: 'SERVICE',
          },
        ],
      },
      baby: {
        title: 'Newborn Child & Birth Registration',
        title_ta: 'குழந்தை பிறப்பு & பதிவு சேவைகள்',
        steps: [
          {
            title: 'Birth Certificate',
            title_ta: 'பிறப்புச் சான்றிதழ்',
            desc: 'Obtain official birth certificate from municipal registrar within 21 days.',
            desc_ta: '21 நாட்களுக்குள் நகராட்சி பதிவாளரிடம் பிறப்பு சான்றிதழ் பெறவும்.',
            serviceSlug: 'birth-certificate',
            actionType: 'SERVICE',
          },
          {
            title: 'Child Baal Aadhaar',
            title_ta: 'குழந்தை பால் ஆதார்',
            desc: 'Enroll child for blue Baal Aadhaar using birth certificate.',
            desc_ta: 'பிறப்பு சான்றிதழ் கொண்டு நீல நிற பால் ஆதார் பெறவும்.',
            serviceSlug: 'aadhaar-services',
            actionType: 'SERVICE',
          },
          {
            title: 'Maternity & Child Welfare Schemes',
            title_ta: 'மகப்பேறு & குழந்தைகள் நலத்திட்டங்கள்',
            desc: 'Explore PMMVY and state child financial assistance benefits.',
            desc_ta: 'PMMVY மற்றும் அரசு நிதி உதவி திட்டங்களை அறியவும்.',
            actionType: 'WELFARE',
          },
        ],
      },
      college: {
        title: 'Higher Education & College Admission',
        title_ta: 'உயர் கல்வி & கல்லூரி சேர்க்கை',
        steps: [
          {
            title: 'Income Certificate',
            title_ta: 'வருமானச் சான்றிதழ்',
            desc: 'Required for fee concessions, scholarships, and admission quotas.',
            desc_ta: 'கல்வி கட்டண சலுகை மற்றும் உதவித்தொகைக்கு தேவைப்படும்.',
            serviceSlug: 'income-certificate',
            actionType: 'SERVICE',
          },
          {
            title: 'Community / Caste Certificate',
            title_ta: 'சாதி / சமூக சான்றிதழ்',
            desc: 'Required for reservation benefits and scholarship eligibility.',
            desc_ta: 'இடஒதுக்கீடு சலுகைகள் மற்றும் உதவித்தொகைக்கு தேவை.',
            serviceSlug: 'community-certificate',
            actionType: 'SERVICE',
          },
          {
            title: 'National Scholarship Portal (NSP)',
            title_ta: 'தேசிய உதவித்தொகை தளம் (NSP)',
            desc: 'Apply for merit and pre/post-matric government scholarships.',
            desc_ta: 'அரசு உயர்கல்வி உதவித்தொகைகளுக்கு விண்ணப்பிக்கவும்.',
            actionType: 'WELFARE',
          },
        ],
      },
    };

    if (raw.includes('marri') || raw.includes('married') || raw.includes('wedding') || raw.includes('திருமணம்')) {
      const le = lifeEventMap.marriage;
      return {
        intent: 'LIFE_EVENT',
        query,
        headline: le.title,
        headline_ta: le.title_ta,
        summary: 'Here is your checklist of essential government updates and certificates for marriage.',
        summary_ta: 'திருமணத்திற்குப் பின் தேவையான அரசு ஆவணங்கள் மற்றும் சான்றிதழ்களின் பட்டியல் இதோ.',
        lifeEventSteps: le.steps,
        confidence: 0.92,
        isDeterministic: true,
      };
    }

    if (raw.includes('moved') || raw.includes('relocat') || raw.includes('new address') || raw.includes('new city') || raw.includes('முகவரி மாற்றம்') || raw.includes('இடமாற்றம்')) {
      const le = lifeEventMap.address;
      return {
        intent: 'LIFE_EVENT',
        query,
        headline: le.title,
        headline_ta: le.title_ta,
        summary: 'Here are the official steps to update your residential address across government documents.',
        summary_ta: 'அரசு ஆவணங்களில் உங்கள் புதிய முகவரியை புதுப்பிப்பதற்கான படிகள் இதோ.',
        lifeEventSteps: le.steps,
        confidence: 0.92,
        isDeterministic: true,
      };
    }

    if (raw.includes('baby') || raw.includes('born') || raw.includes('child') || raw.includes('பிறப்பு') || raw.includes('குழந்தை')) {
      const le = lifeEventMap.baby;
      return {
        intent: 'LIFE_EVENT',
        query,
        headline: le.title,
        headline_ta: le.title_ta,
        summary: 'Essential certificates and government benefits for your newborn child.',
        summary_ta: 'புதிதாக பிறந்த குழந்தைக்கு தேவையான சான்றிதழ்கள் மற்றும் நலத்திட்டங்கள்.',
        lifeEventSteps: le.steps,
        confidence: 0.92,
        isDeterministic: true,
      };
    }

    if (raw.includes('college') || raw.includes('university') || raw.includes('scholarship') || raw.includes('student') || raw.includes('கல்வி') || raw.includes('உதவித்தொகை')) {
      const le = lifeEventMap.college;
      return {
        intent: 'LIFE_EVENT',
        query,
        headline: le.title,
        headline_ta: le.title_ta,
        summary: 'Key certificates and scholarship applications needed for higher education.',
        summary_ta: 'உயர்கல்வி மற்றும் உதவித்தொகை விண்ணப்பத்திற்கு தேவையான முக்கிய சான்றிதழ்கள்.',
        lifeEventSteps: le.steps,
        confidence: 0.92,
        isDeterministic: true,
      };
    }

    // -------------------------------------------------------------
    // LAYER 3: WELFARE & SCHEMES RECOGNITION
    // -------------------------------------------------------------
    const welfareKeywords = [
      'welfare', 'scheme', 'benefit', 'subsidy', 'solar', 'pm surya', 'pm kisan', 'farmer', 'ayushman', 'health card', 'pension',
      'நலத்திட்டம்', 'மானியம்', 'விவசாயி', 'முதியோர் உதவித்தொகை', 'சூரிய ஒளி', 'காப்பீடு',
    ];

    if (welfareKeywords.some((w) => raw.includes(w))) {
      return {
        intent: 'WELFARE',
        query,
        headline: 'Government Welfare Schemes & Benefits',
        headline_ta: 'அரசு நலத்திட்டங்கள் மற்றும் பலன்கள்',
        summary: 'Discover personalized welfare schemes, subsidies, and entitlements matched to your Citizen Twin profile.',
        summary_ta: 'உங்கள் சுயவிவரத்திற்கு பொருத்தமான அரசு நலத்திட்டங்கள் மற்றும் மானியங்களை கண்டறியுங்கள்.',
        welfareCategory: 'All Schemes',
        confidence: 0.9,
        isDeterministic: true,
      };
    }

    // -------------------------------------------------------------
    // LAYER 4: GOVERNMENT SERVICE / CERTIFICATE / DOCUMENT MATCHING
    // -------------------------------------------------------------
    const matched = ServiceResolver.resolve(query, language);
    if (matched && matched.length > 0) {
      const primary = matched[0];
      const isDocument = primary.category === 'Identity & Civil' || primary.category === 'Revenue & Certificates';

      return {
        intent: isDocument ? 'DOCUMENT' : 'SERVICE',
        query,
        headline: language === 'ta' ? primary.title_ta : primary.title,
        headline_ta: primary.title_ta,
        summary: language === 'ta' ? primary.short_desc_ta : primary.short_desc,
        summary_ta: primary.short_desc_ta,
        service: primary,
        matchedServices: matched,
        officialPortalName: primary.official_portal_name,
        officialPortalUrl: primary.official_portal_url,
        confidence: 0.98,
        isDeterministic: true,
      };
    }

    // -------------------------------------------------------------
    // LAYER 5: FALLBACK / UNKNOWN INTENT
    // -------------------------------------------------------------
    return {
      intent: 'UNKNOWN',
      query,
      headline: 'CivicOS Government Service Concierge',
      headline_ta: 'CivicOS அரசு சேவை வழிகாட்டி',
      summary: 'CivicOS can guide you through verified government services (PAN, Aadhaar, Passport, Certificates), welfare schemes, and municipal grievance reporting.',
      summary_ta: 'CivicOS அதிகாரப்பூர்வ அரசு சேவைகள் (பான், ஆதார், பாஸ்போர்ட், சான்றிதழ்கள்), நலத்திட்டங்கள் மற்றும் நகராட்சி புகார்களுக்கு வழிகாட்டுகிறது.',
      confidence: 0.5,
      isDeterministic: true,
    };
  }
}
