export const LANG_META = {
  en: { label: 'English',  native: 'English',   bcp47: 'en-IN' },
  hi: { label: 'Hindi',    native: 'हिन्दी',      bcp47: 'hi-IN' },
  te: { label: 'Telugu',   native: 'తెలుగు',      bcp47: 'te-IN' },
  kn: { label: 'Kannada',  native: 'ಕನ್ನಡ',       bcp47: 'kn-IN' },
  ta: { label: 'Tamil',    native: 'தமிழ்',        bcp47: 'ta-IN' },
};

const FEMALE_HINTS = [
  'female', 'woman', 'girl',
  'veena', 'raveena', 'priya', 'neerja', 'lekha',
  'heera', 'saina', 'aditi', 'sunita', 'kavya',
  'swara', 'pallavi', 'shruti', 'neeraja', 'asha',
  'samantha', 'victoria', 'karen', 'moira', 'fiona',
  'tessa', 'monica', 'ava', 'susan', 'allison',
  'f1', 'f2',
];

const MALE_HINTS = ['male', 'man', 'guy', 'm1', 'm2'];

function isFemaleVoice(v) {
  const name = v.name.toLowerCase();
  if (MALE_HINTS.some(h => name.includes(h))) return false;
  return FEMALE_HINTS.some(h => name.includes(h));
}

/** * STRICT per-language fallback. 
 * Do NOT mix scripts (e.g., no 'hi-IN' fallback for 'te-IN').
 */
const FALLBACK_CHAIN = {
  'te': ['te-IN', 'te'],
  'kn': ['kn-IN', 'kn'],
  'ta': ['ta-IN', 'ta'],
  'hi': ['hi-IN', 'hi'],
  'en': ['en-IN', 'en-GB', 'en-US', 'en'],
};

export function pickFemaleVoice(bcp47) {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return { voice: null, usedLang: bcp47, isFallback: false };

  const langCode = bcp47.split('-')[0].toLowerCase(); 

  const bestFrom = (list) => {
    if (!list.length) return null;
    const female = list.filter(isFemaleVoice);
    return female[0] ?? list[0];
  };

  const exactMatches = voices.filter(v => v.lang.toLowerCase() === bcp47.toLowerCase());
  if (exactMatches.length) {
    return { voice: bestFrom(exactMatches), usedLang: bcp47, isFallback: false };
  }

  const chain = FALLBACK_CHAIN[langCode];
  if (chain) {
    for (const tag of chain) {
      const tagCode = tag.split('-')[0].toLowerCase();
      const matches = voices.filter(v => {
        const vl = v.lang.toLowerCase();
        return vl === tag.toLowerCase() || vl.startsWith(tagCode + '-');
      });
      if (matches.length) {
        const chosen = bestFrom(matches);
        return { voice: chosen, usedLang: chosen.lang, isFallback: true };
      }
    }
  }

  return { voice: null, usedLang: bcp47, isFallback: true };
}

export function initVoiceAvailability(onReady) {
  const checkVoices = () => {
    const availability = getVoiceAvailability();
    onReady(availability);
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    checkVoices();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      checkVoices();
    };
  }
}

export function getVoiceAvailability() {
  const voices = window.speechSynthesis.getVoices();
  const result = {};
  for (const [lang, meta] of Object.entries(LANG_META)) {
    const code = meta.bcp47.split('-')[0].toLowerCase();
    result[lang] = voices.some(v => {
      const vl = v.lang.toLowerCase();
      return vl === meta.bcp47.toLowerCase() ||
             vl.startsWith(code + '-') ||
             vl === code;
    });
  }
  return result;
}

