import { GovernmentService } from './serviceTypes';
import { GOVERNMENT_SERVICES } from './serviceCatalog';

/**
 * Lightweight, deterministic intent resolver that maps natural-language
 * citizen questions and search keywords to the appropriate government service.
 */
export class ServiceResolver {
  /**
   * Resolve user search input to matching services
   */
  public static resolve(query: string, language: 'en' | 'ta' = 'en'): GovernmentService[] {
    const raw = query.trim().toLowerCase();
    if (!raw) return [];

    // 1. Direct synonym and intent mapping table
    const intentMap: Record<string, string> = {
      // PAN Card
      'pan': 'pan-card',
      'pan card': 'pan-card',
      'apply pan': 'pan-card',
      'how to apply for pan': 'pan-card',
      'how to apply for pan card': 'pan-card',
      'how do i get a pan card': 'pan-card',
      'income tax pan': 'pan-card',
      'பான்': 'pan-card',
      'பான் கார்டு': 'pan-card',
      'பான் கார்டுக்கு எப்படி விண்ணப்பிப்பது': 'pan-card',
      'பான் அட்டை': 'pan-card',

      // Aadhaar
      'aadhaar': 'aadhaar-services',
      'aadhar': 'aadhaar-services',
      'adhar': 'aadhaar-services',
      'update aadhaar': 'aadhaar-services',
      'how can i update my aadhaar address': 'aadhaar-services',
      'aadhaar address change': 'aadhaar-services',
      'uidai': 'aadhaar-services',
      'ஆதார்': 'aadhaar-services',
      'ஆதார் அட்டை': 'aadhaar-services',
      'ஆதார் முகவரியை எப்படி மாற்றுவது': 'aadhaar-services',
      'ஆதார் திருத்தம்': 'aadhaar-services',

      // Passport
      'passport': 'passport-seva',
      'i need a passport': 'passport-seva',
      'how to apply for passport': 'passport-seva',
      'passport application': 'passport-seva',
      'passport seva': 'passport-seva',
      'பாஸ்போர்ட்': 'passport-seva',
      'பாஸ்போர்ட் எப்படி பெறுவது': 'passport-seva',
      'பாஸ்போர்ட் விண்ணப்பம்': 'passport-seva',
      'கடவுச்சீட்டு': 'passport-seva',

      // Driving Licence
      'driving licence': 'driving-licence',
      'driving license': 'driving-licence',
      'dl': 'driving-licence',
      'learner licence': 'driving-licence',
      'llr': 'driving-licence',
      'how to apply for a driving licence': 'driving-licence',
      'how to apply for driving licence': 'driving-licence',
      'sarathi': 'driving-licence',
      'parivahan': 'driving-licence',
      'ஓட்டுநர் உரிமம்': 'driving-licence',
      'ஓட்டுநர் உரிமம் எப்படி விண்ணப்பிப்பது': 'driving-licence',
      'டிரைவிங் லைசென்ஸ்': 'driving-licence',

      // Birth Certificate
      'birth certificate': 'birth-certificate',
      'how do i get a birth certificate': 'birth-certificate',
      'how to apply for birth certificate': 'birth-certificate',
      'crs': 'birth-certificate',
      'பிறப்புச் சான்றிதழ்': 'birth-certificate',
      'பிறப்பு சான்றிதழ்': 'birth-certificate',
      'பிறப்பு சான்றிதழ் எப்படி பெறுவது': 'birth-certificate',

      // Ration Card
      'ration card': 'ration-card',
      'family card': 'ration-card',
      'apply for ration card': 'ration-card',
      'nfsa': 'ration-card',
      'ரேஷன் கார்டு': 'ration-card',
      'ரேஷன் அட்டை': 'ration-card',
      'குடும்ப அட்டை': 'ration-card',

      // Income Certificate
      'income certificate': 'income-certificate',
      'how can i get an income certificate': 'income-certificate',
      'how to get income certificate': 'income-certificate',
      'வருமானச் சான்றிதழ்': 'income-certificate',
      'வருமான சான்றிதழ்': 'income-certificate',
      'வருமான சான்றிதழ் எப்படி பெறுவது': 'income-certificate',

      // Community Certificate
      'community certificate': 'community-certificate',
      'caste certificate': 'community-certificate',
      'சாதிச் சான்றிதழ்': 'community-certificate',
      'சாதி சான்றிதழ்': 'community-certificate',
      'இருப்பிடச் சான்றிதழ்': 'community-certificate',

      // Solar Rooftop
      'solar': 'solar-rooftop',
      'rooftop solar': 'solar-rooftop',
      'pm surya ghar': 'solar-rooftop',
      'solar subsidy': 'solar-rooftop',
      'சூரிய மின்சாரம்': 'solar-rooftop',
      'சோலார் மானியம்': 'solar-rooftop',

      // Voter ID
      'voter id': 'digital-voter-id',
      'epic': 'digital-voter-id',
      'e-epic': 'digital-voter-id',
      'election card': 'digital-voter-id',
      'வாக்காளர் அட்டை': 'digital-voter-id',
      'வாக்காளர் அடையாள அட்டை': 'digital-voter-id',
    };

    // Check exact or normalized intent key match
    const normalized = raw.replace(/[?.,!]/g, '').trim();
    if (intentMap[normalized]) {
      const match = GOVERNMENT_SERVICES.find((s) => s.id === intentMap[normalized]);
      if (match) return [match];
    }

    // Check if any intent key is a substring of the query
    for (const [key, svcId] of Object.entries(intentMap)) {
      if (raw.includes(key) || key.includes(raw)) {
        const match = GOVERNMENT_SERVICES.find((s) => s.id === svcId);
        if (match) return [match];
      }
    }

    // 2. Fuzzy multi-field search across catalog
    const queryTokens = normalized.split(/\s+/).filter((t) => t.length > 1);

    const scored = GOVERNMENT_SERVICES.map((service) => {
      let score = 0;
      const title = (language === 'ta' ? service.title_ta : service.title).toLowerCase();
      const desc = (language === 'ta' ? service.short_desc_ta : service.short_desc).toLowerCase();
      const category = (language === 'ta' ? service.category_ta : service.category).toLowerCase();
      const tags = (language === 'ta' ? service.tags_ta : service.tags).map((t) => t.toLowerCase());

      // Direct title match
      if (title.includes(normalized) || service.title.toLowerCase().includes(normalized)) {
        score += 50;
      }

      // Token matches
      for (const token of queryTokens) {
        if (title.includes(token)) score += 20;
        if (tags.some((t) => t.includes(token))) score += 15;
        if (category.includes(token)) score += 10;
        if (desc.includes(token)) score += 5;
      }

      return { service, score };
    });

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.service);
  }

  /**
   * In-Guide AI Assistant question answer generator
   * Answers common questions grounded strictly in the verified service knowledge base.
   */
  public static answerAssistantQuestion(
    service: GovernmentService,
    question: string,
    language: 'en' | 'ta' = 'en'
  ): string {
    const q = question.toLowerCase().trim();
    const isTa = language === 'ta';

    // 1. Document questions
    if (
      q.includes('document') ||
      q.includes('proof') ||
      q.includes('upload') ||
      q.includes('ஆவணம்') ||
      q.includes('சான்று') ||
      q.includes('என்ன ஆவணங்கள்')
    ) {
      const docs = isTa ? service.documents_required_ta : service.documents_required;
      if (isTa) {
        return `இந்த சேவைக்கு தேவைப்படும் முக்கிய ஆவணங்கள்:\n\n` +
          docs.map((d, i) => `${i + 1}. ${d}`).join('\n') +
          `\n\nவிண்ணப்பிக்கும் முன் அனைத்து ஆவணங்களின் தெளிவான நகல்களை தயாராக வைக்கவும்.`;
      }
      return `Here are the essential documents you will need for ${service.title}:\n\n` +
        docs.map((d, i) => `${i + 1}. ${d}`).join('\n') +
        `\n\nPlease ensure all documents are clear and valid before opening the official portal.`;
    }

    // 2. Information to fill / Form fields questions
    if (
      q.includes('field') ||
      q.includes('fill') ||
      q.includes('information') ||
      q.includes('details') ||
      q.includes('நிரப்ப') ||
      q.includes('விவரம்') ||
      q.includes('படிவம்')
    ) {
      const fields = isTa ? service.fields_to_fill_ta : service.fields_to_fill;
      if (isTa) {
        return `விண்ணப்ப படிவத்தில் நீங்கள் நிரப்ப வேண்டிய முக்கிய விவரங்கள்:\n\n` +
          fields.map((f) => `• ${f}`).join('\n') +
          `\n\nஉங்கள் அடையாள ஆவணங்களில் உள்ளவாறே விவரங்களை பிழையின்றி உள்ளிடவும்.`;
      }
      return `Here is the information you will likely be asked to enter in the application:\n\n` +
        fields.map((f) => `• ${f}`).join('\n') +
        `\n\nMake sure spellings match your supporting identity documents exactly.`;
    }

    // 3. How to apply / Steps questions
    if (
      q.includes('how to apply') ||
      q.includes('process') ||
      q.includes('step') ||
      q.includes('விண்ணப்பிப்பது எப்படி') ||
      q.includes('வழிமுறை') ||
      q.includes('படிநிலை')
    ) {
      const steps = isTa ? service.application_steps_ta : service.application_steps;
      if (isTa) {
        return `விண்ணப்பிக்கும் எளிய படிநிலைகள்:\n\n` +
          steps.map((s, i) => `${i + 1}. ${s}`).join('\n') +
          `\n\nஅதிகாரப்பூர்வ இணையதளத்தில் மட்டுமே விண்ணப்பிக்கவும்.`;
      }
      return `Here is the step-by-step application process for ${service.title}:\n\n` +
        steps.map((s, i) => `${i + 1}. ${s}`).join('\n') +
        `\n\nAlways use the official government portal link provided below.`;
    }

    // 4. Fees / Cost questions
    if (
      q.includes('fee') ||
      q.includes('cost') ||
      q.includes('price') ||
      q.includes('how much') ||
      q.includes('payment') ||
      q.includes('கட்டணம்') ||
      q.includes('செலவு') ||
      q.includes('பணம்')
    ) {
      const fee = isTa ? service.fees_ta : service.fees;
      const time = isTa ? service.processing_time_ta : service.processing_time;
      if (isTa) {
        return `கட்டணம் மற்றும் கால அவகாசம்:\n\n• அரசு கட்டணம்: ${fee}\n• தீர்வு கால அவகாசம்: ${time}\n\nகட்டணத்தை அதிகாரப்பூர்வ இணையதளத்தில் உள்ள பாதுகாப்பான Payment Gateway மூலம் மட்டுமே செலுத்தவும்.`;
      }
      return `Official Fees & Timeline:\n\n• Statutory Fee: ${fee}\n• Expected Processing Time: ${time}\n\nAlways pay fees directly on the verified official portal.`;
    }

    // 5. Where to apply / Portal questions
    if (
      q.includes('where') ||
      q.includes('portal') ||
      q.includes('website') ||
      q.includes('link') ||
      q.includes('எங்கு') ||
      q.includes('இணையதளம்') ||
      q.includes('வலைத்தளம்')
    ) {
      if (isTa) {
        return `அதிகாரப்பூர்வ அரசு இணையதளம்:\n\n• இணையதள பெயர்: ${service.official_portal_name}\n• அதிகாரப்பூர்வ முகவரி: ${service.official_portal_url}\n\nகீழே உள்ள 'அதிகாரப்பூர்வ இணையதளத்தை திறக்குக' பொத்தானை கிளிக் செய்து நேரடியாக விண்ணப்பிக்கலாம்.`;
      }
      return `Official Government Portal:\n\n• Portal Name: ${service.official_portal_name}\n• Verified URL: ${service.official_portal_url}\n\nYou can click the "Open Official Website ↗" button below to access the service directly.`;
    }

    // 6. Eligibility questions
    if (
      q.includes('eligible') ||
      q.includes('who can') ||
      q.includes('age') ||
      q.includes('தகுதி') ||
      q.includes('யார் விண்ணப்பிக்கலாம்')
    ) {
      const el = isTa ? service.who_can_apply_ta : service.who_can_apply;
      if (isTa) {
        return `விண்ணப்பிக்க தகுதியானவர்கள்:\n\n` +
          el.map((e) => `• ${e}`).join('\n');
      }
      return `Who is eligible to apply for ${service.title}:\n\n` +
        el.map((e) => `• ${e}`).join('\n');
    }

    // 7. General preparation advice / Fallback
    if (isTa) {
      return `விண்ணப்பிப்பதற்கு முன் கவனிக்க வேண்டியவை:\n\n` +
        `1. உங்கள் ஆவணங்களில் உள்ள பெயர், பிறந்த தேதி மற்றும் முகவரி சரியாக உள்ளதா என்பதை உறுதி செய்யவும்.\n` +
        `2. மொபைல் எண் ஆதாருடன் இணைக்கப்பட்டு OTP பெற தயாராக இருக்க வேண்டும்.\n` +
        `3. அதிகாரப்பூர்வ இணையதளத்தில் விண்ணப்பித்த பின் ஒப்புகை எண்ணை (Acknowledgement Number) குறித்து வைத்துக் கொள்ளவும்.\n\n` +
        `மேலும் உதவிக்கு ஆவணங்கள், கட்டணம் அல்லது படிநிலைகள் பற்றி கேட்கலாம்.`;
    }

    return `Before you begin your application for ${service.title}:\n\n` +
      `1. Check that your name, date of birth, and address match across all supporting documents.\n` +
      `2. Keep your mobile number active for Aadhaar OTP verification.\n` +
      `3. Always note down your application reference number after submission.\n\n` +
      `You can also ask me about required documents, form fields, fees, or steps!`;
  }
}