export const UI = {
  en: {
    greeting:   "here's what we found",
    subtext:    "Everything explained in plain English. Show this to your dentist.",
    readBtn:    "Read Aloud",
    stopBtn:    "Stop Reading",
    downloadBtn:"Download Report",
    backBtn:    "← Back to Report",
    actSoon:    "Act Soon",
    watchThis:  "Watch This",
    monitor:    "Monitor",
    triageHigh: "Your mouth needs attention soon. A few issues were found that could get worse if left untreated.",
    triageMed:  "Your mouth is mostly okay, but a couple of things need watching.",
    triageLow:  "Great news! Your teeth look healthy overall.",
    whatFound:  "What we found",
    whatToDo:   "What to do:",
    aiConf:     "AI confidence",
    costTitle:  "What will this cost?",
    costNote:   "Prices vary by clinic. Government hospitals may cost significantly less.",
  },
  hi: {
    greeting:   "यह रहा हमारा विश्लेषण",
    subtext:    "सब कुछ सरल हिंदी में समझाया गया है। इसे अपने दंत चिकित्सक को दिखाएँ।",
    readBtn:    "ज़ोर से पढ़ें",
    stopBtn:    "रोकें",
    downloadBtn:"रिपोर्ट डाउनलोड करें",
    backBtn:    "← रिपोर्ट पर वापस",
    actSoon:    "जल्दी करें",
    watchThis:  "ध्यान रखें",
    monitor:    "निगरानी",
    triageHigh: "आपके दाँतों को जल्द ध्यान देने की ज़रूरत है। कुछ समस्याएँ मिली हैं जो इलाज न होने पर बढ़ सकती हैं।",
    triageMed:  "आपके दाँत ज़्यादातर ठीक हैं, लेकिन कुछ चीज़ों पर ध्यान देना होगा।",
    triageLow:  "अच्छी खबर! आपके दाँत कुल मिलाकर स्वस्थ दिखते हैं।",
    whatFound:  "हमें क्या मिला",
    whatToDo:   "क्या करें:",
    aiConf:     "AI विश्वास",
    costTitle:  "इसका खर्च क्या होगा?",
    costNote:   "इसका खर्च क्लिनिक के अनुसार अलग होता है। सरकारी अस्पतालों में काफी कम खर्च हो सकता है।",
  },
  te: {
    greeting:   "మేము ఏమి కనుగొన్నామో ఇక్కడ ఉంది",
    subtext:    "అన్నీ సరళమైన తెలుగులో వివరించబడ్డాయి. దీన్ని మీ దంత వైద్యుడికి చూపించండి.",
    readBtn:    "బిగ్గరగా చదవండి",
    stopBtn:    "ఆపండి",
    downloadBtn:"निవేదికను డౌన్లోడ్ చేయండి",
    backBtn:    "← నివేదికకు తిరిగి",
    actSoon:    "త్వరగా చేయండి",
    watchThis:  "గమనించండి",
    monitor:    "పర్యవేక్షించండి",
    triageHigh: "మీ నోటికి త్వరలో శ్రద్ధ అవసరం. చికిత్స లేకుండా వదిలేస్తే మరింత దిగజారే కొన్ని సమస్యలు కనుగొనబడ్డాయి.",
    triageMed:  "మీ నోరు ఎక్కువగా బాగానే ఉంది, కానీ కొన్ని విషయాలు గమనించాల్సి ఉంది.",
    triageLow:  "శుభవార్త! మీ దంతాలు మొత్తంగా ఆరోగ్యంగా కనిపిస్తున్నాయి.",
    whatFound:  "మేము ఏమి కనుగొన్నాం",
    whatToDo:   "ఏమి చేయాలి:",
    aiConf:     "AI నమ్మకం",
    costTitle:  "దీనికి ఎంత ఖర్చవుతుంది?",
    costNote:   "ధరలు క్లినిక్ ని బట్టి మారుతాయి. ప్రభుత్వ ఆసుపత్రులలో చాలా తక్కువ ఖర్చు అవుతుంది.",
  },
  kn: {
    greeting:   "ನಾವು ಏನು ಕಂಡುಕೊಂಡಿದ್ದೇವೆ ಎಂದರೆ",
    subtext:    "ಎಲ್ಲವನ್ನೂ ಸರಳ ಕನ್ನಡದಲ್ಲಿ ವಿವರಿಸಲಾಗಿದೆ. ಇದನ್ನು ನಿಮ್ಮ ದಂತ ವೈದ್ಯರಿಗೆ ತೋರಿಸಿ.",
    readBtn:    "ಜೋರಾಗಿ ಓದಿ",
    stopBtn:    "ನಿಲ್ಲಿಸಿ",
    downloadBtn:"ವರದಿ ಡೌನ್ಲೋಡ್ ಮಾಡಿ",
    backBtn:    "← ವರದಿಗೆ ಹಿಂತಿರುಗಿ",
    actSoon:    "ತ್ವರಿತವಾಗಿ ಮಾಡಿ",
    watchThis:  "ಗಮನಿಸಿ",
    monitor:    "ಮೇಲ್ವಿಚಾರಣೆ",
    triageHigh: "ನಿಮ್ಮ ಬಾಯಿಗೆ ಶೀಘ್ರದಲ್ಲೇ ಗಮನ ಬೇಕು. ಚಿಕಿತ್ಸೆ ನೀಡದಿದ್ದರೆ ಇನ್ನಷ್ಟು ಹದಗೆಡಬಹುದಾದ ಕೆಲವು ಸಮಸ್ಯಗಳು ಕಂಡುಬಂದಿವೆ.",
    triageMed:  "ನಿಮ್ಮ ಬಾಯಿ ಹೆಚ್ಚಾಗಿ ಸರಿಯಾಗಿದೆ, ಆದರೆ ಕೆಲವು ವಿಷಯಗಳನ್ನು ಗಮನಿಸಬೇಕು.",
    triageLow:  "ಶುಭ ಸುದ್ದಿ! ನಿಮ್ಮ ಹಲ್ಲುಗಳು ಒಟ್ಟಾರೆ ಆರೋಗ್ಯಕರವಾಗಿ ಕಾಣುತ್ತಿವೆ.",
    whatFound:  "ನಾವು ಏನು ಕಂಡುಕೊಂಡಿದ್ದೇವೆ",
    whatToDo:   "ಏನು ಮಾಡಬೇಕು:",
    aiConf:     "AI ವಿಶ್ವಾಸ",
    costTitle:  "ಇದಕ್ಕೆ ಎಷ್ಟು ಖರ್ಚಾಗುತ್ತದೆ?",
    costNote:   "ಕ್ಲಿನಿಕ್ ಅನ್ವಯ ಬೆಲೆಗಳು ಬದಲಾಗುತ್ತವೆ. ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ಗಣನೀಯವಾಗಿ ಕಡಿಮೆ ಖರ್ಚಾಗಬಹುದು.",
  },
  ta: {
    greeting:   "நாங்கள் கண்டறிந்தது இங்கே உள்ளது",
    subtext:    "அனைத்தும் எளிய தமிழில் விளக்கப்பட்டுள்ளது. இதை உங்கள் பல் மருத்துவரிடம் காட்டுங்கள்.",
    readBtn:    "சத்தமாக படிக்கவும்",
    stopBtn:    "நிறுத்து",
    downloadBtn:"அறிக்கையை பதிவிறக்கு",
    backBtn:    "← அறிக்கைக்கு திரும்பு",
    actSoon:    "விரைவில் செய்யுங்கள்",
    watchThis:  "கவனிங்கள்",
    monitor:    "கண்காணிங்கள்",
    triageHigh: "உங்கள் வாய்க்கு விரைவில் கவனம் தேவை. சிகிச்சையளிக்காவிட்டால் மோசமாகக்கூடிய சில பிரச்சினைகள் கண்டறியப்பட்டன.",
    triageMed:  "உங்கள் வாய் பெரும்பாலும் நலமாக உள்ளது, ஆனால் சில விஷயங்களை கவனிக்க வேண்டும்.",
    triageLow:  "நல்ல செய்தி! உங்கள் பற்கள் ஒட்டுமொத்தமாக ஆரோக்கியமாக தெரிகின்றன.",
    whatFound:  "நாங்கள் கண்டறிந்தது",
    whatToDo:   "என்ன செய்ய வேண்டும்:",
    aiConf:     "AI நம்பிக்கை",
    costTitle:  "இதற்கு எவ்வளவு செலவாகும்?",
    costNote:   "கிளினிக்கைப் பொறுத்து விலைகள் மாறுபடும். அரசு மருத்துவமனைகளில் கணிசமாக குறைவாக செலவாகலாம்.",
  },
};

export const FINDINGS_L10N = {
  en: {
    'Caries': {
      icon: '🦷',
      title: 'Cavity (Decay)',
      desc:  'Bacteria have created a hole in your tooth enamel. If not filled soon, it can reach the nerve and cause severe pain.',
      action: 'Requires a professional filling to stop the decay from spreading.',
    },
    'Filling': {
      icon: '🛠️',
      title: 'Existing Filling',
      desc:  'The AI detected a restoration where a previous cavity was treated. Looks stable.',
      action: 'No immediate action needed. Continue routine monitoring.',
    },
    'Crown': {
      icon: '👑',
      title: 'Dental Crown (Cap)',
      desc:  'A protective cap used to restore a heavily damaged or root-canaled tooth.',
      action: 'Maintain good hygiene around the margin to prevent gum recession.',
    },
    'Bone Loss': {
      icon: '📉',
      title: 'Gum Bone Recession',
      desc:  'The bone supporting your teeth is shrinking. This is often a sign of gum disease (periodontitis).',
      action: 'Deep cleaning (scaling) is required to stop the bone from shrinking further.',
    },
    'Impacted Tooth': {
      icon: '😬',
      title: 'Impacted Tooth',
      desc:  'A tooth that is stuck below the gum line or growing sideways, often pushing against other teeth.',
      action: 'Consult a dentist. May require extraction if causing pain or crowding.',
    },
    'Periapical Lesion': {
      icon: '🦠',
      title: 'Root Infection',
      desc:  'An infection or abscess detected at the tip of the tooth root. This indicates a "dead" or infected nerve.',
      action: 'Urgent: Usually requires Root Canal Treatment (RCT) to save the tooth.',
    },
    'Root Canal Treatment': {
      icon: '🩹',
      title: 'Root Canal Done',
      desc:  'An existing root canal treatment was detected. The tooth has been internally cleaned and sealed.',
      action: 'Monitor for any changes or signs of secondary infection.',
    },
    'Missing Teeth': {
      icon: '⬜',
      title: 'Missing Tooth',
      desc:  'An empty space where a tooth should be. This can cause neighboring teeth to shift over time.',
      action: 'Consider an implant or bridge to restore chewing function and prevent shifting.',
    },
    'Implant': {
      icon: '🔩',
      title: 'Dental Implant',
      desc:  'An artificial titanium root placed in the jawbone to replace a missing tooth.',
      action: 'Keep the area clean. Implants require excellent gum health to last.',
    },
    'Fracture Teeth': {
      icon: '⚡',
      title: 'Cracked/Fractured Tooth',
      desc:  'A physical crack detected in the tooth structure. Like a cracked screen, it will spread under pressure.',
      action: 'Needs immediate protection, usually with a crown or bonding.',
    },
    'Cyst': {
      icon: '🟠',
      title: 'Clinical Cyst',
      desc:  'A fluid-filled sac detected in the jawbone or around a tooth root.',
      action: 'Professional evaluation required. May need surgical drainage or removal.',
    },
    'Attrition': {
      icon: '📏',
      title: 'Tooth Wear',
      desc:  'The top surface of your teeth is wearing down, often due to grinding (bruxism).',
      action: 'Consider a night guard to prevent further loss of tooth height.',
    },
  },
  hi: {
    'Caries': {
      icon: '🦷',
      title: 'दाँत में छेद (सड़न)',
      desc:  'बैक्टीरिया ने आपके दाँत की परत को खा लिया है। यह सड़क के गड्ढे जैसा है — अभी छोटा है, अनदेखा किया तो बड़ा हो जाएगा।',
      action: 'फिलिंग की ज़रूरत है। एक ही विज़िट में होने वाली सरल प्रक्रिया।',
    },
    'Filling': {
      icon: '🛠️',
      title: 'मौजूदा फिलिंग',
      desc:  'AI ने पुरानी फिलिंग का पता लगाया। यह स्थिर लग रही है।',
      action: 'कोई तात्कालिक कार्रवाई आवश्यक नहीं है। नियमित निगरानी रखें।',
    },
    'Crown': {
      icon: '👑',
      title: 'कैप / क्राउन',
      desc:  'दांत की कैप जो क्षतिग्रस्त या रूट-कैनाल वाले दांत को सहारा देती है।',
      action: 'मसूड़े के पास अच्छी सफाई रखें।',
    },
    'Bone Loss': {
      icon: '📉',
      title: 'मसूड़े की हड्डी सिकुड़ रही है',
      desc:  'जो हड्डी आपके दाँतों को जगह पर रखती है वह धीरे-धीरे कम हो रही है। यह मसूड़े की बीमारी से होता है।',
      action: 'स्केलिंग नामक गहरी सफाई की ज़रूरत है। सिकुड़ना रोक देती है।',
    },
    'Impacted Tooth': {
      icon: '😬',
      title: 'दबा हुआ दांत',
      desc:  'दांत जो मसूड़े के अंदर फंसा हुआ है या टेढ़ा उग रहा है।',
      action: 'दंत चिकित्सक से मिलें। दर्द या अन्य दांतों पर दबाव होने पर इसे निकालना पड़ सकता है।',
    },
    'Periapical Lesion': {
      icon: '🦠',
      title: 'जड़ में संक्रमण',
      desc:  'संक्रमण आपके दाँत की जड़ तक पहुँच गया है। इलाज न होने पर दर्द और फैल सकता है।',
      action: 'रूट कैनाल उपचार की ज़रूरत है। संक्रमण को पूरी तरह हटा देता है।',
    },
    'Root Canal Treatment': {
      icon: '🩹',
      title: 'रूट कैनाल हो चुका है',
      desc:  'दांत में पहले से हुआ रूट कैनाल ट्रीटमेंट दिखा।',
      action: 'नियमित रूप से जांच करते रहें।',
    },
    'Missing Teeth': {
      icon: '⬜',
      title: 'खोया हुआ दांत',
      desc:  'एक खाली जगह जहां दांत होना चाहिए था। इसके कारण आस-पास के दांत खिसक सकते हैं।',
      action: 'चबाने में सुधार के लिए डेंटल ब्रिज या इंप्लांट पर विचार करें।',
    },
    'Implant': {
      icon: '🔩',
      title: 'डेंटल इंप्लांट',
      desc:  'कृत्रिम जड़ जो खोए हुए दांत की जगह लगाई गई है।',
      action: 'मसूड़े की सेहत ठीक रखें। इंप्लांट के लिए मसूड़े का स्वस्थ होना आवश्यक है।',
    },
    'Fracture Teeth': {
      icon: '⚡',
      title: 'टूटा हुआ दांत',
      desc:  'दांत की संरचना में दरार पाई गई है। फोन की टूटी हुई स्क्रीन की तरह — फैलने से पहले ठीक करना होगा।',
      action: 'कैप (क्राउन) या बॉन्डिंग द्वारा तत्काल सुरक्षा की आवश्यकता है।',
    },
    'Cyst': {
      icon: '🟠',
      title: 'डेंटल सिस्ट',
      desc:  'हड्डी या जड़ के पास पाई गई पानी की थैली।',
      action: 'दंत चिकित्सक द्वारा जांच आवश्यक है। इसे निकालने की सर्जरी लग सकती है।',
    },
  },
};

export const FALLBACK_L10N = {
  en: { icon:'🔍', title:'Unknown finding', desc:'The AI detected something that needs a closer look.', action:'Please consult your dentist.' },
  hi: { icon:'🔍', title:'अज्ञात खोज', desc:'AI ने कुछ ऐसा पाया जिस पर करीब से ध्यान देना चाहिए।', action:'कृपया अपने दंत चिकित्सक से मिलें।' },
  te: { icon:'🔍', title:'తెలియని కనుగోలు', desc:'AI దగ్గరగా చూడవలసిన ఏదో గుర్తించింది.', action:'దయచేసి మీ దంత వైద్యుడిని సంప్రదించండి.' },
  kn: { icon:'🔍', title:'ಅಜ್ಞಾತ ಸಂಶೋಧನೆ', desc:'AI ಹತ್ತಿರದಿಂದ ನೋಡಬೇಕಾದ ಏನನ್ನೋ ಪತ್ತೆ ಮಾಡಿದೆ.', action:'ದಯವಿಟ್ಟು ನಿಮ್ಮ ದಂತ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.' },
  ta: { icon:'🔍', title:'தெரியாத கண்டுபிடிப்பு', desc:'AI நெருக்கமாக பார்க்க வேண்டியதை கண்டறிந்தது.', action:'தயவுசெய்து உங்கள் பல் மருத்துவரை அணுகுங்கள்.' },
};
