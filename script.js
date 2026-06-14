/* ===========================
   SMART HEALTH GUIDE — script.js
   All frontend logic, no external libraries
   NOTE: Admin auth, form storage, analytics persistence
         need Supabase/backend later.
   =========================== */

// ===== APP STATE =====
const S = {
  lang: 'ar',
  history: [],
  age: null, ageCat: null,
  chronic: [],
  bodySystem: null,
  symptoms: [],
  duration: null,
  progression: null,
  danger: [],
  urgency: null,
  svcType: null,
  safetyWarnings: [],
  userLat: null, userLng: null,
  adminUser: null, adminRole: null,
  // Persisted in localStorage
  reports:   JSON.parse(localStorage.getItem('shg_reports')   || '[]'),
  notifs:    JSON.parse(localStorage.getItem('shg_notifs')    || '[]'),
  settings:  JSON.parse(localStorage.getItem('shg_settings')  || '{"fb_url":"https://facebook.com/AlBasheerER","fb_active":true}'),
  analytics: JSON.parse(localStorage.getItem('shg_analytics') || '{"opens":0,"guidance_starts":0,"results":{},"lang":{},"call_911":0,"maps_clicks":0}')
};

// Demo admin accounts — NOTE: Replace with Supabase auth later
const ADMINS = {
  superadmin: { pass: 'SHG@2025!',  role: 'super',  nameAr: 'المدير الأعلى',    nameEn: 'Super Admin' },
  admin:      { pass: 'Admin123',   role: 'admin',  nameAr: 'مسؤول',            nameEn: 'Admin' },
  editor:     { pass: 'Edit2025',   role: 'editor', nameAr: 'محرر المحتوى',     nameEn: 'Content Editor' }
};

// ===== DATA =====

const FACILITIES = [
  // Emergency Hospitals
  { id:'bashir',    type:'emergency_hospital',   icon:'🏥',
    nameAr:'طوارئ مستشفى البشير',               nameEn:'Al-Bashir Hospital Emergency',
    areaAr:'عمان',                              areaEn:'Amman',
    hoursAr:'طوارئ: 24/7',                      hoursEn:'Emergency: 24/7',
    outpatientAr:'عيادات خارجية: 8ص–3م',       outpatientEn:'Outpatient: 8AM–3PM',
    maps:'https://maps.app.goo.gl/v5ShLk1FWCM4XooPA',
    phone:null, lat:31.9636, lng:35.9218,
    levels:['red','orange'],
    fb:'https://facebook.com/AlBasheerER',
    noteAr:'للحالات الطارئة فقط', noteEn:'Emergency cases only' },

  { id:'hamza',     type:'emergency_hospital',   icon:'🏥',
    nameAr:'مستشفى الأمير حمزة',               nameEn:'Prince Hamza Hospital',
    areaAr:'عمان',                              areaEn:'Amman',
    hoursAr:'طوارئ: 24/7',                      hoursEn:'Emergency: 24/7',
    maps:'https://maps.app.goo.gl/TG1SKPZZ4agaZ4Qx6',
    phone:null, lat:31.9862, lng:35.8743,
    levels:['red','orange'] },

  { id:'totanji',   type:'emergency_hospital',   icon:'🏥',
    nameAr:'مستشفى د. جميل التوتنجي الحكومي',  nameEn:'Dr. Jameel Al-Totanji Govt. Hospital',
    areaAr:'سحاب',                              areaEn:'Sahab',
    hoursAr:'طوارئ: 24/7',                      hoursEn:'Emergency: 24/7',
    maps:'https://maps.app.goo.gl/tzRbEqpBkxasLVLq7',
    phone:null, lat:31.8625, lng:36.0143,
    levels:['red','orange'] },

  // Comprehensive Health Centers
  { id:'amman-comp', type:'comprehensive_health_center', icon:'🏢',
    nameAr:'مركز صحي عمان الشامل',              nameEn:'Amman Comprehensive Health Center',
    areaAr:'دوار الداخلية',                     areaEn:'Al-Dakhiliyya Circle',
    hoursAr:'8:00ص–4:00م (قد تختلف)',           hoursEn:'8:00AM–4:00PM (may vary)',
    maps:'https://maps.app.goo.gl/M5ERrcsF7TMizqPS8',
    phone:'065677351', lat:31.9676, lng:35.8938,
    levels:['yellow','green','blue_white'] },

  { id:'basma',      type:'comprehensive_health_center', icon:'🏢', evening:true,
    nameAr:'مركز صحي الأميرة بسمة',             nameEn:'Princess Basma Health Center',
    areaAr:'جبل عمان / الجوفة',                 areaEn:'Jabal Amman / Al-Jawfa',
    hoursAr:'8:00ص–4:00م',                      hoursEn:'8:00AM–4:00PM',
    eveningAr:'دوام مسائي حتى 10:00م',          eveningEn:'Evening until 10:00PM',
    maps:'https://maps.app.goo.gl/xfqWmLMyFsneSFc46',
    phone:null, lat:31.9539, lng:35.9186,
    levels:['yellow','green','blue_white'],
    distFromBashir:3.9, beneficiaries:750000 },

  { id:'sweileh',    type:'comprehensive_health_center', icon:'🏢',
    nameAr:'مركز صحي صويلح',                    nameEn:'Sweileh Health Center',
    areaAr:'صويلح',                             areaEn:'Sweileh',
    hoursAr:'8:00ص–4:00م',                      hoursEn:'8:00AM–4:00PM',
    maps:'https://maps.app.goo.gl/LPejgCyah41XMBGK9',
    phone:null, lat:32.0223, lng:35.8567,
    levels:['yellow','green','blue_white'] },

  { id:'marj',       type:'comprehensive_health_center', icon:'🏢',
    nameAr:'مركز صحي مرج الحمام',               nameEn:'Marj Al-Hamam Health Center',
    areaAr:'مرج الحمام',                        areaEn:'Marj Al-Hamam',
    hoursAr:'8:00ص–4:00م',                      hoursEn:'8:00AM–4:00PM',
    maps:'https://maps.app.goo.gl/6RRU3p2dJVatj9hd8',
    phone:null, lat:31.9164, lng:35.8588,
    levels:['yellow','green','blue_white'] },

  { id:'tabarbour',  type:'comprehensive_health_center', icon:'🏢',
    nameAr:'مركز صحي طبربور الشامل',            nameEn:'Tabarbour Comprehensive Health Center',
    areaAr:'طبربور',                            areaEn:'Tabarbour',
    hoursAr:'8:00ص–4:00م',                      hoursEn:'8:00AM–4:00PM',
    maps:'https://maps.app.goo.gl/XSFVHMEVczVZbqMy9',
    phone:null, lat:32.0012, lng:35.9221,
    levels:['yellow','green','blue_white'] },

  { id:'wadi-seer',  type:'comprehensive_health_center', icon:'🏢',
    nameAr:'مركز صحي وادي السير الشامل',        nameEn:'Wadi Al-Seer Comprehensive Health Center',
    areaAr:'وادي السير',                        areaEn:'Wadi Al-Seer',
    hoursAr:'8:00ص–4:00م',                      hoursEn:'8:00AM–4:00PM',
    maps:'https://maps.app.goo.gl/BL5iYe4GdEXBW5Nm6',
    phone:null, lat:31.9501, lng:35.8329,
    levels:['yellow','green','blue_white'] },

  { id:'naser',      type:'comprehensive_health_center', icon:'🏢', evening:true,
    nameAr:'مركز صحي النصر الشامل',             nameEn:'Al-Naser Comprehensive Health Center',
    areaAr:'النصر',                             areaEn:'Al-Naser',
    hoursAr:'8:00ص–4:00م',                      hoursEn:'8:00AM–4:00PM',
    eveningAr:'دوام مسائي حتى 10:00م',          eveningEn:'Evening until 10:00PM',
    maps:'https://maps.app.goo.gl/U8vBd4BAtAuemuDQ7',
    phone:null, lat:31.9889, lng:35.9302,
    levels:['yellow','green','blue_white'],
    distFromBashir:5.2, beneficiaries:310441 },

  { id:'khreibet',   type:'comprehensive_health_center', icon:'🏢',
    nameAr:'مركز صحي خريبة السوق',              nameEn:'Khreibet Al-Souq Health Center',
    areaAr:'خريبة السوق',                       areaEn:'Khreibet Al-Souq',
    hoursAr:'8:00ص–4:00م',                      hoursEn:'8:00AM–4:00PM',
    maps:'https://maps.app.goo.gl/gzQfsJpZ3kVF9CSA8',
    phone:null, lat:31.9755, lng:35.9489,
    levels:['yellow','green','blue_white'] },

  { id:'nazzal',     type:'comprehensive_health_center', icon:'🏢', evening:true,
    nameAr:'مركز صحي حي نزال الشامل',           nameEn:'Hay Nazzal Comprehensive Health Center',
    areaAr:'حي نزال',                           areaEn:'Hay Nazzal',
    hoursAr:'8:00ص–4:00م',                      hoursEn:'8:00AM–4:00PM',
    eveningAr:'دوام مسائي حتى 10:00م',          eveningEn:'Evening until 10:00PM',
    maps:'https://maps.app.goo.gl/xuEe2Jzur1tt1jLJ6',
    phone:null, lat:31.9712, lng:35.8901,
    levels:['yellow','green','blue_white'],
    distFromBashir:5.8, beneficiaries:419547 },

  { id:'naour',      type:'comprehensive_health_center', icon:'🏢',
    nameAr:'مركز صحي ناعور الشامل',             nameEn:'Naour Comprehensive Health Center',
    areaAr:'ناعور',                             areaEn:'Naour',
    hoursAr:'8:00ص–4:00م',                      hoursEn:'8:00AM–4:00PM',
    maps:'https://maps.app.goo.gl/a7FUHHsGrGV3MWVw6',
    phone:null, lat:31.8822, lng:35.8021,
    levels:['yellow','green','blue_white'] },

  { id:'qwaysmeh',   type:'comprehensive_health_center', icon:'🏢', evening:true,
    nameAr:'مركز صحي القويسمة الشامل',          nameEn:'Al-Quwaysmeh Comprehensive Health Center',
    areaAr:'القويسمة',                          areaEn:'Al-Quwaysmeh',
    hoursAr:'8:00ص–4:00م',                      hoursEn:'8:00AM–4:00PM',
    eveningAr:'دوام مسائي حتى 10:00م',          eveningEn:'Evening until 10:00PM',
    maps:'https://maps.google.com/?q=Al-Quwaysmeh+Health+Center+Amman',
    phone:null, lat:31.9334, lng:35.9612,
    levels:['yellow','green','blue_white'],
    distFromBashir:2.8, beneficiaries:234500 },

  { id:'maqabeleen', type:'comprehensive_health_center', icon:'🏢', evening:true,
    nameAr:'مركز صحي المقابلين الشامل',         nameEn:'Al-Maqabeleen Comprehensive Health Center',
    areaAr:'المقابلين',                         areaEn:'Al-Maqabeleen',
    hoursAr:'8:00ص–4:00م',                      hoursEn:'8:00AM–4:00PM',
    eveningAr:'دوام مسائي حتى 10:00م',          eveningEn:'Evening until 10:00PM',
    maps:'https://maps.google.com/?q=Maqabeleen+Health+Center+Amman',
    phone:null, lat:32.0089, lng:35.9445,
    levels:['yellow','green','blue_white'],
    distFromBashir:5.8, beneficiaries:153607 }
];

const BODY_SYSTEMS = [
  { id:'respiratory',    icon:'🫁', ar:'الجهاز التنفسي',          en:'Respiratory' },
  { id:'digestive',      icon:'🤢', ar:'الجهاز الهضمي',            en:'Digestive' },
  { id:'cardiovascular', icon:'❤️', ar:'القلب والدورة الدموية',    en:'Cardiovascular' },
  { id:'nervous',        icon:'🧠', ar:'الجهاز العصبي',            en:'Nervous System' },
  { id:'musculoskeletal',icon:'🦵', ar:'العظام والعضلات',          en:'Musculoskeletal' },
  { id:'injury',         icon:'🩹', ar:'الإصابات والجروح',         en:'Injury & Wounds' },
  { id:'general',        icon:'🌡️', ar:'أعراض عامة',               en:'General Symptoms' },
  { id:'routine',        icon:'📋', ar:'مشكلة مزمنة أو روتينية',  en:'Routine / Chronic' }
];

const SYMPTOMS = {
  respiratory: [
    { ar:'سعال بسيط',                   en:'Mild cough',                       lvl:'green' },
    { ar:'سعال مستمر بدون ضيق تنفس',   en:'Persistent cough without SOB',     lvl:'green' },
    { ar:'ضيق تنفس',                    en:'Shortness of breath',              lvl:'yellow' },
    { ar:'ضيق تنفس شديد',              en:'Severe shortness of breath',       lvl:'orange', d:true },
    { ar:'صفير بالصدر',                 en:'Wheezing',                         lvl:'yellow' },
    { ar:'حرارة',                       en:'Fever',                            lvl:'yellow' }
  ],
  digestive: [
    { ar:'ألم بطن بسيط',               en:'Mild abdominal pain',              lvl:'green' },
    { ar:'ألم بطن متوسط',              en:'Moderate abdominal pain',          lvl:'yellow' },
    { ar:'ألم بطن شديد',               en:'Severe abdominal pain',            lvl:'orange', d:true },
    { ar:'غثيان',                       en:'Nausea',                           lvl:'green' },
    { ar:'تقيؤ مستمر',                 en:'Persistent vomiting',              lvl:'yellow' },
    { ar:'إسهال مستمر',                en:'Persistent diarrhea',              lvl:'yellow' },
    { ar:'علامات جفاف',                en:'Dehydration signs',                lvl:'yellow' }
  ],
  cardiovascular: [
    { ar:'خفقان بسيط',                 en:'Mild palpitations',                lvl:'yellow' },
    { ar:'ألم صدر',                    en:'Chest pain',                       lvl:'orange', d:true },
    { ar:'ألم صدر شديد',              en:'Severe chest pain',                lvl:'orange', d:true },
    { ar:'إغماء',                      en:'Fainting',                         lvl:'orange', d:true }
  ],
  nervous: [
    { ar:'صداع بسيط',                  en:'Mild headache',                    lvl:'green' },
    { ar:'صداع شديد',                  en:'Severe headache',                  lvl:'yellow' },
    { ar:'دوخة',                       en:'Dizziness',                        lvl:'yellow' },
    { ar:'تشوش أو ارتباك',            en:'Confusion',                        lvl:'orange', d:true },
    { ar:'ميلان في الوجه',             en:'Face drooping',                    lvl:'red', d:true },
    { ar:'ضعف في الذراع',             en:'Arm weakness',                     lvl:'red', d:true },
    { ar:'صعوبة في الكلام',           en:'Speech difficulty',                lvl:'red', d:true },
    { ar:'فقدان وعي تام',             en:'Complete loss of consciousness',   lvl:'red', d:true }
  ],
  musculoskeletal: [
    { ar:'ألم مفاصل بسيط',            en:'Mild joint pain',                  lvl:'green' },
    { ar:'ألم عضلي بسيط',             en:'Mild muscle pain',                 lvl:'green' },
    { ar:'التواء بسيط',               en:'Mild sprain',                      lvl:'green' },
    { ar:'صعوبة في المشي',            en:'Difficulty walking',               lvl:'yellow' },
    { ar:'كسر مضاعف',                 en:'Complicated fracture',             lvl:'orange', d:true }
  ],
  injury: [
    { ar:'جرح بسيط',                   en:'Minor wound',                      lvl:'green' },
    { ar:'نزيف شديد غير مسيطر عليه', en:'Severe uncontrolled bleeding',     lvl:'red', d:true },
    { ar:'إصابة شديدة',               en:'Severe trauma',                    lvl:'red', d:true },
    { ar:'حرق',                        en:'Burn',                             lvl:'orange', d:true },
    { ar:'تورم بعد إصابة',            en:'Swelling after injury',            lvl:'yellow' },
    { ar:'فتح الجرح بعد عملية',       en:'Wound opening after surgery',      lvl:'orange', d:true }
  ],
  general: [
    { ar:'حرارة بسيطة',               en:'Mild fever',                       lvl:'green' },
    { ar:'حرارة عالية',               en:'High fever',                       lvl:'yellow' },
    { ar:'ضعف شديد',                  en:'Severe weakness',                  lvl:'yellow' },
    { ar:'أعراض صدمة',                en:'Shock symptoms',                   lvl:'red', d:true },
    { ar:'حساسية شديدة',              en:'Severe allergic reaction',         lvl:'orange', d:true }
  ],
  routine: [
    { ar:'أعراض منذ أيام/أسابيع بدون تدهور', en:'Symptoms for days/weeks, no sudden worsening', lvl:'blue_white' },
    { ar:'تجديد وصفة',                en:'Prescription refill',              lvl:'blue_white' },
    { ar:'فحص روتيني',                en:'Routine checkup',                  lvl:'blue_white' },
    { ar:'طلب فحوصات',               en:'Lab test request',                 lvl:'blue_white' },
    { ar:'متابعة طبية',              en:'Follow-up appointment',             lvl:'blue_white' }
  ]
};

const CHRONIC_OPTIONS = [
  { ar:'السكري',                 en:'Diabetes' },
  { ar:'ارتفاع ضغط الدم',       en:'Hypertension' },
  { ar:'الربو',                  en:'Asthma' },
  { ar:'أمراض القلب',            en:'Heart disease' },
  { ar:'الحمل',                  en:'Pregnancy' },
  { ar:'ضعف المناعة',            en:'Immunosuppression' },
  { ar:'كبار السن مع ضعف عام',  en:'Elderly with frailty' },
  { ar:'استخدام مميعات الدم',   en:'Blood thinner use' },
  { ar:'أخرى',                   en:'Other' },
  { ar:'لا يوجد',                en:'None' }
];

const SAFETY_WARNINGS = [
  { ar:'ألم صدر شديد',               en:'Severe chest pain',            lvl:'orange' },
  { ar:'ضيق تنفس شديد',             en:'Severe shortness of breath',   lvl:'orange' },
  { ar:'فقدان الوعي',               en:'Loss of consciousness',        lvl:'red' },
  { ar:'نزيف شديد',                  en:'Severe bleeding',              lvl:'red' },
  { ar:'ألم شديد',                   en:'Severe pain',                  lvl:'orange' },
  { ar:'حرارة عالية',               en:'High fever',                   lvl:'yellow' },
  { ar:'تورم شديد',                  en:'Severe swelling',              lvl:'yellow' },
  { ar:'خدر أو فقدان إحساس',        en:'Numbness or loss of sensation',lvl:'orange' },
  { ar:'ازرقاق أو شحوب الأصابع',    en:'Blue or pale fingers/toes',    lvl:'orange' },
  { ar:'فتح الجرح بعد عملية',       en:'Wound opening after surgery',  lvl:'orange' },
  { ar:'صديد أو رائحة أو احمرار',   en:'Pus, bad smell, or spreading redness', lvl:'yellow' },
  { ar:'لا يوجد أي مما سبق',        en:'None of the above',            lvl:'none' }
];

const RED_DANGER = [
  { ar:'توقف التنفس',               en:'Not breathing' },
  { ar:'توقف القلب',                en:'Cardiac arrest' },
  { ar:'فقدان وعي تام',            en:'Complete loss of consciousness' },
  { ar:'نزيف شديد غير مسيطر عليه', en:'Severe uncontrolled bleeding' },
  { ar:'أعراض صدمة',               en:'Shock symptoms' },
  { ar:'إصابة شديدة غير مستقرة',   en:'Severe trauma, unstable condition' }
];

const ORANGE_DANGER = [
  { ar:'ألم صدر شديد',               en:'Severe chest pain' },
  { ar:'ضيق تنفس شديد',             en:'Severe shortness of breath' },
  { ar:'علامات اشتباه جلطة',        en:'Suspected stroke signs' },
  { ar:'ميلان في الوجه',            en:'Face drooping' },
  { ar:'ضعف في الذراع',            en:'Arm weakness' },
  { ar:'صعوبة في الكلام',          en:'Speech difficulty' },
  { ar:'كسر مضاعف',                en:'Complicated fracture' },
  { ar:'حساسية شديدة',             en:'Severe allergic reaction' },
  { ar:'ألم بطن شديد مع علامات خطر',en:'Severe abdominal pain with danger signs' }
];

const DURATION_OPTIONS = [
  { ar:'أقل من ساعة',            en:'Less than 1 hour',     v:'<1h' },
  { ar:'منذ 1–6 ساعات',          en:'1–6 hours',            v:'1-6h' },
  { ar:'منذ 6–24 ساعة',          en:'6–24 hours',           v:'6-24h' },
  { ar:'منذ 1–3 أيام',           en:'1–3 days',             v:'1-3d' },
  { ar:'منذ أكثر من 3 أيام',     en:'More than 3 days',     v:'>3d' },
  { ar:'منذ أكثر من أسبوع',      en:'More than 1 week',     v:'>1w' },
  { ar:'منذ أسابيع أو أشهر',     en:'Weeks or months',      v:'weeks' },
  { ar:'لا أعرف',                en:"I don't know",          v:'unknown' }
];

const PROGRESSION_OPTIONS = [
  { ar:'تتحسن',     en:'Improving',    v:'improving', i:'📈' },
  { ar:'ثابتة',     en:'Same',         v:'same',      i:'➡️' },
  { ar:'تزداد سوءًا',en:'Getting worse',v:'worse',    i:'📉' },
  { ar:'لا أعرف',   en:'Not sure',     v:'unknown',   i:'❓' }
];

// Urgency level configurations
const URG = {
  red:       { cls:'urg-red',    icon:'🔴', badgeAr:'الأحمر - طارئ فوري',    badgeEn:'RED - Immediate Emergency',
               titleAr:'حالة طارئة تهدد الحياة',   titleEn:'Life-Threatening Emergency',
               actAr:'اتصل بـ 911 أو اذهب إلى أقرب طوارئ فورًا. لا تنتظر.',
               actEn:'Call 911 or go to the nearest emergency immediately. Do not wait.',
               dest:['emergency_hospital'], show911:true },
  orange:    { cls:'urg-orange', icon:'🟠', badgeAr:'البرتقالي - طارئ جدًا', badgeEn:'ORANGE - Very Urgent',
               titleAr:'حالة عاجلة جداً',           titleEn:'Very Urgent Condition',
               actAr:'اذهب إلى الطوارئ فورًا. إذا كانت الأعراض شديدة اتصل بـ 911.',
               actEn:'Go to emergency immediately. Call 911 if symptoms are very severe.',
               dest:['emergency_hospital'], show911:true },
  yellow:    { cls:'urg-yellow', icon:'🟡', badgeAr:'الأصفر - مستعجل',       badgeEn:'YELLOW - Urgent',
               titleAr:'يحتاج مراجعة طبية قريبة',  titleEn:'Needs Medical Review Soon',
               actAr:'أقرب مركز صحي شامل اليوم. إذا تدهورت الأعراض اذهب للطوارئ.',
               actEn:'Nearest comprehensive health center today. If symptoms worsen, go to emergency.',
               dest:['comprehensive_health_center'], show911:false },
  green:     { cls:'urg-green',  icon:'🟢', badgeAr:'الأخضر - أقل استعجالًا',badgeEn:'GREEN - Less Urgent',
               titleAr:'لا تبدو حالة طارئة',         titleEn:'Does Not Appear Urgent',
               actAr:'أقرب مركز صحي أو عيادة إذا استمرت الأعراض أو تكررت.',
               actEn:'Nearest health center or clinic if symptoms persist or recur.',
               dest:['comprehensive_health_center'], show911:false },
  blue_white:{ cls:'urg-blue',   icon:'🔵', badgeAr:'الأزرق - غير عاجل',     badgeEn:'BLUE - Non-Urgent',
               titleAr:'خدمة روتينية أو غير عاجلة',  titleEn:'Routine / Non-Urgent',
               actAr:'ابدأ بأقرب مركز صحي شامل للتقييم أو التحويل/الموعد.',
               actEn:'Start with nearest comprehensive health center for review or referral/appointment.',
               dest:['comprehensive_health_center'], show911:false }
};

// Non-emergency service messages
const NE_MSGS = {
  cast:        { ar:'إعادة عمل الجبيرة أو تعديلها غالبًا لا تحتاج الطوارئ إذا لم يوجد ألم شديد، تورم، خدر، أو ازرقاق. راجع أقرب مركز صحي شامل أو عيادة عظام.',                    en:'Cast/splint adjustment usually does not require emergency if no severe pain, swelling, numbness, or blue fingers. Visit nearest health center or orthopedic clinic.' },
  dressing:    { ar:'غيارات الجروح وما بعد العمليات تتم في عيادات الغيار أو المركز الصحي، وليس في الطوارئ، إذا لم توجد علامات التهاب أو نزيف شديد.',                              en:'Wound dressings are usually handled at dressing clinics or health centers, not emergency, if no infection signs or severe bleeding.' },
  report:      { ar:'التقارير الطبية تُطلب من العيادات أو الطبيب المعالج، وليس من الطوارئ. راجع المركز الصحي أو العيادة المختصة.',                                 en:'Non-legal medical reports are handled by clinics or the treating doctor, not emergency. Visit the health center or relevant clinic.' },
  vaccination: { ar:'متابعة المطاعيم تتم في المراكز الصحية أو عيادات المطاعيم، وليس في الطوارئ. راجع أقرب مركز صحي حسب منطقتك وأوقات الدوام.',                                en:'Vaccination follow-up is handled by health centers or vaccination clinics, not emergency. Visit the nearest health center per your area and working hours.' },
  prescription:{ ar:'تجديد -الوصفات الطبية/الادويه الشهرية يكون عبر المركز الصحي أو العيادات الخارجية أو القنوات الإلكترونية المعتمدة، وليس الطوارئ.',                                                         en:'Prescription refills or chronic medications are handled through health centers or outpatient clinics, not emergency.' },
  tests:       { ar:'الفحوصات الروتينية ومتابعة النتائج تتم في المركز الصحي أو العيادات الخارجية بموعد أو تحويل.',                                                               en:'Routine tests and result follow-up are handled at health centers or outpatient clinics by appointment or referral.' },
  referral:    { ar:'للاستفسار عن التحويلات الطبيه-ديوان/عيادات اختصاص، ابدأ بأقرب مركز صحي شامل. قد يساعدك المركز في التقييم وترتيب التحويل للعيادات الخارجية.',                               en:'For a specialist appointment or referral, start with the nearest comprehensive health center. They can provide assessment and arrange outpatient referrals.' },
  sicklv:      { ar:'التطبيق لا يقرر الاجازات المرضية وإعتمادها ولا يضمنها. الطبيب المعالج يقرر الحاجة ومدتها حسب الفحص والتعليمات. لا يُنصح بمراجعة الطوارئ فقط للحصول على إجازة مرضية.',                     en:'The app does not decide or guarantee sick leave. The treating doctor decides based on examination and regulations. Do not visit emergency only to obtain sick leave.' }
};

const PATHWAY_OPTIONS = [
  { icon:'🤒', ar:'أعراض صحية جديدة',                       en:'New Symptoms',                         action:()=>go('s-age') },
  { icon:'🦴', ar:'استفسر عن الكسور/الجبيره القديمة',   en:'Fracture / Old Cast Inquiry',           action:()=>startNE('cast') },
  { icon:'🩹', ar:'العنايه بالجروح/العمليات السابقه',   en:'Wound / Previous Operation Care',       action:()=>startNE('dressing') },
  { icon:'📄', ar:'التقارير الطبية',                    en:'Medical Reports',                       action:()=>startNE('report') },
  { icon:'💉', ar:'المطاعيم الطبيه',                    en:'Medical Vaccinations',                  action:()=>startNE('vaccination') },
  { icon:'💊', ar:'تجديد -الوصفات الطبية/الادويه الشهرية', en:'Prescription Renewals / Monthly Medications', action:()=>startNE('prescription') },
  { icon:'🔬', ar:'الفحوصات المخبرية الشاملة ونتائجها', en:'Comprehensive Lab Tests and Results',   action:()=>startNE('tests') },
  { icon:'🏨', ar:'التحويلات الطبيه-ديوان/عيادات اختصاص', en:'Medical Referrals - Bureau/Specialty Clinics', action:()=>startNE('referral') },
  { icon:'📝', ar:'الاجازات المرضية وإعتمادها',       en:'Sick Leaves and Approval',              action:()=>startNE('sicklv') },
  { icon:'❓', ar:'أخرى',                                   en:'Other',                                action:()=>go('s-age') }
];

const ARTICLES = [
  { id:1, cat:'emergency', icon:'🚨',
    titleAr:'متى أتصل بـ 911؟',                titleEn:'When Should I Call 911?',
    sumAr:'تعرف على المواقف التي تستدعي الاتصال الفوري.',sumEn:'Learn when to call emergency services immediately.',
    bodyAr:`<h4>رقم الطوارئ في الأردن: 911</h4><p>يعمل على مدار الساعة.</p><h4>متى تتصل بـ 911؟</h4><ul><li>توقف التنفس أو توقف القلب</li><li>فقدان الوعي التام</li><li>نزيف شديد لا يمكن إيقافه</li><li>أعراض جلطة: ميلان الوجه، ضعف الذراع، صعوبة الكلام</li><li>ألم صدر شديد مفاجئ</li><li>ضيق تنفس شديد</li><li>حادث أو إصابة شديدة</li></ul><h4>ماذا تقول؟</h4><p>أخبر المجيب بموقعك، صف الحالة، واستمر بالحديث حتى وصول المساعدة.</p>`,
    bodyEn:`<h4>Jordan's emergency number: 911</h4><p>Available 24/7.</p><h4>When to call 911?</h4><ul><li>Respiratory or cardiac arrest</li><li>Complete loss of consciousness</li><li>Severe uncontrolled bleeding</li><li>Stroke signs: face drooping, arm weakness, speech difficulty</li><li>Sudden severe chest pain</li><li>Severe shortness of breath</li><li>Severe accident or trauma</li></ul><h4>What to say?</h4><p>Give your location, describe the condition briefly, and stay on the line until help arrives.</p>`,
    warnAr:'عند أي من هذه الأعراض، اتصل بـ 911 فورًا ولا تنتظر.',warnEn:'With any of these symptoms, call 911 immediately and do not wait.',
    destAr:'911 والطوارئ فورًا',destEn:'911 and emergency immediately' },

  { id:2, cat:'emergency', icon:'❤️',
    titleAr:'علامات تحذيرية لألم الصدر',       titleEn:'Chest Pain Warning Signs',
    sumAr:'ألم الصدر المفاجئ قد يكون علامة خطر.',sumEn:'Sudden chest pain can be a warning sign.',
    bodyAr:`<h4>أعراض قد ترتبط بحالة عاجلة:</h4><ul><li>ألم صدر شديد مفاجئ</li><li>ألم ينتشر للذراع أو الفك</li><li>ضيق تنفس مصاحب</li><li>تعرق شديد مفاجئ</li><li>دوخة أو إغماء</li></ul><h4>مهم:</h4><p>لا تقد السيارة بنفسك. اطلب المساعدة فورًا أو اتصل بـ 911.</p>`,
    bodyEn:`<h4>Symptoms that may be associated with urgent condition:</h4><ul><li>Sudden severe chest pain</li><li>Pain spreading to arm or jaw</li><li>Shortness of breath</li><li>Sudden heavy sweating</li><li>Dizziness or near-fainting</li></ul><h4>Important:</h4><p>Do not drive yourself. Ask for help immediately or call 911.</p>`,
    warnAr:'ألم الصدر الشديد المفاجئ: اتصل بـ 911 فورًا.',warnEn:'Sudden severe chest pain: call 911 immediately.',
    destAr:'911 والطوارئ فورًا',destEn:'911 and emergency immediately' },

  { id:3, cat:'emergency', icon:'🧠',
    titleAr:'علامات الجلطة الدماغية',          titleEn:'Stroke Warning Signs',
    sumAr:'الجلطة الدماغية طارئة طبية. كل دقيقة مهمة.',sumEn:'Stroke is a medical emergency. Every minute counts.',
    bodyAr:`<h4>اعرف علامات الجلطة: FAST</h4><ul><li><b>F - الوجه:</b> هل يميل؟</li><li><b>A - الذراعان:</b> هل يستطيع رفعهما معًا؟</li><li><b>S - الكلام:</b> هل متعثر؟</li><li><b>T - الوقت:</b> اتصل بـ 911 فورًا!</li></ul>`,
    bodyEn:`<h4>Know stroke signs: FAST</h4><ul><li><b>F - Face:</b> Is one side drooping?</li><li><b>A - Arms:</b> Can they raise both evenly?</li><li><b>S - Speech:</b> Is it slurred?</li><li><b>T - Time:</b> Call 911 immediately!</li></ul>`,
    warnAr:'اتصل بـ 911 فورًا. الوقت يساوي الدماغ.',warnEn:'Call 911 immediately. Time is brain.',
    destAr:'911 والطوارئ فورًا',destEn:'911 and emergency immediately' },

  { id:4, cat:'health-center', icon:'🏢',
    titleAr:'متى أزور مركزًا صحيًا شاملاً؟',  titleEn:'When to Visit a Comprehensive Health Center?',
    sumAr:'المراكز الصحية الشاملة للحالات المستقرة.',sumEn:'Health centers are for stable conditions.',
    bodyAr:`<h4>الخدمات المتاحة:</h4><ul><li>التقييم الطبي الأولي</li><li>متابعة الأمراض المزمنة</li><li>صرف الأدوية المزمنة (حسب التوفر)</li><li>الفحوصات الأساسية</li><li>التطعيم</li><li>التحويل للعيادات الخارجية</li></ul><h4>متى تزوره؟</h4><ul><li>أعراض مستقرة</li><li>متابعة أمراض مزمنة</li><li>تجديد وصفة أو فحص روتيني</li></ul>`,
    bodyEn:`<h4>Available services:</h4><ul><li>Initial medical assessment</li><li>Chronic disease follow-up</li><li>Chronic medication (subject to availability)</li><li>Basic tests</li><li>Vaccination</li><li>Outpatient referral</li></ul><h4>When to visit?</h4><ul><li>Stable symptoms</li><li>Chronic disease follow-up</li><li>Prescription refill or routine checkup</li></ul>`,
    warnAr:'إذا تدهورت الأعراض فجأة، اذهب للطوارئ فورًا.',warnEn:'If symptoms suddenly worsen, go to emergency immediately.',
    destAr:'المركز الصحي الشامل',destEn:'Comprehensive health center' },

  { id:5, cat:'awareness', icon:'💙',
    titleAr:'قرارك قد ينقذ غيرك',             titleEn:'Your Decision May Save Someone Else',
    sumAr:'وراء باب الطوارئ قد يكون شخص في خطر حقيقي.',sumEn:'Behind the emergency door someone in real danger may be waiting.',
    bodyAr:`<h4>قرارك قد ينقذ غيرك</h4><p>الطوارئ نقطة إنقاذ الأرواح. عندما يتوجه كثيرون بحالات بسيطة، قد يتأخر وصول الفريق الطبي لحالة حرجة فعلًا.</p><h4>الطوارئ مخصصة لـ:</h4><ul><li>الحالات المهددة للحياة</li><li>الحالات التي قد تتدهور بسرعة</li><li>الإصابات الخطيرة</li></ul><p>للحالات المستقرة: المركز الصحي الشامل خيار أفضل وأسرع.</p>`,
    bodyEn:`<h4>Your decision may save someone else</h4><p>Emergency is a lifesaving point. When many come with mild cases, the team may be delayed from a truly critical case.</p><h4>Emergency is for:</h4><ul><li>Life-threatening conditions</li><li>Conditions that may deteriorate quickly</li><li>Serious injuries</li></ul><p>For stable cases: a comprehensive health center is a better and faster option.</p>`,
    warnAr:'إذا كانت لديك علامات خطر، اذهب للطوارئ فورًا.',warnEn:'If you have warning signs, go to emergency immediately.',
    destAr:'حسب الحالة: مركز صحي للمستقرة — طوارئ للخطيرة',destEn:'Depends: health center for stable — emergency for serious' },

  { id:6, cat:'services', icon:'💊',
    titleAr:'تجديد الوصفة والأدوية المزمنة',  titleEn:'Prescription Refills and Chronic Medications',
    sumAr:'تجديد الوصفات عبر المركز الصحي، وليس الطوارئ.',sumEn:'Prescription refills go through health centers, not emergency.',
    bodyAr:`<h4>أين أجدد وصفتي؟</h4><p>المركز الصحي الشامل هو المكان المناسب في معظم الحالات.</p><ul><li>أحضر الوصفة القديمة أو بطاقة الأدوية</li><li>سيقيّم الطبيب حالتك</li><li>بعض الأدوية المتخصصة قد تحتاج تحويلًا</li></ul><p>لا يضمن التطبيق توفر الدواء. يُنصح بالاتصال مسبقًا.</p>`,
    bodyEn:`<h4>Where to refill my prescription?</h4><p>The comprehensive health center is the right place in most cases.</p><ul><li>Bring the old prescription or medication card</li><li>The doctor will assess your condition</li><li>Some specialized medications may need outpatient referral</li></ul><p>The app does not guarantee medication availability. Please call ahead.</p>`,
    warnAr:'إذا نفدت الأدوية وظهرت أعراض خطيرة، اذهب للطوارئ فورًا.',warnEn:'If medication runs out and serious symptoms appear, go to emergency immediately.',
    destAr:'المركز الصحي الشامل',destEn:'Comprehensive health center' },

  { id:7, cat:'emergency', icon:'🚪',
    titleAr:'الطوارئ ليست الطريق الأسرع لكل الخدمات',titleEn:'Emergency Is Not the Fastest Route for Every Service',
    sumAr:'لماذا قد تنتظر أطول في الطوارئ للحالات غير العاجلة؟',sumEn:'Why you may wait longer in emergency for non-urgent cases.',
    bodyAr:`<h4>كيف يعمل الفرز الطبي؟</h4><p>في الطوارئ يتم الفرز حسب الخطورة، ليس وقت الوصول. الحالات الأقل خطورة قد تنتظر ساعات.</p><h4>المركز الصحي قد يكون أسرع لأن:</h4><ul><li>أوقات انتظار أقصر للحالات المستقرة</li><li>التقييم والعلاج والوصفة في مكان واحد</li></ul>`,
    bodyEn:`<h4>How does triage work?</h4><p>In emergency, triage is based on severity, not arrival time. Less urgent cases may wait hours.</p><h4>Health center may be faster because:</h4><ul><li>Shorter wait times for stable cases</li><li>Assessment, treatment, and prescription in one place</li></ul>`,
    warnAr:'الأعراض الخطيرة = الطوارئ فورًا.',warnEn:'Serious symptoms = emergency immediately.',
    destAr:'المركز الصحي للحالات المستقرة',destEn:'Health center for stable cases' },

  { id:8, cat:'health-center', icon:'🏥',
    titleAr:'متى أراجع المركز الصحي بدل الطوارئ؟',titleEn:'When to Visit Health Center Instead of Emergency?',
    sumAr:'دليل عملي للتمييز بين ما يحتاج طوارئ وما لا يحتاج.',sumEn:'Practical guide: emergency vs health center.',
    bodyAr:`<h4>مناسب للمركز الصحي:</h4><ul><li>أعراض تنفسية بسيطة مستقرة</li><li>حرارة بدون أعراض خطيرة</li><li>آلام بسيطة مستقرة</li><li>متابعة أمراض مزمنة</li><li>تجديد وصفات، تطعيمات</li></ul><h4>يحتاج الطوارئ:</h4><ul><li>ألم صدر أو ضيق تنفس شديد</li><li>فقدان الوعي، نزيف شديد</li><li>علامات جلطة، إصابات خطيرة</li></ul>`,
    bodyEn:`<h4>Suitable for health center:</h4><ul><li>Mild stable respiratory symptoms</li><li>Fever without serious symptoms</li><li>Mild stable pain</li><li>Chronic disease follow-up</li><li>Prescription refills, vaccinations</li></ul><h4>Needs emergency:</h4><ul><li>Severe chest pain or shortness of breath</li><li>Loss of consciousness, severe bleeding</li><li>Stroke signs, serious injuries</li></ul>`,
    warnAr:'في حال الشك دائمًا توجه للطوارئ أو اتصل بـ 911.',warnEn:'When in doubt, always go to emergency or call 911.',
    destAr:'المركز الصحي للمستقرة — الطوارئ للخطيرة',destEn:'Health center for stable — emergency for serious' }
];

const ART_CATS = [
  { id:'all',          ar:'الكل',              en:'All' },
  { id:'emergency',    ar:'الطوارئ',           en:'Emergency' },
  { id:'health-center',ar:'المراكز الصحية',    en:'Health Centers' },
  { id:'awareness',    ar:'التوعية',           en:'Awareness' },
  { id:'services',     ar:'الخدمات',           en:'Services' }
];

const MANUAL_AREAS = [
  { id:'dakhiliyya', ar:'دوار الداخلية',     en:'Al-Dakhiliyya Circle', fid:'amman-comp' },
  { id:'jawfa',      ar:'الجوفة / جبل عمان', en:'Jawfa / Jabal Amman',  fid:'basma' },
  { id:'sweileh',    ar:'صويلح',             en:'Sweileh',               fid:'sweileh' },
  { id:'marj',       ar:'مرج الحمام',        en:'Marj Al-Hamam',         fid:'marj' },
  { id:'tabarbour',  ar:'طبربور',            en:'Tabarbour',             fid:'tabarbour' },
  { id:'wadi',       ar:'وادي السير',        en:'Wadi Al-Seer',          fid:'wadi-seer' },
  { id:'naser',      ar:'النصر',             en:'Al-Naser',              fid:'naser' },
  { id:'khreibet',   ar:'خريبة السوق',       en:'Khreibet Al-Souq',      fid:'khreibet' },
  { id:'nazzal',     ar:'حي نزال',           en:'Hay Nazzal',            fid:'nazzal' },
  { id:'naour',      ar:'ناعور',             en:'Naour',                 fid:'naour' },
  { id:'qwaysmeh',   ar:'القويسمة',          en:'Al-Quwaysmeh',          fid:'qwaysmeh' },
  { id:'maqabeleen', ar:'المقابلين',         en:'Al-Maqabeleen',         fid:'maqabeleen' }
];


// ===== CONTEXTUAL JOURNAL / SERVICE MAP =====
const SERVICE_INFO = {
  cast: { ar:'استفسر عن الكسور/الجبيره القديمة', en:'Fracture / Old Cast Inquiry', anchor:'casts' },
  dressing: { ar:'العنايه بالجروح/العمليات السابقه', en:'Wound / Previous Operation Care', anchor:'wounds' },
  report: { ar:'التقارير الطبية', en:'Medical Reports', anchor:'reports' },
  vaccination: { ar:'المطاعيم الطبيه', en:'Medical Vaccinations', anchor:'vaccines' },
  prescription: { ar:'تجديد -الوصفات الطبية/الادويه الشهرية', en:'Prescription Renewals / Monthly Medications', anchor:'prescriptions' },
  tests: { ar:'الفحوصات المخبرية الشاملة ونتائجها', en:'Comprehensive Lab Tests and Results', anchor:'tests' },
  referral: { ar:'التحويلات الطبيه-ديوان/عيادات اختصاص', en:'Medical Referrals - Bureau/Specialty Clinics', anchor:'referrals' },
  sicklv: { ar:'الاجازات المرضية وإعتمادها', en:'Sick Leaves and Approval', anchor:'sick_leave' }
};

const VACCINE_SAFETY_OPTIONS = [
  { id:'breathing', ar:'صعوبة تنفس بعد المطعوم أو بعد التعرض لعقر/لدغ', en:'Breathing difficulty after vaccine or bite/sting exposure', lvl:'red' },
  { id:'swelling', ar:'تورم شديد في الوجه أو اللسان أو الحلق', en:'Severe swelling of face, tongue, or throat', lvl:'red' },
  { id:'allergy', ar:'طفح جلدي منتشر أو أعراض حساسية شديدة', en:'Widespread rash or severe allergy symptoms', lvl:'orange' },
  { id:'fever', ar:'حرارة عالية أو مستمرة أو تدهور واضح', en:'High or persistent fever, or clear worsening', lvl:'yellow' },
  { id:'routine', ar:'استفسار روتيني عن موعد أو جرعة أو استكمال مطعوم', en:'Routine inquiry about appointment, dose, or vaccine completion', lvl:'blue_white' }
];

const JOURNAL_SECTIONS = [
  { anchor:'vaccines', title:'المطاعيم الطبيه', icon:'💉', quick:true, html:`
    <h3 id="emergency-vaccines">🚨 المطاعيم الطارئة</h3>
    <p>تنظم هذا الجزء الحالات التي تعرضت لإصابة مباشرة أو خطرة وتحتاج تدخلاً فورياً في نفس اليوم. توفر وزارة الصحة الأردنية مطاعيم وأمصال طارئة ومجانية في أقسام الطوارئ والمستشفيات والمراكز الصحية الشاملة للتعامل الفوري مع الحوادث.</p>
    <ul><li><b>مطعوم ومصل الكزاز Tetanus:</b> يعطى فوراً في حالات الجروح العميقة أو الملوثة أو الناتجة عن أدوات حادة وصدئة مثل المسامير لمنع تلوث المجرى الدموي.</li><li><b>مطعوم ومصل داء الكلب / السعار Rabies Anti:</b> الجرعة الإسعافية الأولى ضرورية فور التعرض للعقر أو الخدش المباشر من الكلاب الضالة أو الحيوانات الثدية.</li><li><b>أمصال لدغات الأفاعي والعقارب:</b> أمصال علاجية تعطى فوراً في الطوارئ لإبطال مفعول السموم في الجسم عند التعرض للدغ.</li></ul>
    <div class="journal-alert">نصيحة وقائية عاجلة: في حال التعرض لعقر حيوان أو جرح ملوث، يجب غسل مكان الإصابة بالماء والصابون جيداً لمدة 15 دقيقة كإسعاف أولي، ثم التوجه فوراً لأقرب طوارئ.</div>
    <h3 id="dose-completion">📅 المطاعيم غير الطارئة / استكمال الجرعات</h3>
    <p>هذا الجزء مخصص للمتابعات الروتينية واستكمال بروتوكولات العلاج لضمان الفعالية الطبية التامة للمطاعيم وبناء المناعة الكاملة للمراجعين.</p>
    <p><b>أماكن أخذ المطاعيم واستكمالها:</b> تؤخذ وتستكمل هذه الجرعات حصرياً في المراكز الصحية الشاملة، مراكز الأمومة والطفولة، أو العيادات الخارجية للمستشفيات.</p>
    <div class="journal-alert">تنبيه هام: هذه المطاعيم لا تعطى نهائياً في أقسام ومباني الطوارئ، فالطوارئ مخصصة للحالات الحرجة والجرعات الإنقاذية الأولى.</div>
    <ul><li>استكمال بروتوكولات العلاج مثل جرعات مصل ومطعوم داء الكلب أو الكزاز بعد الجرعة الإسعافية الأولى.</li><li>المتابعات الروتينية والدورية مثل مطاعيم السفر، مطاعيم الإنفلونزا الموسمية، أو استكمال الجرعات الفائتة والمتأخرة.</li></ul>
    <p><b>الخدمات الإلكترونية:</b> يمكن حجز المواعيد عبر الموقع الإلكتروني الرسمي لوزارة الصحة الأردنية <b>moh.gov.jo</b>، ومنصة تطعيم وزارة الصحة، وللاستعلام يمكن الاتصال على الرقم <b>065008080</b>.</p>
    <h3 id="children-vaccines">👶 المطاعيم الدورية والأساسية للأطفال</h3>
    <p>هذا الجزء مخصص للأهالي لمتابعة وتتبع البرنامج الوطني للتطعيم، لضمان حماية الأطفال من الأمراض السارية والمعدية وبناء مناعتهم بشكل سليم وثابت.</p>
    <p><b>أماكن أخذ المطاعيم المجدولة:</b> تعطى هذه الجرعات حصرياً في مراكز الأمومة والطفولة والمراكز الصحية الشاملة والأولية المنتشرة في كافة محافظات المملكة.</p>
    <div class="journal-alert">تنبيه هام للأهالي: هذه المطاعيم الدورية لا تعطى نهائياً في أقسام ومباني الطوارئ. يرجى الالتزام بزيارة المراكز الصحية نهاراً لحماية طفلك من الاختلاط ببيئة أقسام الطوارئ.</div>
    <h4>جدول المطاعيم الأساسية للأطفال / البرنامج الوطني الأردني</h4>
    <ol><li><b>عند الولادة:</b> مطعوم الكبد الوبائي ب + مطعوم السل BCG.</li><li><b>عمر شهرين:</b> المطعوم الخماسي + شلل الأطفال + مطعوم المكورات الرئوية.</li><li><b>عمر 4 أشهر:</b> المطعوم الخماسي + شلل الأطفال + مطعوم المكورات الرئوية.</li><li><b>عمر 6 أشهر:</b> المطعوم الخماسي + شلل الأطفال + مطعوم المكورات الرئوية.</li><li><b>عمر 9 أشهر:</b> مطعوم الحصبة.</li><li><b>عمر 12 شهراً:</b> مطعوم الثلاثي الفيروسي MMR + مطعوم المكورات الرئوية جرعة منشطة.</li><li><b>عمر 18 شهراً:</b> المطعوم الخماسي جرعة منشطة + شلل الأطفال جرعة منشطة + MMR.</li><li><b>عمر 4-6 سنوات:</b> مطعوم الثلاثي البكتيري DTP + شلل الأطفال جرعة منشطة.</li></ol>
    <p><b>أدوات رقمية:</b> تطبيق <b>VaccineJo</b> لمتابعة سجل تطعيم الطفل والتذكير بالجرعات القادمة، والموقع الإلكتروني الرسمي لوزارة الصحة الأردنية <b>moh.gov.jo</b>.</p>` },
  { anchor:'tests', title:'الفحوصات المخبرية الشاملة ونتائجها', icon:'🔬', html:`<p>يتيح هذا القسم متابعة نتائج الفحوصات المخبرية وتقارير الأشعة، بالإضافة إلى التوجيه لإجراء تحاليل طبية دورية أو روتينية جديدة.</p><p><b>أماكن إجراء الفحوصات:</b> المراكز الصحية الأولية أو الشاملة التابعة لمنطقتك، وتتوفر النتائج إلكترونياً عبر منصة حكيمي.</p><div class="journal-alert">أقسام الطوارئ لا تقوم بإجراء الفحوصات الروتينية أو تسليم نتائجها؛ فهي مخصصة للحالات الحرجة والتحاليل الإسعافية العاجلة.</div><p><b>متابعة النتائج إلكترونياً:</b> التسجيل مرة واحدة في قسم السجل الطبي للحصول على رمز التسجيل، ثم إنشاء الحساب عبر بوابة حكيمي أو تطبيق Hakeem My.</p>` },
  { anchor:'referrals', title:'التحويلات الطبيه-ديوان/عيادات اختصاص', icon:'🏥', html:`<p>ينظم هذا القسم عملية الانتقال بين مستويات الرعاية الصحية في وزارة الصحة الأردنية، بدءاً من الرعاية الأولية في المراكز الصحية وصولاً إلى أطباء الاختصاص في المراكز الشاملة والمستشفيات الحكومية.</p><p><b>مسار التحويل المعتمد:</b> يجب مراجعة الطبيب العام في المركز الصحي الأولي التابع لمنطقتك، وبناءً على تقييمه يتم تحويلك إلى طبيب الاختصاص في المركز الشامل أو العيادات الخارجية للمستشفى الحكومي.</p><div class="journal-alert">حجز مواعيد الاختصاص أو التحويلات الروتينية لا يتم داخل الطوارئ. الطوارئ مخصصة للحالات الحرجة والعاجلة فقط.</div><p><b>القنوات الإلكترونية:</b> بوابة حكيمي، التسجيل الذاتي للمستخدمين الجدد، نظام حجز مواعيد وزارة الصحة، تطبيق حكيمي، ورسائل SMS لتنظيم الدور.</p>` },
  { anchor:'prescriptions', title:'تجديد -الوصفات الطبية/الادويه الشهرية', icon:'💊', html:`<p>يهدف هذا القسم إلى تسهيل استمرارية الخطة العلاجية لمرضى الأمراض المزمنة مثل السكري والضغط وأمراض القلب، وتوفير الوقت والجهد.</p><p><b>أماكن التجديد والصرف:</b> المراكز الصحية الشاملة، المستشفيات الحكومية المعتمدة المسجل بها ملفك الطبي، أو خدمة التوصيل المنزلي الآمنة.</p><div class="journal-alert">خدمات صرف وتجديد الأدوية المزمنة لا تقدم في أقسام الطوارئ. الطوارئ مخصصة لإنقاذ الحياة والتعامل مع الحالات الحادة والحرجة.</div><ul><li><b>التجديد الإلكتروني والتوصيل المنزلي:</b> عبر منصة حكيمي بالتعاون مع البريد الأردني مقابل تكلفة توصيل رمزية.</li><li><b>الصرف الحضوري:</b> من صيدلية المركز الصحي الشامل أو المستشفى الحكومي المعتمد.</li><li><b>صلاحية الوصفة:</b> وصفة الأدوية المزمنة صالحة 3 أشهر فقط، ويجب مراجعة الطبيب كل 3 أشهر لتحديثها.</li></ul><p><b>الدعم الفني:</b> 065008080.</p>` },
  { anchor:'sick_leave', title:'الاجازات المرضية وإعتمادها', icon:'📝', html:`<p>الإجازة المرضية وثيقة رسمية تمنح للمراجع الذي يعاني من حالة صحية تمنعه من ممارسة عمله أو واجباته المدرسية.</p><p><b>أماكن الإصدار:</b> المراكز الصحية الشاملة والأولية أو العيادات الخارجية للمستشفيات بعد فحص المريض وتقييم حالته طبياً.</p><div class="journal-alert">أقسام الطوارئ لا تصدر إجازات مرضية روتينية. يقتصر دور الطوارئ على تقرير حالة إسعافية عاجلة أو دخول للمستشفى.</div><p><b>شرط الطوارئ:</b> لا تمنح الإجازة من الطوارئ إلا في الحالات القصوى التي تتطلب راحة فورية، وتكون مدتها محدودة جداً حتى 48 ساعة كحد أقصى.</p><p><b>شرط الاعتماد:</b> يجب أن تحمل الإجازة ختم طبيب الاختصاص أو المعالج، وختم إدارة المستشفى أو المركز الصحي، وختم قسم المحاسبة.</p>` },
  { anchor:'casts', title:'استفسر عن الكسور/الجبيره القديمة', icon:'🩹', html:`<p>يختص هذا القسم بالتعامل مع المشكلات التي قد تواجه المريض أثناء ارتداء الجبيرة، سواء كانت مرتبطة بالراحة أو بوجود علامات خطورة تستدعي التدخل الفوري.</p><p><b>الإسعاف الأولي:</b> في حال حدوث كسر أو إصابة، يجب تثبيت الطرف المصاب باستخدام الوسائل المتاحة لتجنب تفاقم الإصابة.</p><p><b>إجراءات الطوارئ:</b> عند الوصول للطوارئ يتم فحص الجبيرة، وقد يتم عمل جبيرة طوارئ مفتوحة في حال وجود تورم، ثم جدولة مراجعة عيادة العظام خلال 1-10 أيام.</p><div class="journal-alert">راجع الطوارئ فوراً عند: ألم شديد لا يتحسن بالمسكنات، ازرقاق أو شحوب الأصابع، فقدان الإحساس أو خدر مستمر، أو تورم مفاجئ وغير طبيعي.</div><p><b>كرت المراجعة:</b> يعطى عند وجود سبب طبي ثابت يستدعي المتابعة أو إذا تم إجراء جبيرة طبية داخل قسم الطوارئ.</p>` },
  { anchor:'reports', title:'التقارير الطبية', icon:'📄', html:`<p>التقرير الطبي غير القضائي وثيقة رسمية توثق الحالة الصحية للمريض بناءً على الفحص السريري، ويستخدم لأغراض إدارية أو وظيفية أو مدرسية أو لتقديمه لجهات رسمية غير قضائية.</p><p><b>أماكن الإصدار:</b> المركز الصحي الشامل أو العيادات الخارجية للمستشفيات الحكومية، ويكتبه الطبيب الأخصائي المشرف على الحالة بعد مراجعة السجل الطبي.</p><div class="journal-alert">أقسام الطوارئ ليست الجهة المخولة لإصدار تقارير طبية روتينية أو إدارية؛ يقتصر دورها على الرعاية الإسعافية الطارئة.</div><p><b>شرط الاعتماد:</b> يجب أن يكون التقرير مختوماً وموقعاً من ثلاثة أطراف: ختم طبيب الاختصاص، ختم إدارة المستشفى أو المركز الصحي، وختم قسم المحاسبة.</p>` },
  { anchor:'wounds', title:'العنايه بالجروح/العمليات السابقه', icon:'🧵', html:`<p>يهدف هذا القسم إلى تنظيم وتوفير الرعاية التمريضية والطبية اللازمة للعناية بالجروح البسيطة أو غيار الجروح بعد العمليات الجراحية لضمان الالتئام وتجنب المضاعفات.</p><p><b>أماكن تقديم الخدمة:</b> عيادات الجراحة الخارجية في المستشفيات الحكومية الرئيسية مثل مستشفيات البشير في عمان، والمستشفيات الحكومية في المحافظات، بالإضافة إلى المراكز الصحية الشاملة.</p><div class="journal-alert">أقسام الطوارئ غير مخصصة لغيار الجروح الروتيني. الطوارئ مخصصة للحالات الحادة والخطيرة والمفاجئة.</div><p><b>علامات الخطر:</b> صديد أو إفرازات برائحة كريهة، حرارة مرتبطة بمكان الجرح، احمرار شديد ومنتشر، ألم متزايد لا يستجيب للمسكنات، نزيف مستمر لا يتوقف بالضغط، أو انفتاح حواف الجرح.</p><p><b>روابط واتصال:</b> موقع وزارة الصحة الأردنية moh.gov.jo، بوابة الحكومة الإلكترونية jordan.gov.jo، وخدمة وزارة الصحة على الرقم 065200230.</p>` }
];

// ===== NAVIGATION =====
function go(screenId) {
  const cur = document.querySelector('.screen.active');
  if (cur && cur.id !== screenId) S.history.push(cur.id);
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) { target.classList.add('active'); window.scrollTo(0, 0); }
  applyText();
  initScreen(screenId);
  refreshLocationButtons();
}

function back() {
  if (S.history.length > 0) {
    const prev = S.history.pop();
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const t = document.getElementById(prev);
    if (t) { t.classList.add('active'); window.scrollTo(0, 0); }
    applyText();
  } else {
    home();
  }
}

function home() {
  S.history = [];
  S.age = null; S.ageCat = null; S.chronic = [];
  S.bodySystem = null; S.symptoms = []; S.duration = null;
  S.progression = null; S.danger = []; S.urgency = null;
  S.svcType = null; S.safetyWarnings = [];
  go('s-home');
}

// Screen-specific init
function initScreen(id) {
  const map = {
    's-home':         initHome,
    's-about':        initAbout,
    's-pathway':      initPathway,
    's-safety':       initSafety,
    's-chronic':      initChronic,
    's-system':       initSystem,
    's-duration':     initDuration,
    's-progression':  initProgression,
    's-danger':       initDanger,
    's-emergency-find': initEmergencyFind,
    's-vaccine-info':  initVaccineInfo,
    's-vaccine-safety': initVaccineSafety,
    's-medical-journal': initMedicalJournal,
    's-library':      initLibrary,
    's-dyk':          initDYK,
    's-directory':    initDirectory,
    's-evening':      initEvening,
    's-admin':        initAdmin
  };
  if (map[id]) map[id]();
}

// ===== LANGUAGE =====
function setLang(lang) {
  S.lang = lang;
  document.body.className = 'lang-' + lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  S.analytics.lang = S.analytics.lang || {};
  S.analytics.lang[lang] = (S.analytics.lang[lang] || 0) + 1;
  saveAnalytics();
  applyText();
  go('s-home');
}

// Translate shorthand
function T(ar, en) { return S.lang === 'ar' ? ar : en; }

// Apply all [data-ar] elements
function applyText() {
  document.querySelectorAll('[data-ar]').forEach(el => {
    el.textContent = S.lang === 'ar' ? el.dataset.ar : el.dataset.en;
  });
  document.querySelectorAll('select option[data-ar]').forEach(opt => {
    opt.textContent = S.lang === 'ar' ? opt.dataset.ar : opt.dataset.en;
  });
}

// ===== HOME =====
function renderFacebookButtons() {
  const url = S.settings.fb_url || 'https://facebook.com/AlBasheerER';
  const active = S.settings.fb_active !== false;
  const fbHome  = document.getElementById('fb-home-btn');
  const fbAbout = document.getElementById('fb-about-btn');

  if (fbHome) {
    fbHome.innerHTML = active && url ? `<a href="${url}" target="_blank" class="home-btn home-btn-outline" style="text-decoration:none">
      <span class="home-btn-icon">📘</span>
      <span class="home-btn-text" data-ar="تابعونا على صفحتنا الرسمية لمستشفى الإسعاف والطوارئ / البشير" data-en="Follow Our Official Facebook Page"></span>
      <span class="home-btn-arrow">›</span>
    </a>` : '';
  }

  if (fbAbout) {
    fbAbout.innerHTML = active && url ? `<a href="${url}" target="_blank" class="btn btn-facebook about-facebook-btn">📘 <span data-ar="صفحة الفيسبوك الرسمية لمستشفى الإسعاف والطوارئ / البشير" data-en="Official Facebook Page"></span></a>` : '';
  }
}

function initHome() {
  renderFacebookButtons();
  applyText();
}

function initAbout() {
  renderFacebookButtons();
  applyText();
}

// ===== PATHWAY =====
function initPathway() {
  const c = document.getElementById('pathway-options');
  c.innerHTML = '';
  PATHWAY_OPTIONS.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'opt-card';
    btn.innerHTML = `<span class="oi">${opt.icon}</span><span>${T(opt.ar, opt.en)}</span><span class="chk">✓</span>`;
    btn.onclick = opt.action;
    c.appendChild(btn);
  });
}


// ===== NON-EMERGENCY SELECT =====
function initNESelect() {
  const c = document.getElementById('ne-options');
  if (!c) return;
  c.innerHTML = '';

  // Reuse the non-emergency service options from PATHWAY_OPTIONS,
  // excluding the first item (new symptoms) because this page is only for non-emergency services.
  PATHWAY_OPTIONS.slice(1).forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'opt-card';
    btn.innerHTML = `<span class="oi">${opt.icon}</span><span>${T(opt.ar, opt.en)}</span><span class="chk">✓</span>`;
    btn.onclick = opt.action;
    c.appendChild(btn);
  });
}

// ===== SAFETY =====
function initSafety() {
  const c = document.getElementById('safety-chips');
  c.innerHTML = ''; S.safetyWarnings = [];
  SAFETY_WARNINGS.forEach(w => {
    const b = makeChip(T(w.ar, w.en), () => {
      if (w.lvl === 'none') {
        S.safetyWarnings = [];
        c.querySelectorAll('.chip').forEach(x => x.classList.remove('selected'));
      } else {
        c.querySelector('.chip:last-child')?.classList.remove('selected');
      }
      b.classList.toggle('selected');
      if (b.classList.contains('selected') && w.lvl !== 'none') S.safetyWarnings.push(w);
      else S.safetyWarnings = S.safetyWarnings.filter(x => x.ar !== w.ar);
    });
    c.appendChild(b);
  });
}

function procSafety() {
  if (S.safetyWarnings.length === 0) { showNEResult(); return; }
  const hasRed    = S.safetyWarnings.some(w => w.lvl === 'red');
  const hasOrange = S.safetyWarnings.some(w => w.lvl === 'orange');
  S.urgency = hasRed ? 'red' : hasOrange ? 'orange' : 'yellow';
  S.danger = S.safetyWarnings;
  showResult();
}

// ===== AGE =====
function submitAge() {
  const v = parseInt(document.getElementById('age-input').value);
  const err = document.getElementById('age-error');
  const guard = document.getElementById('age-guardian');
  if (!v || v < 1 || v > 120) {
    err.textContent = T('يرجى إدخال عمر صحيح بين 1 و120', 'Please enter a valid age between 1 and 120');
    return;
  }
  err.textContent = ''; S.age = v;
  if (v < 12) {
    S.ageCat = 'child';
    guard.textContent = T('يُفضّل أن يقوم ولي الأمر باستخدام التطبيق للأطفال.', 'For children, a guardian should use this app.');
    guard.style.display = 'block';
  } else {
    guard.style.display = 'none';
    S.ageCat = v >= 65 ? 'elderly' : 'adult';
  }
  S.analytics.guidance_starts = (S.analytics.guidance_starts || 0) + 1;
  saveAnalytics();
  go('s-chronic');
}

// ===== CHRONIC =====
function initChronic() {
  const c = document.getElementById('chronic-chips');
  c.innerHTML = ''; S.chronic = [];
  CHRONIC_OPTIONS.forEach(opt => {
    const b = makeChip(T(opt.ar, opt.en), () => {
      if (opt.ar === 'لا يوجد') {
        S.chronic = [];
        c.querySelectorAll('.chip').forEach(x => x.classList.remove('selected'));
        b.classList.add('selected'); S.chronic.push('none'); return;
      }
      const noneIdx = S.chronic.indexOf('none');
      if (noneIdx > -1) {
        S.chronic.splice(noneIdx, 1);
        c.querySelector('.chip:last-child')?.classList.remove('selected');
      }
      const lbl = T(opt.ar, opt.en);
      if (b.classList.contains('selected')) {
        b.classList.remove('selected');
        S.chronic = S.chronic.filter(x => x !== lbl);
      } else {
        b.classList.add('selected');
        S.chronic.push(lbl);
      }
    });
    c.appendChild(b);
  });
  renderDots('chronic-dots', 2, 6);
}

// ===== BODY SYSTEM =====
function initSystem() {
  const c = document.getElementById('system-options');
  c.innerHTML = '';
  renderDots('system-dots', 3, 6);
  BODY_SYSTEMS.forEach(sys => {
    const btn = document.createElement('button');
    btn.className = 'opt-card';
    btn.innerHTML = `<span class="oi">${sys.icon}</span><span>${T(sys.ar, sys.en)}</span><span class="chk">✓</span>`;
    btn.onclick = () => { S.bodySystem = sys.id; go('s-symptoms'); initSymptoms(); };
    c.appendChild(btn);
  });
}

// ===== SYMPTOMS =====
function initSymptoms() {
  const c = document.getElementById('symptom-chips');
  c.innerHTML = ''; S.symptoms = [];
  renderDots('symptoms-dots', 4, 6);
  (SYMPTOMS[S.bodySystem] || []).forEach(sym => {
    const b = makeChip(T(sym.ar, sym.en), () => {
      if (b.classList.contains('selected')) {
        b.classList.remove('selected');
        S.symptoms = S.symptoms.filter(x => x.ar !== sym.ar);
      } else {
        b.classList.add('selected');
        S.symptoms.push(sym);
      }
    });
    c.appendChild(b);
  });
}

function submitSymptoms() {
  if (S.symptoms.length === 0) {
    alert(T('يرجى اختيار عرض واحد على الأقل', 'Please select at least one symptom'));
    return;
  }
  go('s-duration');
}

// ===== DURATION =====
function initDuration() {
  const c = document.getElementById('duration-options');
  c.innerHTML = '';
  renderDots('duration-dots', 5, 6);
  DURATION_OPTIONS.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'opt-card';
    btn.innerHTML = `<span>${T(opt.ar, opt.en)}</span><span class="chk">✓</span>`;
    btn.onclick = () => { S.duration = opt.v; go('s-progression'); };
    c.appendChild(btn);
  });
}

// ===== PROGRESSION =====
function initProgression() {
  const c = document.getElementById('progression-options');
  c.innerHTML = '';
  renderDots('prog-dots', 6, 6);
  PROGRESSION_OPTIONS.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'opt-card';
    btn.innerHTML = `<span class="oi">${opt.i}</span><span>${T(opt.ar, opt.en)}</span><span class="chk">✓</span>`;
    btn.onclick = () => { S.progression = opt.v; go('s-danger'); };
    c.appendChild(btn);
  });
}

// ===== DANGER =====
function initDanger() {
  const c = document.getElementById('danger-options');
  c.innerHTML = ''; S.danger = [];

  const redLabel = document.createElement('div');
  redLabel.className = 'section-label';
  redLabel.style.cssText = 'color:var(--red);margin-bottom:8px;margin-top:4px';
  redLabel.textContent = T('🔴 علامات طارئة فورية', '🔴 Immediate Emergency Signs');
  c.appendChild(redLabel);

  RED_DANGER.forEach(d => {
    const btn = document.createElement('button');
    btn.className = 'opt-card';
    btn.style.borderLeft = S.lang === 'en' ? '4px solid var(--red)' : '';
    btn.style.borderRight = S.lang === 'ar' ? '4px solid var(--red)' : '';
    btn.innerHTML = `<span class="oi" style="color:var(--red)">🔴</span><span>${T(d.ar, d.en)}</span><span class="chk" style="background:var(--red)">✓</span>`;
    btn.onclick = () => {
      btn.classList.toggle('selected');
      if (btn.classList.contains('selected')) S.danger.push({ ...d, lvl: 'red' });
      else S.danger = S.danger.filter(x => x.ar !== d.ar);
    };
    c.appendChild(btn);
  });

  const orangeLabel = document.createElement('div');
  orangeLabel.className = 'section-label';
  orangeLabel.style.cssText = 'color:var(--orange);margin-bottom:8px;margin-top:12px';
  orangeLabel.textContent = T('🟠 علامات عاجلة جداً', '🟠 Very Urgent Signs');
  c.appendChild(orangeLabel);

  ORANGE_DANGER.forEach(d => {
    const btn = document.createElement('button');
    btn.className = 'opt-card';
    btn.innerHTML = `<span class="oi" style="color:var(--orange)">🟠</span><span>${T(d.ar, d.en)}</span><span class="chk" style="background:var(--orange)">✓</span>`;
    btn.onclick = () => {
      btn.classList.toggle('selected');
      if (btn.classList.contains('selected')) S.danger.push({ ...d, lvl: 'orange' });
      else S.danger = S.danger.filter(x => x.ar !== d.ar);
    };
    c.appendChild(btn);
  });

  const noneBtn = document.createElement('button');
  noneBtn.className = 'opt-card';
  noneBtn.style.marginTop = '10px';
  noneBtn.innerHTML = `<span class="oi">✅</span><span>${T('لا يوجد أي مما سبق', 'None of the above')}</span><span class="chk">✓</span>`;
  noneBtn.onclick = () => {
    S.danger = [];
    c.querySelectorAll('.opt-card').forEach(x => x.classList.remove('selected'));
    noneBtn.classList.add('selected');
    submitDanger();
  };
  c.appendChild(noneBtn);
}

function submitDanger() {
  S.urgency = computeUrgency();
  showResult();
}

// ===== URGENCY LOGIC =====
function computeUrgency() {
  if (S.danger.some(d => d.lvl === 'red')   || S.symptoms.some(s => s.lvl === 'red'))   return 'red';
  if (S.danger.some(d => d.lvl === 'orange') || S.symptoms.some(s => s.lvl === 'orange')) return 'orange';

  const allRoutine  = S.symptoms.every(s => s.lvl === 'blue_white');
  if (allRoutine && !S.chronic.filter(x => x !== 'none').length) return 'blue_white';

  const hasChronic  = S.chronic.length > 0 && !S.chronic.includes('none');
  const isHighRisk  = S.ageCat === 'elderly' || S.ageCat === 'child';
  const worsening   = S.progression === 'worse';
  const sudden      = ['<1h', '1-6h'].includes(S.duration);

  let base = 'blue_white';
  if (S.symptoms.some(s => s.lvl === 'yellow')) base = 'yellow';
  if (S.symptoms.some(s => s.lvl === 'green') && base === 'blue_white') base = 'green';
  if (sudden && base === 'green') base = 'yellow';
  if (S.duration === 'weeks' && base === 'green') base = 'blue_white';
  if ((hasChronic || isHighRisk) && ['green', 'blue_white'].includes(base)) base = 'yellow';
  if (worsening) {
    if (base === 'blue_white') base = 'green';
    else if (base === 'green') base = 'yellow';
  }
  if (!S.symptoms.length) return 'yellow';
  return base;
}

// ===== SHOW RESULT =====
function showResult() {
  const cfg = URG[S.urgency];
  S.analytics.results = S.analytics.results || {};
  S.analytics.results[S.urgency] = (S.analytics.results[S.urgency] || 0) + 1;
  saveAnalytics();

  // 911 banner
  const banner = document.getElementById('result-911-bar');
  banner.style.display = cfg.show911 ? 'flex' : 'none';

  // Top bar color
  const topbar = document.getElementById('result-topbar');
  const colors = { red:'var(--red)', orange:'var(--orange)', yellow:'var(--yellow)', green:'var(--green-urg)', blue_white:'var(--teal)' };
  topbar.style.background = colors[S.urgency] || 'var(--teal)';

  const facilities = FACILITIES.filter(f => cfg.dest.includes(f.type)).slice(0, 3);

  let h = '';

  // Urgency card
  h += `<div class="urg-card ${cfg.cls}">
    <div class="urg-badge">${cfg.icon} ${T(cfg.badgeAr, cfg.badgeEn)}</div>
    <div class="urg-title">${T(cfg.titleAr, cfg.titleEn)}</div>
    <div class="urg-desc">${T(cfg.actAr, cfg.actEn)}</div>
  </div>`;

  // Contextual education button
  h += renderContextualMoreButton();

  // 911 button
  if (cfg.show911) {
    h += `<a href="tel:911" class="btn btn-red btn-lg" onclick="track('call_911')">📞 ${T('اتصل بـ 911 الآن', 'Call 911 Now')}</a>`;
  }

  // Safe wording note
  h += `<div class="disc-box"><b>🔬 ${T('ملاحظة مهمة', 'Important Note')}</b>${T('الأعراض قد ترتبط بعدة أسباب. التطبيق لا يستطيع تحديد تشخيص. التوجيه مبني على علامات الخطر والقواعد الآمنة فقط.', 'Symptoms may be associated with different causes. The app cannot determine a diagnosis. Guidance is based on safety rules and warning signs only.')}</div>`;

  // NE service message
  if (S.svcType && NE_MSGS[S.svcType]) {
    h += `<div class="info-card"><b>💡 ${T('إرشاد الخدمة', 'Service Guidance')}</b><p>${T(NE_MSGS[S.svcType].ar, NE_MSGS[S.svcType].en)}</p></div>`;
  }

  // GPS section
  h += `<div class="gps-card">
    <p>📍 ${T('لإظهار أقرب منشأة مناسبة، اسمح للتطبيق باستخدام موقعك.', 'To show the nearest facility, allow the app to use your location.')}</p>
    <button class="btn btn-primary btn-sm" id="gps-btn" onclick="requestGPS()">📍 ${T('السماح بالموقع وإظهار الأقرب', 'Allow Location & Show Nearest')}</button>
    <div class="gps-note">🔒 ${T('لن يتم حفظ موقعك — للجلسة الحالية فقط.', 'Location will not be stored — current session only.')}</div>
  </div>`;

  // Facilities
  h += `<div id="fac-result"><div class="section-label" style="margin-bottom:8px">📍 ${T('المنشآت الصحية المناسبة', 'Suitable Facilities')}</div>${facilities.map((f, i) => renderFac(f, i === 0)).join('')}</div>`;

  // Why this destination
  h += renderWhy();

  // Sick leave note
  h += `<div class="info-card"><b>📝 ${T('إرشادات الإجازة المرضية', 'Sick Leave Guidance')}</b><p>${T('التطبيق لا يقرر ولا يضمن الإجازة المرضية. القرار للطبيب المعالج حسب الفحص والتشخيص والتعليمات.', 'The app does not decide or guarantee sick leave. The decision belongs to the treating doctor based on examination, diagnosis, and regulations.')}</p></div>`;

  // Warning signs reminder
  h += `<div class="info-card card-red"><b>⚠️ ${T('تحذير مهم', 'Important Warning')}</b><p>${T('إذا ظهرت أي من علامات الخطر، لا تنتظر. اتصل بـ 911 أو اذهب للطوارئ فورًا.', 'If any warning signs appear, do not wait. Call 911 or go to emergency immediately.')}</p></div>`;

  // Disclaimer
  h += `<div class="disc-box"><b>⚠️ ${T('إخلاء مسؤولية', 'Disclaimer')}</b>${T('هذا التطبيق للتوعية والمساعدة فقط، ولا يُعتبر تشخيصًا طبيًا أو قرار فرز طبي رسميًا أو بديلًا عن الطبيب.', 'This app is for awareness and support only. It is not a medical diagnosis, not an official triage decision, and not a substitute for a doctor.')}</div>`;

  h += `<button class="btn btn-outline" onclick="home()">🏠 ${T('العودة للرئيسية', 'Back to Home')}</button>`;

  document.getElementById('result-content').innerHTML = h;
  go('s-result');
}

function showNEResult() {
  const msg = NE_MSGS[S.svcType];
  if (!msg) { go('s-result'); return; }
  S.urgency = 'blue_white';
  showResult();
}

// ===== RENDER FACILITY CARD =====
function renderFac(f, isNearest, distKm) {
  const name   = T(f.nameAr, f.nameEn);
  const area   = T(f.areaAr || '', f.areaEn || '');
  const hours  = T(f.hoursAr || '', f.hoursEn || '');
  const note   = T(f.noteAr || '', f.noteEn || '');
  const typeL  = f.type === 'emergency_hospital'
    ? T('مستشفى طوارئ', 'Emergency Hospital')
    : T('مركز صحي شامل', 'Comprehensive Health Center');
  const isEve  = f.evening && isEveningNow();

  let h = `<div class="fac-card ${isNearest ? 'nearest' : ''}" style="margin-bottom:10px">`;
  if (isNearest) h += `<div class="fac-nearest-badge">📍 ${T('الأقرب لك', 'Nearest to you')}</div>`;
  if (isEve && f.eveningAr) h += `<span class="fac-evening-badge">🌙 ${T(f.eveningAr, f.eveningEn || '')}</span>`;
  h += `<div class="fac-name">${f.icon} ${name}</div>`;
  h += `<div class="fac-type-badge">${typeL}</div>`;
  h += `<div class="fac-info">`;
  h += `<div class="fac-row"><span class="fac-ico">📍</span><span>${area}</span></div>`;
  if (distKm) h += `<div class="fac-row"><span class="fac-ico">📏</span><span>${T('المسافة المتوقعة:', 'Estimated distance:')} ${distKm} ${T('كم', 'km')}</span></div>`;
  const isOpenNow = isFacilityOpenNow(f);
  h += `<div class="fac-row"><span class="fac-ico">${isOpenNow ? '🟢' : '🔴'}</span><span class="facility-status ${isOpenNow ? 'status-open' : 'status-closed'}">${isOpenNow ? T('مفتوح الآن', 'Open now') : T('مغلق الآن', 'Closed now')}</span></div>`;
  if (hours)  h += `<div class="fac-row"><span class="fac-ico">🕐</span><span>${hours}</span></div>`;
  if (note)   h += `<div class="fac-row"><span class="fac-ico">ℹ️</span><span>${note}</span></div>`;
  h += `</div><div class="fac-btns">`;
  h += `<a href="${f.maps}" target="_blank" class="btn btn-maps btn-sm" onclick="track('maps_clicks')">🗺️ ${T('خرائط Google', 'Google Maps')}</a>`;
  if (f.phone) h += `<a href="tel:${f.phone}" class="btn btn-call btn-sm">📞 ${T('اتصل', 'Call')}</a>`;
  h += `</div></div>`;
  return h;
}

function isEveningNow() {
  const h = new Date().getHours();
  return h >= 16 && h < 22;
}


// ===== FACILITY FILTERING HELPERS =====
function isFacilityOpenNow(f) {
  if (f.type === 'emergency_hospital') return true;
  const h = new Date().getHours();
  // Government comprehensive centers usually work during official daytime hours.
  if (h >= 8 && h < 16) return true;
  // Evening centers around Al-Bashir remain available until 10 PM where marked.
  if (f.evening && h >= 16 && h < 22) return true;
  return false;
}

function getFacilitiesForMode(mode, respectHours = false) {
  let facs = mode === 'acute'
    ? FACILITIES.filter(f => f.type === 'emergency_hospital')
    : FACILITIES.filter(f => f.type === 'comprehensive_health_center');
  if (respectHours && mode !== 'acute') facs = facs.filter(isFacilityOpenNow);
  return facs;
}

function getFacilityModeFromUrgency(urgency) {
  return ['red', 'orange'].includes(urgency) ? 'acute' : 'stable';
}

// ===== WHY THIS DESTINATION =====
function renderWhy() {
  const msgs = {
    red:       { ar:'تم توجيهك إلى الطوارئ لأن الأعراض قد تحتاج تقييمًا سريعًا أو تدخلًا عاجلًا. أقسام الطوارئ مخصصة للحالات المهددة للحياة.', en:'You were directed to emergency because symptoms may need rapid assessment or urgent intervention.' },
    orange:    { ar:'تم توجيهك إلى الطوارئ لأن الأعراض عاجلة جداً. اذهب الآن. اتصل بـ 911 إذا كانت شديدة جداً.', en:'You were directed to emergency because symptoms are very urgent. Go now. Call 911 if very severe.' },
    yellow:    { ar:'تم توجيهك إلى أقرب مركز صحي شامل لأن الحالة تبدو مستقرة حاليًا لكنها تحتاج مراجعة طبية قريبة.', en:'Directed to nearest comprehensive health center because condition appears stable but needs medical review soon.' },
    green:     { ar:'الأعراض لا تبدو طارئة ولا تحتوي على علامات خطر واضحة. مركز صحي أو عيادة قد يكون الخيار الأنسب.', en:'Symptoms do not appear urgent and no clear warning signs. A health center or clinic may be more suitable.' },
    blue_white:{ ar:'الحالة تبدو غير عاجلة أو تحتاج متابعة روتينية. ابدأ بأقرب مركز صحي شامل للتقييم أو التحويل.', en:'Case appears non-urgent or requires routine follow-up. Start with nearest comprehensive health center.' }
  };
  const m = msgs[S.urgency];
  return `<div class="info-card"><b>💡 ${T('لماذا هذه الجهة مناسبة؟', 'Why This Destination?')}</b><p>${T(m.ar, m.en)}</p><p style="font-size:13px;color:var(--gray-400);margin-top:6px">ℹ️ ${T('توفر الخدمات يختلف حسب المركز والوقت. يُنصح بالتأكد قبل التوجه.', 'Service availability varies. Please confirm before visiting.')}</p></div>`;
}

// ===== GPS =====
function requestGPS() {
  if (hasSavedLocation()) { updateFacsWithGPS(); return; }
  const btn = document.getElementById('gps-btn');
  if (btn) btn.textContent = T('جاري تحديد موقعك...', 'Detecting your location...');
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => { S.userLat = pos.coords.latitude; S.userLng = pos.coords.longitude; refreshLocationButtons(); updateFacsWithGPS(); },
      ()  => showGPSFallback()
    );
  } else {
    showGPSFallback();
  }
}

function geoDistance(la1, lo1, la2, lo2) {
  const R = 6371, dL = (la2 - la1) * Math.PI / 180, dl = (lo2 - lo1) * Math.PI / 180;
  const a = Math.sin(dL / 2) ** 2 + Math.cos(la1 * Math.PI / 180) * Math.cos(la2 * Math.PI / 180) * Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function updateFacsWithGPS() {
  const mode = getFacilityModeFromUrgency(S.urgency);
  let facs = getFacilitiesForMode(mode, mode === 'stable');
  facs = facs.map(f => ({ ...f, dist: geoDistance(S.userLat, S.userLng, f.lat, f.lng) }))
             .sort((a, b) => a.dist - b.dist);
  const gpsCard = document.querySelector('.gps-card');
  if (gpsCard) gpsCard.innerHTML = `<p style="color:var(--teal-dark);font-weight:700">✅ ${T('تم تحديد موقعك بنجاح', 'Location detected successfully')}</p>`;
  const fc = document.getElementById('fac-result');
  if (fc) {
    let h = `<div class="section-label" style="margin-bottom:8px">📍 ${T(mode === 'acute' ? 'أقرب أقسام الطوارئ إليك' : 'أقرب المراكز الصحية العاملة الآن إليك', mode === 'acute' ? 'Nearest Emergency Departments to You' : 'Nearest Open Health Centers to You')}</div>`;
    if (!facs.length) {
      h += `<div class="info-card card-yellow"><b>${T('لا توجد مراكز صحية عاملة الآن ضمن القائمة الحالية', 'No open health centers are available in the current list now')}</b><p>${T('إذا كانت الحالة غير مستقرة أو تتدهور، توجه للطوارئ أو اتصل بـ 911.', 'If the condition is unstable or worsening, go to emergency or call 911.')}</p></div>`;
    } else {
      facs.forEach((f, i) => h += renderFac(f, i === 0, f.dist.toFixed(1)));
    }
    fc.innerHTML = h;
  }
}

function showGPSFallback() {
  const gpsCard = document.querySelector('.gps-card');
  if (!gpsCard) return;
  let h = `<p style="color:var(--orange);font-weight:700;margin-bottom:10px">⚠️ ${T('لم يتم السماح بالموقع. اختر منطقتك:', 'Location not allowed. Select your area:')}</p>`;
  h += `<div class="area-grid">`;
  MANUAL_AREAS.forEach(a => {
    h += `<button class="btn btn-outline btn-sm" onclick="selectArea('${a.id}')">${T(a.ar, a.en)}</button>`;
  });
  h += `</div><button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="requestGPS()">🔄 ${T('إعادة المحاولة', 'Try Again')}</button>`;
  gpsCard.innerHTML = h;
}

function selectArea(areaId) {
  const area = MANUAL_AREAS.find(a => a.id === areaId);
  const cfg  = URG[S.urgency];
  let facs;
  if (['red', 'orange'].includes(S.urgency)) {
    facs = getFacilitiesForMode('acute');
  } else {
    const openCenters = getFacilitiesForMode('stable', true);
    const prim = openCenters.find(f => f.id === area?.fid);
    facs = prim
      ? [prim, ...openCenters.filter(f => f.id !== area?.fid)]
      : openCenters;
  }
  const fc = document.getElementById('fac-result');
  if (fc) {
    let h = `<div class="section-label" style="margin-bottom:8px">📍 ${T('المنشآت المقترحة', 'Suggested Facilities')}</div>`;
    facs.forEach((f, i) => h += renderFac(f, i === 0));
    fc.innerHTML = h;
  }
  document.querySelector('.gps-card').style.display = 'none';
}

// ===== NON-EMERGENCY =====
function startNE(type) {
  S.svcType = type;
  S.safetyWarnings = [];
  if (type === 'vaccination') go('s-vaccine-info');
  else go('s-safety');
}

function initVaccineInfo() {
  showVaccineQuick('emergency');
}

function showVaccineQuick(kind) {
  const box = document.getElementById('vaccine-quick-info');
  if (!box) return;
  const data = {
    emergency: {
      title: T('🚨 المطاعيم الطارئة', '🚨 Emergency vaccines'),
      text: T('تشمل مطعوم ومصل الكزاز بعد الجروح العميقة أو الملوثة، مطعوم ومصل داء الكلب بعد العقر أو الخدش، وأمصال لدغات الأفاعي والعقارب. هذه الحالات تحتاج توجهاً سريعاً للطوارئ.', 'Includes tetanus vaccine/serum after deep or contaminated wounds, rabies vaccine/serum after bites or scratches, and antivenoms for snake/scorpion stings. These require urgent emergency care.'),
      anchor: 'emergency-vaccines'
    },
    doses: {
      title: T('📅 استكمال الجرعات', '📅 Dose completion'),
      text: T('يشمل استكمال بروتوكولات العلاج والمتابعات الروتينية مثل جرعات الكزاز أو السعار التالية، مطاعيم السفر، الإنفلونزا الموسمية، أو الجرعات الفائتة والمتأخرة.', 'Includes completing treatment protocols and routine follow-ups such as later tetanus/rabies doses, travel vaccines, seasonal influenza, or missed/delayed doses.'),
      anchor: 'dose-completion'
    },
    children: {
      title: T('👶 مطاعيم الأطفال', '👶 Children vaccines'),
      text: T('تشمل المطاعيم الأساسية ضمن البرنامج الوطني الأردني منذ الولادة وحتى عمر المدرسة، وتؤخذ في مراكز الأمومة والطفولة والمراكز الصحية.', 'Includes basic vaccines in the Jordanian national program from birth to school age, provided at maternal/child health and health centers.'),
      anchor: 'children-vaccines'
    }
  }[kind];
  window.selectedVaccineAnchor = data.anchor;
  box.innerHTML = `<b>${data.title}</b><p>${data.text}</p><button class="btn btn-outline btn-sm" onclick="goJournal('${data.anchor}')">${T('عرض التفاصيل في المجلة الطبية', 'View details in Medical Journal')}</button>`;
}

function beginVaccineSafety() {
  S.svcType = 'vaccination';
  S.safetyWarnings = [];
  go('s-vaccine-safety');
}

function initVaccineSafety() {
  const c = document.getElementById('vaccine-safety-chips');
  if (!c) return;
  c.innerHTML = '';
  S.safetyWarnings = [];
  VACCINE_SAFETY_OPTIONS.forEach(opt => {
    const b = makeChip(T(opt.ar, opt.en), () => {
      if (opt.id === 'routine') {
        S.safetyWarnings = [];
        c.querySelectorAll('.chip').forEach(x => x.classList.remove('selected'));
        b.classList.add('selected');
        S.safetyWarnings.push(opt);
        return;
      }
      const routine = c.querySelector('.chip:last-child');
      if (routine) routine.classList.remove('selected');
      S.safetyWarnings = S.safetyWarnings.filter(x => x.id !== 'routine');
      b.classList.toggle('selected');
      if (b.classList.contains('selected')) S.safetyWarnings.push(opt);
      else S.safetyWarnings = S.safetyWarnings.filter(x => x.id !== opt.id);
    });
    c.appendChild(b);
  });
}

function submitVaccineSafety() {
  if (!S.safetyWarnings.length) {
    alert(T('يرجى اختيار إجابة واحدة على الأقل', 'Please select at least one answer'));
    return;
  }
  if (S.safetyWarnings.some(x => x.lvl === 'red')) S.urgency = 'red';
  else if (S.safetyWarnings.some(x => x.lvl === 'orange')) S.urgency = 'orange';
  else if (S.safetyWarnings.some(x => x.lvl === 'yellow')) S.urgency = 'yellow';
  else S.urgency = 'blue_white';
  showResult();
}

function renderContextualMoreButton() {
  const info = SERVICE_INFO[S.svcType];
  if (!info) return '';
  const label = T(info.ar, info.en);
  const btnText = T(`اعرف أكثر عن ${label}`, `Learn more about ${label}`);
  const anchor = S.svcType === 'vaccination' && window.selectedVaccineAnchor ? window.selectedVaccineAnchor : info.anchor;
  return `<button class="btn btn-context-more" onclick="goJournal('${anchor}')">📚 ${btnText}</button>`;
}

function goJournal(anchor) {
  window.pendingJournalAnchor = anchor || 'top';
  go('s-medical-journal');
}

function initMedicalJournal() {
  const c = document.getElementById('medical-journal-content');
  if (!c) return;
  let h = `<div id="journal-top" class="journal-hero"><h2>${T('المجلة الطبية الشاملة', 'Comprehensive Medical Journal')}</h2><p>${T('مكتبة توعوية مبنية على الأقسام المعتمدة في التطبيق لتسهيل الوصول للمعلومات والخدمات والروابط المهمة.', 'An awareness library based on app sections for easy access to information, services, and important resources.')}</p></div>`;
  h += `<div class="journal-nav">${JOURNAL_SECTIONS.map(s => `<button class="journal-nav-btn" onclick="scrollJournalToAnchor('${s.anchor}')">${s.icon} ${s.title}</button>`).join('')}</div>`;
  JOURNAL_SECTIONS.forEach(s => {
    h += `<section class="journal-section" id="${s.anchor}"><h2>${s.icon} ${s.title}</h2>`;
    if (s.quick) {
      h += `<div class="quick-topic-row journal-vaccine-nav"><button class="quick-topic-btn" onclick="scrollJournalToAnchor('emergency-vaccines')">🚨 ${T('المطاعيم الطارئة', 'Emergency vaccines')}</button><button class="quick-topic-btn" onclick="scrollJournalToAnchor('dose-completion')">📅 ${T('استكمال الجرعات', 'Dose completion')}</button><button class="quick-topic-btn" onclick="scrollJournalToAnchor('children-vaccines')">👶 ${T('مطاعيم الأطفال', 'Children vaccines')}</button></div>`;
    }
    h += `<div class="journal-body">${s.html}</div></section>`;
  });
  c.innerHTML = h;
  const target = window.pendingJournalAnchor;
  window.pendingJournalAnchor = null;
  setTimeout(() => scrollJournalToAnchor(target && target !== 'top' ? target : 'journal-top'), 60);
}

function scrollJournalToAnchor(anchor) {
  const el = document.getElementById(anchor);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


// ===== NEAREST MEDICAL FACILITY =====
let closestMode = null;

function initEmergencyFind() {
  closestMode = null;
  const action = document.getElementById('closest-action');
  const c = document.getElementById('emergency-list');
  if (action) action.innerHTML = '';
  if (c) c.innerHTML = '';
}

function chooseClosestMode(mode) {
  closestMode = mode;
  const action = document.getElementById('closest-action');
  if (!action) return;

  if (mode === 'acute') {
    action.innerHTML = `
      <div class="closest-result-card closest-acute">
        <a href="tel:911" class="btn btn-red btn-lg" onclick="track('call_911')">🚨 ${T('تواصل مع الطوارئ', 'Contact Emergency')}</a>
        ${hasSavedLocation() ? '' : `<button class="btn btn-primary closest-gps-btn" onclick="requestClosestGPS('acute')">🗺️ 📍 ${T('الرجاء تفعيل موقعك', 'Please enable your location')}</button>`}
        <p>${T('سيتم عرض أقرب أقسام الطوارئ الحكومية من الأقرب للأبعد حسب موقعك.', 'Nearest government emergency departments will be shown from nearest to farthest based on your location.')}</p>
      </div>`;
    renderClosestFacilities('acute', hasSavedLocation());
  } else {
    action.innerHTML = `
      <div class="closest-result-card closest-stable">
        <button class="btn btn-green btn-lg" onclick="requestClosestGPS('stable')">✅ ${T('لا تهمل نفسك، تواصل مع اقربهم اليك', 'Do not neglect yourself, contact the nearest facility')}</button>
        ${hasSavedLocation() ? '' : `<button class="btn btn-primary closest-gps-btn" onclick="requestClosestGPS('stable')">🗺️ 📍 ${T('الرجاء تفعيل موقعك', 'Please enable your location')}</button>`}
        <p>${T('سيتم عرض المراكز الصحية الحكومية العاملة الآن من الأقرب للأبعد حسب موقعك.', 'Open government health centers will be shown from nearest to farthest based on your location.')}</p>
      </div>`;
    renderClosestFacilities('stable', hasSavedLocation());
  }
  applyText();
}

function requestClosestGPS(mode) {
  closestMode = mode;
  if (hasSavedLocation()) { renderClosestFacilities(mode, true); return; }
  const btns = document.querySelectorAll('.closest-gps-btn');
  btns.forEach(btn => btn.textContent = T('جاري تحديد موقعك...', 'Detecting your location...'));
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        S.userLat = pos.coords.latitude;
        S.userLng = pos.coords.longitude;
        refreshLocationButtons();
        renderClosestFacilities(mode, true);
      },
      () => renderClosestManualFallback(mode)
    );
  } else {
    renderClosestManualFallback(mode);
  }
}

function renderClosestFacilities(mode, useDistance) {
  const c = document.getElementById('emergency-list');
  if (!c) return;
  let facs = getFacilitiesForMode(mode, mode === 'stable');
  if (useDistance && S.userLat && S.userLng) {
    facs = facs.map(f => ({ ...f, dist: geoDistance(S.userLat, S.userLng, f.lat, f.lng) }))
               .sort((a, b) => a.dist - b.dist);
  }
  const title = mode === 'acute'
    ? T('أقرب أقسام الطوارئ الحكومية', 'Nearest Government Emergency Departments')
    : T('المراكز الصحية الحكومية العاملة الآن', 'Open Government Health Centers Now');
  let h = `<div class="section-label" style="margin-bottom:8px">📍 ${title}</div>`;
  if (!facs.length) {
    h += `<div class="info-card card-yellow"><b>${T('لا توجد مراكز صحية عاملة الآن ضمن القائمة الحالية', 'No open health centers are available in the current list now')}</b><p>${T('إذا كانت الحالة غير مستقرة أو تتدهور، توجه للطوارئ أو اتصل بـ 911.', 'If the condition is unstable or worsening, go to emergency or call 911.')}</p></div>`;
  } else {
    facs.forEach((f, i) => h += renderFac(f, i === 0, f.dist ? f.dist.toFixed(1) : null));
  }
  c.innerHTML = h;
}

function renderClosestManualFallback(mode) {
  const c = document.getElementById('emergency-list');
  if (!c) return;
  let facs = getFacilitiesForMode(mode, mode === 'stable');
  const title = mode === 'acute'
    ? T('أقسام الطوارئ الحكومية', 'Government Emergency Departments')
    : T('المراكز الصحية الحكومية العاملة الآن', 'Open Government Health Centers Now');
  let h = `<div class="info-card card-yellow"><b>⚠️ ${T('لم يتم السماح بالموقع', 'Location was not allowed')}</b><p>${T('يمكنك تفعيل الموقع من إعدادات المتصفح، أو استخدام روابط خرائط Google الظاهرة في القائمة أدناه.', 'You can enable location from browser settings, or use the Google Maps links in the list below.')}</p></div>`;
  h += `<div class="section-label" style="margin-bottom:8px">📍 ${title}</div>`;
  if (!facs.length) {
    h += `<div class="info-card card-yellow"><b>${T('لا توجد مراكز صحية عاملة الآن ضمن القائمة الحالية', 'No open health centers are available in the current list now')}</b><p>${T('إذا كانت الحالة غير مستقرة أو تتدهور، توجه للطوارئ أو اتصل بـ 911.', 'If the condition is unstable or worsening, go to emergency or call 911.')}</p></div>`;
  } else {
    facs.forEach((f, i) => h += renderFac(f, i === 0));
  }
  c.innerHTML = h;
}

// ===== LIBRARY =====
let libCat = 'all';
function initLibrary() {
  const tabs = document.getElementById('lib-tabs');
  tabs.innerHTML = ART_CATS.map(c =>
    `<button class="tab-btn ${c.id === libCat ? 'active' : ''}" onclick="setLibCat('${c.id}')">${T(c.ar, c.en)}</button>`
  ).join('');

  const c = document.getElementById('lib-content');
  let h = '';
  // Quick nav
  h += `<button class="opt-card" onclick="go('s-directory')" style="margin-bottom:8px"><span class="oi">🗂️</span><span>${T('دليل المنشآت الصحية', 'Healthcare Facility Directory')}</span><span class="chk">✓</span></button>`;
  h += `<button class="opt-card" onclick="go('s-dyk')" style="margin-bottom:8px"><span class="oi">💡</span><span>${T('هل تعلم؟', 'Did You Know?')}</span><span class="chk">✓</span></button>`;
  h += `<button class="opt-card" onclick="go('s-evening')" style="margin-bottom:14px"><span class="oi">🌙</span><span>${T('الدوام المسائي حول مستشفى البشير', 'Evening Hours Around Al-Bashir Hospital')}</span><span class="chk">✓</span></button>`;

  const arts = libCat === 'all' ? ARTICLES : ARTICLES.filter(a => a.cat === libCat);
  arts.forEach(a => {
    const cat = ART_CATS.find(x => x.id === a.cat);
    h += `<div class="art-card" onclick="showArticle(${a.id})">
      <div class="art-icon">${a.icon}</div>
      <div>
        <div class="art-cat">${cat ? T(cat.ar, cat.en) : ''}</div>
        <div class="art-title">${T(a.titleAr, a.titleEn)}</div>
        <div class="art-sum">${T(a.sumAr, a.sumEn)}</div>
      </div>
    </div>`;
  });
  c.innerHTML = h;
}

function setLibCat(cat) { libCat = cat; initLibrary(); }

function showArticle(id) {
  const a = ARTICLES.find(x => x.id === id);
  if (!a) return;
  const cat = ART_CATS.find(x => x.id === a.cat);
  document.getElementById('article-detail').innerHTML = `
    <div style="font-size:44px;text-align:center;margin-bottom:12px">${a.icon}</div>
    <h2 style="font-size:20px;font-weight:900;color:var(--teal-dark);margin-bottom:8px">${T(a.titleAr, a.titleEn)}</h2>
    <div class="art-cat" style="margin-bottom:12px">${cat ? T(cat.ar, cat.en) : ''}</div>
    <div class="art-body">${T(a.bodyAr, a.bodyEn)}</div>
    <div class="info-card card-red" style="margin-top:14px"><b>⚠️ ${T('تحذير طارئ', 'Emergency Warning')}</b><p>${T(a.warnAr, a.warnEn)}</p></div>
    <div class="info-card" style="margin-top:10px"><b>📍 ${T('أين تتوجه؟', 'Where to Go?')}</b><p>${T(a.destAr, a.destEn)}</p></div>
    <div class="disc-box" style="margin-top:12px"><b>${T('⚠️ إخلاء مسؤولية', '⚠️ Disclaimer')}</b>${T('هذه المعلومات للتوعية فقط وليست بديلًا عن الطبيب.', 'This information is for awareness only and is not a substitute for a doctor.')}</div>
    <p style="text-align:center;font-size:12px;color:var(--gray-400);margin-top:8px">${T('آخر مراجعة:', 'Last review:')} 2025</p>
    <a href="tel:911" class="btn btn-red" style="margin-top:12px">📞 ${T('اتصل بـ 911 في الطوارئ', 'Call 911 in Emergencies')}</a>
    <button class="btn btn-outline" style="margin-top:8px" onclick="back()">← ${T('رجوع', 'Back')}</button>
  `;
  go('s-article');
}

// ===== DID YOU KNOW =====
function initDYK() {
  const stats = [
    { stat:'~2M',    ar:'مستشفيات البشير تستقبل سنويًا حوالي 1.5 إلى 2 مليون مراجع.', en:'Al-Bashir hospitals receive approximately 1.5–2 million visitors annually.' },
    { stat:'~650K',  ar:'قسم الإسعاف والطوارئ يستقبل سنويًا حوالي 600–650 ألف مراجع.', en:'The emergency department receives approximately 600–650 thousand visitors annually.' },
    { stat:'~3000',  ar:'طوارئ البشير تستقبل نحو 3000 مراجع يوميًا.', en:'Al-Bashir emergency receives approximately 3,000 visitors daily.' },
    { stat:'~65%',   ar:'حوالي 65% من الحالات تُصنف ضمن الحالات البسيطة التي يمكن التعامل معها في المراكز الصحية.', en:'Approximately 65% of cases are classified as simple cases handleable at health centers.' },
    { stat:'70–75%', ar:'حوالي 70–75% من الحالات قد تكون من المستوى الرابع والخامس (غير عاجلة).', en:'Approximately 70–75% of cases may be at triage level 4 or 5 (non-urgent).' },
    { stat:'60%',    ar:'نسبة المراجعين في الفترة المسائية: 60%، الليلية: 25%، الصباحية: 15%.', en:'Visitor distribution: evening 60%, night 25%, morning 15%.' },
    { stat:'~250',   ar:'حوالي 250 حالة إدخال يوميًا تأتي من الطوارئ.', en:'Approximately 250 admission cases daily come from emergency.' },
    { stat:'HCAC',   ar:'مستشفى الإسعاف والطوارئ حاصل على اعتماد HCAC.', en:'The Ambulance & Emergency Hospital holds HCAC accreditation.' },
    { stat:'CTAS',   ar:'يتم استخدام نظام CTAS الكندي للفرز الطبي في طوارئ البشير.', en:'The Canadian CTAS triage system is used at Al-Bashir emergency.' },
    { stat:'60%',    ar:'حوالي 60% من مراجعي العيادات يأتون لصرف أدوية الأمراض المزمنة.', en:'Approximately 60% of clinic visitors come to refill chronic medications.' }
  ];

  let h = `<h2 class="screen-title" style="margin-bottom:14px">${T('هل تعلم؟', 'Did You Know?')}</h2>`;
  stats.forEach(s => {
    h += `<div class="dyk-card" style="margin-bottom:10px"><div class="dyk-stat">${s.stat}</div><div class="dyk-text">${T(s.ar, s.en)}</div></div>`;
  });

  // CTAS Table
  h += `<div class="info-card" style="margin-top:14px;margin-bottom:8px"><b>📊 ${T('جدول مستويات الفرز الطبي CTAS', 'CTAS Medical Triage Levels')}</b></div>`;
  h += `<div style="overflow-x:auto;margin-bottom:14px"><table class="ctas-table">
    <thead><tr>
      <th>${T('المستوى','Level')}</th>
      <th>${T('اللون','Color')}</th>
      <th>${T('النسبة','%')}</th>
      <th>${T('أمثلة','Examples')}</th>
    </tr></thead>
    <tbody>
    <tr class="ctas-l1">
      <td>1 - ${T('إنعاش','Resuscitation')}</td>
      <td>🔴 ${T('أحمر','Red')}</td>
      <td>2–3%</td>
      <td>${T('توقف القلب، غيبوبة، نزيف مهدد للحياة','Cardiac arrest, coma, life-threatening bleeding')}</td>
    </tr>
    <tr class="ctas-l2">
      <td>2 - ${T('طارئ جدًا','Emergent')}</td>
      <td>🟠 ${T('برتقالي','Orange')}</td>
      <td>5–7%</td>
      <td>${T('ألم صدر شديد، اشتباه جلطة، ضيق تنفس شديد','Severe chest pain, suspected stroke, severe SOB')}</td>
    </tr>
    <tr class="ctas-l3">
      <td>3 - ${T('عاجل','Urgent')}</td>
      <td>🟡 ${T('أصفر','Yellow')}</td>
      <td>15–20%</td>
      <td>${T('ألم بطن شديد، سكري أو ضغط بدون غيبوبة','Severe abdominal pain, diabetes/BP without coma')}</td>
    </tr>
    <tr class="ctas-l4">
      <td>4–5 - ${T('أقل استعجالًا','Less Urgent')}</td>
      <td>🟢🔵 ${T('أخضر/أزرق','Green/Blue')}</td>
      <td>70–75%</td>
      <td>${T('رشح، إنفلونزا، تجديد وصفات، آلام مزمنة','Cold, flu, prescription refills, chronic pain')}</td>
    </tr>
    </tbody>
  </table></div>`;
  h += `<div class="disc-box">${T('كلما زادت الخطورة، زادت أولوية المعاينة. الحالات البسيطة قد تنتظر مدة أطول حتى يتمكن الفريق الطبي من التركيز على الحالات الحرجة.', 'Higher severity = higher examination priority. Simple cases may wait longer so the team can focus on critical ones.')}</div>`;

  document.getElementById('dyk-content').innerHTML = h;
}

// ===== DIRECTORY =====
let dirCat = 'all';
function initDirectory() {
  const tabs = document.getElementById('dir-tabs');
  const cats = [
    { id:'all',                    ar:'الكل',          en:'All' },
    { id:'emergency_hospital',     ar:'الطوارئ',       en:'Emergency' },
    { id:'comprehensive_health_center', ar:'المراكز الشاملة', en:'Health Centers' },
    { id:'evening',                ar:'الدوام المسائي',en:'Evening Centers' }
  ];
  tabs.innerHTML = cats.map(c =>
    `<button class="tab-btn ${c.id === dirCat ? 'active' : ''}" onclick="setDirCat('${c.id}')">${T(c.ar, c.en)}</button>`
  ).join('');
  let facs;
  if (dirCat === 'evening')           facs = FACILITIES.filter(f => f.evening);
  else if (dirCat === 'all')          facs = FACILITIES;
  else                                facs = FACILITIES.filter(f => f.type === dirCat);
  document.getElementById('dir-content').innerHTML = facs.map(f => renderFac(f, false)).join('');
}
function setDirCat(cat) { dirCat = cat; initDirectory(); }

// ===== EVENING CENTERS =====
function initEvening() {
  const eveFacs = FACILITIES.filter(f => f.evening);
  let h = `<div class="info-card card-green"><b>🌙 ${T('دوام مسائي لتخفيف الضغط عن طوارئ البشير', 'Evening Service to Reduce Al-Bashir ED Pressure')}</b><p>${T('اعتبارًا من 1 أبريل 2026، تم تفعيل الدوام المسائي لخمسة مراكز صحية شاملة حول مستشفى البشير حتى الساعة 10:00 مساءً.', 'Starting April 1, 2026, evening hours are activated for five comprehensive health centers around Al-Bashir Hospital until 10:00 PM.')}</p></div>`;

  const services = [
    { ar:'اختصاص طب الأسرة', en:'Family medicine specialty' },
    { ar:'الطوارئ البسيطة',  en:'Simple emergency cases' },
    { ar:'الأشعة',           en:'Radiology' },
    { ar:'المختبر',          en:'Laboratory' },
    { ar:'صرف الأدوية الشهرية واليومية حتى الساعة 10 مساءً', en:'Monthly & daily medication dispensing until 10:00 PM' }
  ];
  h += `<div class="info-card"><b>🏥 ${T('الخدمات المتاحة مسائياً', 'Available Evening Services')}</b><ul>${services.map(s => `<li>${T(s.ar, s.en)}</li>`).join('')}</ul></div>`;
  h += `<div class="info-card card-red"><b>⚠️ ${T('تنبيه مهم', 'Important Notice')}</b><p>${T('هذه المراكز ليست بديلًا عن الطوارئ للحالات الحرجة. عند وجود علامات خطر اتصل بـ 911 أو اذهب للطوارئ فورًا.', 'These centers are NOT a replacement for emergency for critical cases. If warning signs exist, call 911 or go to emergency immediately.')}</p></div>`;
  h += `<div class="section-label" style="margin-bottom:8px">${T('المراكز الصحية ذات الدوام المسائي', 'Evening-Hours Health Centers')}</div>`;

  eveFacs.forEach(f => {
    h += `<div class="fac-card nearest" style="margin-bottom:10px">
      <span class="fac-evening-badge">🌙 ${T(f.eveningAr || 'دوام مسائي حتى 10م', f.eveningEn || 'Evening until 10PM')}</span>
      <div class="fac-name">${f.icon} ${T(f.nameAr, f.nameEn)}</div>
      <div class="fac-type-badge">${T('مركز صحي شامل', 'Comprehensive Health Center')}</div>
      <div class="fac-info">
        <div class="fac-row"><span class="fac-ico">📍</span><span>${T(f.areaAr || '', f.areaEn || '')}</span></div>
        ${f.distFromBashir ? `<div class="fac-row"><span class="fac-ico">📏</span><span>${f.distFromBashir} ${T('كم من مستشفى البشير', 'km from Al-Bashir Hospital')}</span></div>` : ''}
        ${f.beneficiaries  ? `<div class="fac-row"><span class="fac-ico">👥</span><span>${T('المستفيدون:', 'Beneficiaries:')} ${f.beneficiaries.toLocaleString()}</span></div>` : ''}
      </div>
      <div class="fac-btns">
        <a href="${f.maps}" target="_blank" class="btn btn-maps btn-sm" onclick="track('maps_clicks')">🗺️ ${T('خرائط Google', 'Google Maps')}</a>
        ${f.phone ? `<a href="tel:${f.phone}" class="btn btn-call btn-sm">📞 ${T('اتصل', 'Call')}</a>` : ''}
      </div>
    </div>`;
  });

  document.getElementById('evening-content').innerHTML = h;
}

// ===== CONTACT =====
function submitContact() {
  const type = document.getElementById('ct-type').value;
  const msg  = document.getElementById('ct-msg').value.trim();
  if (!type || !msg) {
    alert(T('يرجى اختيار النوع وكتابة رسالتك', 'Please select type and write your message'));
    return;
  }
  // NOTE: Replace with Supabase insert later
  const report = { id: Date.now(), type, msg, name: document.getElementById('ct-name').value, date: new Date().toISOString(), status: 'جديد' };
  S.reports.push(report);
  localStorage.setItem('shg_reports', JSON.stringify(S.reports));
  // Add notification
  S.notifs.push({ id: Date.now() + 1, type: 'new_report', titleAr: 'بلاغ جديد', read: false, date: new Date().toISOString() });
  localStorage.setItem('shg_notifs', JSON.stringify(S.notifs));
  document.getElementById('ct-success').style.display = 'block';
  document.getElementById('ct-type').value = '';
  document.getElementById('ct-msg').value  = '';
  document.getElementById('ct-name').value = '';
}

// ===== ADMIN =====
function adminLogin() {
  const user = document.getElementById('adm-user').value.trim();
  const pass = document.getElementById('adm-pass').value;
  const err  = document.getElementById('adm-err');
  // NOTE: Replace with Supabase auth later
  const adm = ADMINS[user];
  if (!adm || adm.pass !== pass) {
    err.textContent = T('اسم المستخدم أو كلمة المرور غير صحيحة', 'Incorrect username or password');
    return;
  }
  S.adminUser = user; S.adminRole = adm.role;
  err.textContent = '';
  go('s-admin');
}

function adminLogout() { S.adminUser = null; S.adminRole = null; home(); }

let admTab = 'analytics';
function initAdmin() {
  if (!S.adminUser) { go('s-admin-login'); return; }
  const adm = ADMINS[S.adminUser];
  const unread = S.notifs.filter(n => !n.read).length;
  document.getElementById('adm-notif').innerHTML = unread > 0 ? `<span class="notif-dot">${unread}</span>` : '';
  document.getElementById('adm-role').innerHTML = `<div class="admin-role-badge"><span>🔐 ${T(adm.nameAr, adm.nameEn)} — ${S.adminUser}</span></div>`;

  const tabs = [
    { id:'analytics', ar:'📊 الإحصائيات', en:'📊 Analytics' },
    { id:'reports',   ar:'📩 البلاغات',   en:'📩 Reports' },
    { id:'facilities',ar:'🏥 المنشآت',    en:'🏥 Facilities' },
    { id:'settings',  ar:'⚙️ الإعدادات', en:'⚙️ Settings' }
  ];
  document.getElementById('adm-tabs').innerHTML = tabs.map(t =>
    `<button class="tab-btn ${t.id === admTab ? 'active' : ''}" onclick="setAdmTab('${t.id}')">${T(t.ar, t.en)}</button>`
  ).join('');
  renderAdminTab();
}

function setAdmTab(t) { admTab = t; initAdmin(); }

function renderAdminTab() {
  const c = document.getElementById('adm-content');
  const a = S.analytics;

  if (admTab === 'analytics') {
    const stats = [
      { l: T('فتح التطبيق', 'App Opens'),        v: a.opens || 0 },
      { l: T('بدء الإرشاد', 'Guidance Starts'),  v: a.guidance_starts || 0 },
      { l: T('نتائج حمراء', 'Red Results'),       v: (a.results || {}).red    || 0 },
      { l: T('نتائج برتقالية', 'Orange Results'), v: (a.results || {}).orange  || 0 },
      { l: T('نتائج صفراء', 'Yellow Results'),    v: (a.results || {}).yellow  || 0 },
      { l: T('نتائج خضراء', 'Green Results'),     v: (a.results || {}).green   || 0 },
      { l: T('نتائج زرقاء', 'Blue Results'),      v: (a.results || {}).blue_white || 0 },
      { l: T('اتصالات 911', '911 Calls'),         v: a.call_911 || 0 },
      { l: T('فتح الخرائط', 'Maps Opens'),        v: a.maps_clicks || 0 },
      { l: T('استخدام عربي', 'Arabic Usage'),     v: (a.lang || {}).ar || 0 },
      { l: T('استخدام إنجليزي', 'English Usage'),v: (a.lang || {}).en || 0 },
      { l: T('إجمالي البلاغات', 'Total Reports'), v: S.reports.length }
    ];
    c.innerHTML = `<div class="admin-stat-grid">${stats.map(s => `<div class="admin-stat-cell"><div class="admin-stat-val">${s.v}</div><div class="admin-stat-lbl">${s.l}</div></div>`).join('')}</div>
    <button class="btn btn-outline btn-sm" onclick="if(confirm('${T('إعادة تعيين الإحصائيات؟','Reset analytics?')}'))resetAnalytics()">${T('إعادة تعيين', 'Reset Analytics')}</button>
    <p style="font-size:12px;color:var(--gray-400);margin-top:10px;text-align:center">${T('سيتم ربط الإحصائيات بقاعدة بيانات Supabase لاحقاً.', 'Analytics will be connected to Supabase database later.')}</p>`;

  } else if (admTab === 'reports') {
    S.notifs.forEach(n => n.read = true);
    localStorage.setItem('shg_notifs', JSON.stringify(S.notifs));
    let h = S.reports.length === 0
      ? `<p style="color:var(--gray-400);text-align:center;padding:20px">${T('لا توجد بلاغات بعد', 'No reports yet')}</p>`
      : S.reports.slice().reverse().map(r => `<div class="info-card" style="margin-bottom:8px"><b>${r.type}</b><p>${r.msg}</p>${r.name ? `<p style="font-size:13px;color:var(--gray-600)">${r.name}</p>` : ''}<p style="font-size:11px;color:var(--gray-400)">${new Date(r.date).toLocaleDateString()}</p></div>`).join('');
    c.innerHTML = h + `<p style="font-size:12px;color:var(--gray-400);text-align:center;margin-top:10px">${T('ربط البلاغات بـ Supabase لاحقاً', 'Reports Supabase connection coming later')}</p>`;

  } else if (admTab === 'facilities') {
    c.innerHTML = FACILITIES.map(f =>
      `<div class="info-card" style="margin-bottom:8px"><b>${T(f.nameAr, f.nameEn)}</b><p style="color:var(--gray-600);font-size:13px">${T(f.areaAr || '', f.areaEn || '')} · ${f.type}</p>${f.phone ? `<p style="font-size:13px">📞 ${f.phone}</p>` : `<p style="font-size:12px;color:var(--gray-400)">${T('رقم غير متوفر حالياً', 'Phone not available yet')}</p>`}</div>`
    ).join('') + `<p style="font-size:12px;color:var(--gray-400);text-align:center;margin-top:10px">${T('التحرير الكامل للمنشآت يحتاج Supabase لاحقاً.', 'Full facility editing needs Supabase later.')}</p>`;

  } else if (admTab === 'settings') {
    c.innerHTML = `
    <div class="info-card" style="margin-bottom:10px">
      <b>⚙️ ${T('إعدادات التطبيق', 'App Settings')}</b>
    </div>
    <div class="form-group"><label>${T('رابط الفيسبوك الرسمي', 'Official Facebook URL')}</label><input type="url" id="st-fb" value="${S.settings.fb_url || ''}"></div>
    <div class="form-group" style="flex-direction:row;align-items:center;gap:10px">
      <input type="checkbox" id="st-fb-on" ${S.settings.fb_active ? 'checked' : ''} style="width:20px;height:20px;accent-color:var(--teal)">
      <label for="st-fb-on">${T('إظهار زر الفيسبوك للمستخدمين', 'Show Facebook button to users')}</label>
    </div>
    <button class="btn btn-primary btn-sm" onclick="saveSettings()">${T('حفظ', 'Save')}</button>
    <div id="st-saved" style="color:var(--green-urg);font-weight:700;display:none;margin-top:8px">✅ ${T('تم الحفظ', 'Saved')}</div>
    <p style="font-size:12px;color:var(--gray-400);margin-top:12px;text-align:center">${T('إعدادات أكثر + صلاحيات متعددة تحتاج Supabase لاحقاً.', 'More settings + multi-role needs Supabase later.')}</p>`;
  }
}

function saveSettings() {
  S.settings.fb_url    = document.getElementById('st-fb').value;
  S.settings.fb_active = document.getElementById('st-fb-on').checked;
  localStorage.setItem('shg_settings', JSON.stringify(S.settings));
  const saved = document.getElementById('st-saved');
  saved.style.display = 'block';
  setTimeout(() => saved.style.display = 'none', 2000);
}

function resetAnalytics() {
  S.analytics = { opens: 0, guidance_starts: 0, results: {}, lang: {}, call_911: 0, maps_clicks: 0 };
  saveAnalytics(); initAdmin();
}

// ===== STEP DOTS =====
function renderDots(containerId, current, total) {
  const c = document.getElementById(containerId);
  if (!c) return;
  let h = '';
  for (let i = 1; i <= total; i++) {
    h += `<div class="dot ${i === current ? 'active' : i < current ? 'done' : ''}"></div>`;
  }
  c.innerHTML = h;
}

// ===== HELPER: Make chip button =====
function makeChip(label, onClick) {
  const b = document.createElement('button');
  b.className = 'chip';
  b.textContent = label;
  b.onclick = onClick;
  return b;
}

// ===== ANALYTICS =====
function track(event) {
  S.analytics[event] = (S.analytics[event] || 0) + 1;
  saveAnalytics();
}
function saveAnalytics() { localStorage.setItem('shg_analytics', JSON.stringify(S.analytics)); }

// ===== INIT =====
S.analytics.opens = (S.analytics.opens || 0) + 1;
saveAnalytics();
document.addEventListener('DOMContentLoaded', () => { applyText(); });

// ===== CLICK SOUND (fail-safe) =====
function playClick() {
  try {
    const audio = document.getElementById('click-audio');
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {}); // silent fail if file missing
    }
  } catch(e) {}
}

// ===== APP RATING =====
function submitRating(type) {
  const happy = document.getElementById('rating-happy');
  const sad   = document.getElementById('rating-sad');
  const confirm = document.getElementById('rating-confirm');
  if (!happy || !sad || !confirm) return;

  // Reset both
  happy.classList.remove('selected');
  sad.classList.remove('selected');

  // Highlight selected
  if (type === 'happy') happy.classList.add('selected');
  else sad.classList.add('selected');

  // Show confirmation
  confirm.style.display = 'block';
  applyText(); // re-apply language to new element
}


/* ======================================================
   FINAL PATCH v5 — Contextual Journal + Smart Safety Flow
   - Journal shows one selected section only, not all sections.
   - Direct journal entry shows section index only.
   - Every journal section has Home button.
   - All inquiry services use section-specific safety questions.
   ====================================================== */

const CONTEXT_SAFETY_OPTIONS = {
  vaccination: [
    { id:'breathing', ar:'هل لديك صعوبة تنفس بعد المطعوم أو بعد التعرض لعقر/لدغ؟', en:'Do you have breathing difficulty after a vaccine or bite/sting exposure?', lvl:'red' },
    { id:'swelling', ar:'هل يوجد تورم شديد في الوجه أو اللسان أو الحلق؟', en:'Is there severe swelling of the face, tongue, or throat?', lvl:'red' },
    { id:'allergy', ar:'هل يوجد طفح جلدي منتشر أو حساسية شديدة؟', en:'Is there widespread rash or severe allergy symptoms?', lvl:'orange' },
    { id:'fever', ar:'هل لديك حرارة عالية أو مستمرة أو تدهور واضح؟', en:'Do you have high/persistent fever or clear worsening?', lvl:'yellow' },
    { id:'routine', ar:'استفساري روتيني عن موعد/جرعة/استكمال مطعوم', en:'My inquiry is routine: appointment/dose/vaccine completion', lvl:'blue_white' }
  ],
  cast: [
    { id:'severe_pain', ar:'هل يوجد ألم شديد لا يتحسن بالمسكنات المعتادة؟', en:'Is there severe pain not improving with usual painkillers?', lvl:'orange' },
    { id:'blue_pale', ar:'هل أصبح لون الأصابع أزرق أو شاحبًا؟', en:'Have the fingers/toes become blue or pale?', lvl:'red' },
    { id:'numbness', ar:'هل يوجد فقدان إحساس أو خدر وتنميل مستمر؟', en:'Is there loss of sensation or persistent numbness/tingling?', lvl:'orange' },
    { id:'sudden_swelling', ar:'هل يوجد تورم مفاجئ أو غير طبيعي حول الجبيرة؟', en:'Is there sudden or abnormal swelling around the cast?', lvl:'yellow' },
    { id:'routine', ar:'استفساري روتيني عن الجبيرة أو موعد المراجعة', en:'My inquiry is routine about the cast or follow-up appointment', lvl:'blue_white' }
  ],
  dressing: [
    { id:'active_bleeding', ar:'هل يوجد نزيف نشط ومستمر لا يتوقف بالضغط المباشر؟', en:'Is there active continuous bleeding not stopping with direct pressure?', lvl:'red' },
    { id:'wound_open', ar:'هل انفتحت حواف الجرح أو غيار العملية بشكل واضح؟', en:'Have the wound edges or surgical wound opened clearly?', lvl:'orange' },
    { id:'infection', ar:'هل يوجد صديد/رائحة كريهة/احمرار منتشر أو ألم متزايد؟', en:'Is there pus, bad smell, spreading redness, or increasing pain?', lvl:'yellow' },
    { id:'fever_wound', ar:'هل توجد حرارة مرتبطة بمكان الجرح أو تدهور عام؟', en:'Is there fever related to the wound or general worsening?', lvl:'yellow' },
    { id:'routine', ar:'استفساري روتيني عن غيار جرح أو غيار بعد عملية', en:'My inquiry is routine wound/post-op dressing', lvl:'blue_white' }
  ],
  report: [
    { id:'emergency_case', ar:'هل تحتاج التقرير بسبب إصابة حادة أو حادث أو حالة طارئة الآن؟', en:'Do you need the report because of an acute injury, accident, or emergency now?', lvl:'yellow' },
    { id:'danger_now', ar:'هل لديك ألم صدر شديد أو ضيق تنفس أو فقدان وعي الآن؟', en:'Do you have severe chest pain, shortness of breath, or loss of consciousness now?', lvl:'red' },
    { id:'routine', ar:'استفساري روتيني عن تقرير طبي غير قضائي/إداري', en:'My inquiry is routine about a non-legal/administrative medical report', lvl:'blue_white' }
  ],
  prescription: [
    { id:'danger_symptoms', ar:'هل لديك أعراض خطيرة بسبب نفاد الدواء مثل ألم صدر، ضيق تنفس، فقدان وعي أو تدهور شديد؟', en:'Do you have serious symptoms due to running out of medication such as chest pain, shortness of breath, loss of consciousness, or severe worsening?', lvl:'red' },
    { id:'unstable_chronic', ar:'هل مرضك المزمن غير مستقر الآن بشكل واضح؟', en:'Is your chronic condition clearly unstable now?', lvl:'yellow' },
    { id:'no_meds', ar:'هل نفد الدواء وتحتاج مراجعة قريبة خلال اليوم؟', en:'Did the medication run out and you need review today?', lvl:'yellow' },
    { id:'routine', ar:'استفساري روتيني عن تجديد الوصفات الطبية/الأدوية الشهرية', en:'My inquiry is routine prescription/monthly medication renewal', lvl:'blue_white' }
  ],
  tests: [
    { id:'critical_symptoms', ar:'هل لديك أعراض شديدة الآن تحتاج تقييمًا عاجلًا قبل أي فحص؟', en:'Do you have severe symptoms now requiring urgent evaluation before any test?', lvl:'orange' },
    { id:'urgent_result', ar:'هل أُبلغت بنتيجة خطيرة أو طلب منك الطبيب مراجعة عاجلة اليوم؟', en:'Were you told about a critical result or asked by a doctor to review urgently today?', lvl:'yellow' },
    { id:'routine', ar:'استفساري روتيني عن فحوصات أو متابعة نتائج مخبرية', en:'My inquiry is routine tests or lab results follow-up', lvl:'blue_white' }
  ],
  referral: [
    { id:'acute_now', ar:'هل حالتك تتدهور الآن أو لديك أعراض لا تحتمل؟', en:'Is your condition worsening now or do you have unbearable symptoms?', lvl:'orange' },
    { id:'red_now', ar:'هل لديك فقدان وعي، ألم صدر شديد، ضيق تنفس شديد، أو علامات جلطة؟', en:'Do you have loss of consciousness, severe chest pain, severe shortness of breath, or stroke signs?', lvl:'red' },
    { id:'routine', ar:'استفساري روتيني عن تحويل طبي أو موعد اختصاص', en:'My inquiry is routine medical referral or specialist appointment', lvl:'blue_white' }
  ],
  sicklv: [
    { id:'severe_now', ar:'هل لديك أعراض شديدة أو طارئة الآن وتحتاج علاجًا فوريًا؟', en:'Do you have severe or emergency symptoms now requiring immediate treatment?', lvl:'orange' },
    { id:'red_now', ar:'هل لديك ألم صدر شديد، ضيق تنفس شديد، فقدان وعي أو نزيف حاد؟', en:'Do you have severe chest pain, severe shortness of breath, loss of consciousness, or severe bleeding?', lvl:'red' },
    { id:'routine', ar:'استفساري روتيني عن الإجازات المرضية واعتمادها', en:'My inquiry is routine about sick leave and approval', lvl:'blue_white' }
  ]
};

const SERVICE_TOPIC_SUMMARY = {
  cast: [
    { key:'definition', title:'تعريف ومعنى ووظيفة هذا القسم', body:'هذا القسم مخصص للاستفسارات المتعلقة بالكسور أو الجبيرة القديمة، مثل الألم، الضغط، التورم، موعد المراجعة، أو الحاجة لتعديل الجبيرة.' },
    { key:'place', title:'مكان الإجراء والمتابعة', body:'المتابعة تكون عادة في عيادات العظام أو المراكز الصحية/العيادات الخارجية حسب الحالة. الطوارئ تكون فقط عند وجود علامات خطر مثل ألم شديد أو ازرقاق أو فقدان إحساس.' },
    { key:'warning', title:'تنويه هام للمراجع', body:'راجع الطوارئ فورًا عند وجود ألم شديد لا يتحسن، ازرقاق أو شحوب الأصابع، خدر مستمر، تورم مفاجئ، أو تدهور واضح.' },
    { key:'links', title:'الروابط والمعلومات المفيدة', body:'احتفظ بكرت المراجعة إن وجد، واتبع موعد عيادة العظام أو المركز الصحي المحدد لك.' }
  ],
  dressing: [
    { key:'definition', title:'تعريف ومعنى ووظيفة هذا القسم', body:'هذا القسم مخصص للعناية بالجروح وغيار الجروح بعد العمليات السابقة، لضمان الالتئام وتقليل خطر الالتهاب والمضاعفات.' },
    { key:'place', title:'مكان الإجراء والمتابعة', body:'تقدم الخدمة في عيادات الجراحة الخارجية في المستشفيات الحكومية والمراكز الصحية الشاملة، وليس في الطوارئ للحالات الروتينية.' },
    { key:'warning', title:'تنويه هام للمراجع', body:'راجع الطوارئ عند ظهور صديد أو رائحة كريهة، حرارة مرتبطة بالجرح، احمرار منتشر، ألم متزايد، نزيف لا يتوقف، أو انفتاح حواف الجرح.' },
    { key:'links', title:'الروابط والاتصال', body:'موقع وزارة الصحة الأردنية moh.gov.jo، بوابة الحكومة الإلكترونية jordan.gov.jo، وللاستفسارات خدمة وزارة الصحة: 065200230.' }
  ],
  report: [
    { key:'definition', title:'تعريف ومعنى ووظيفة هذا القسم', body:'التقارير الطبية غير القضائية توثق الحالة الصحية لأغراض إدارية أو وظيفية أو مدرسية بناءً على الفحص والسجل الطبي.' },
    { key:'place', title:'مكان الإصدار والمتابعة', body:'تصدر من المركز الصحي الشامل أو العيادات الخارجية للمستشفيات الحكومية بواسطة الطبيب المختص أو المشرف على الحالة.' },
    { key:'warning', title:'تنويه هام للمراجع', body:'أقسام الطوارئ ليست جهة إصدار التقارير الروتينية أو الإدارية، ويقتصر دورها على الرعاية الإسعافية الطارئة.' },
    { key:'links', title:'شروط الاعتماد', body:'ليكون التقرير معتمدًا يجب أن يحمل توقيع/ختم الطبيب، وختم إدارة المستشفى أو المركز الصحي، وختم المحاسبة عند الحاجة.' }
  ],
  vaccination: [
    { key:'emergency-vaccines', title:'المطاعيم الطارئة', body:'تشمل مطعوم ومصل الكزاز، مطعوم ومصل داء الكلب/السعار، وأمصال لدغات الأفاعي والعقارب. تحتاج تدخلًا سريعًا عند التعرض لعقر أو لدغ أو جرح ملوث.' },
    { key:'dose-completion', title:'استكمال الجرعات', body:'للمتابعات الروتينية واستكمال بروتوكولات العلاج مثل جرعات الكزاز أو داء الكلب بعد الجرعة الإسعافية الأولى، ومتابعة الجرعات المتأخرة أو الموسمية.' },
    { key:'children-vaccines', title:'مطاعيم الأطفال', body:'لمتابعة البرنامج الوطني لتطعيم الأطفال في مراكز الأمومة والطفولة والمراكز الصحية، مع الالتزام بالمواعيد لحماية الطفل.' },
    { key:'links', title:'الروابط والمواعيد', body:'يمكن متابعة المعلومات عبر وزارة الصحة moh.gov.jo، وتطبيق/منصة VaccineJo، وللاستعلام: 065008080.' }
  ],
  prescription: [
    { key:'definition', title:'تعريف ومعنى ووظيفة هذا القسم', body:'هذا القسم لتجديد الوصفات الطبية والأدوية الشهرية لمرضى الأمراض المزمنة مثل السكري والضغط وأمراض القلب.' },
    { key:'place', title:'مكان التجديد والصرف', body:'يتم التجديد والصرف عبر المراكز الصحية الشاملة أو المستشفيات الحكومية المعتمدة المسجل فيها ملفك الطبي، أو عبر خدمة التوصيل المنزلي عند توفرها.' },
    { key:'warning', title:'تنويه هام للمراجع', body:'خدمات صرف وتجديد الأدوية المزمنة لا تقدم في أقسام الطوارئ. راجع الطوارئ فقط إذا ظهرت أعراض خطيرة أو تدهور حاد.' },
    { key:'links', title:'الروابط والدعم', body:'استخدم بوابة حكيمي أو تطبيق حكيمي، وموقع وزارة الصحة moh.gov.jo. للدعم الفني: 065008080.' }
  ],
  tests: [
    { key:'definition', title:'تعريف ومعنى ووظيفة هذا القسم', body:'هذا القسم يساعدك في فهم إجراء الفحوصات المخبرية الشاملة ومتابعة نتائجها وتقارير الأشعة والفحوصات الروتينية.' },
    { key:'place', title:'مكان الإجراء والمتابعة', body:'تجرى الفحوصات الروتينية في المراكز الصحية الأولية أو الشاملة التابعة لمنطقتك، وتتوفر النتائج إلكترونيًا عبر منصة حكيمي بعد التفعيل.' },
    { key:'warning', title:'تنويه هام للمراجع', body:'أقسام الطوارئ لا تقوم بإجراء الفحوصات الروتينية أو تسليم نتائجها، فهي مخصصة للحالات الحرجة والتحاليل الإسعافية العاجلة.' },
    { key:'links', title:'الروابط الإلكترونية ووظيفتها', body:'بوابة حكيمي وتطبيق Hakeem My يتيحان متابعة النتائج. قد تحتاج زيارة السجل الطبي مرة واحدة للحصول على رمز التسجيل.' }
  ],
  referral: [
    { key:'definition', title:'تعريف ومعنى ووظيفة هذا القسم', body:'هذا القسم يشرح التحويلات الطبية ومواعيد ديوان/عيادات الاختصاص، لتنظيم الانتقال بين المركز الصحي وطبيب الاختصاص.' },
    { key:'place', title:'مسار التحويل المعتمد', body:'يبدأ التحويل بمراجعة الطبيب العام في المركز الصحي التابع لمنطقتك، وبناءً على تقييمه يتم تحويلك للمركز الشامل أو العيادات الخارجية في المستشفى الحكومي.' },
    { key:'warning', title:'تنويه هام للمراجع', body:'حجز مواعيد الاختصاص أو التحويلات الروتينية لا يتم داخل الطوارئ. الطوارئ مخصصة للحالات الحرجة والعاجلة فقط.' },
    { key:'links', title:'المنصات والرسائل', body:'يمكن استخدام بوابة حكيمي، نظام حجز مواعيد وزارة الصحة، تطبيق حكيمي، ورسائل SMS لتنظيم الدور والمواعيد.' }
  ],
  sicklv: [
    { key:'definition', title:'تعريف ومعنى ووظيفة هذا القسم', body:'الإجازة المرضية وثيقة رسمية تمنح للمراجع الذي يعاني من حالة صحية تمنعه من ممارسة عمله أو واجباته المدرسية.' },
    { key:'place', title:'مكان الإصدار', body:'تصدر الإجازات المرضية الروتينية من المراكز الصحية الشاملة والأولية أو العيادات الخارجية للمستشفيات بعد فحص المريض وتقييم حالته.' },
    { key:'warning', title:'تنويه هام للمراجع', body:'أقسام الطوارئ لا تصدر إجازات مرضية روتينية. تعطى من الطوارئ فقط في الحالات القصوى التي تتطلب راحة فورية ولمدة محدودة جدًا.' },
    { key:'links', title:'شروط الاعتماد', body:'يجب أن تحمل الإجازة ختم الطبيب المعالج أو المختص، وختم إدارة المستشفى أو المركز الصحي، وختم المحاسبة عند الحاجة.' }
  ]
};

function getServiceInfo(type) {
  return SERVICE_INFO[type] || null;
}

function startNE(type) {
  S.svcType = type;
  S.safetyWarnings = [];
  window.selectedVaccineAnchor = null;
  window.contextSafetySelections = [];
  // Safety First: do not open service details before the section-specific safety check.
  if (getServiceInfo(type)) {
    go('s-context-safety');
  } else {
    go('s-age');
  }
}

function initServiceInfo() {
  const info = getServiceInfo(S.svcType);
  const c = document.getElementById('service-info-content');
  const title = document.getElementById('service-info-title');
  if (!info || !c) { home(); return; }
  if (title) title.textContent = T(info.ar, info.en);
  const topics = SERVICE_TOPIC_SUMMARY[S.svcType] || [];
  let h = `<div class="info-card"><b>${T(info.ar, info.en)}</b><p>${T('اختر جزءًا لعرض معلومات مبسطة، ثم ابدأ فحص السلامة الخاص بهذا القسم.', 'Choose a part to view simple information, then start this section-specific safety check.')}</p></div>`;
  if (topics.length) {
    h += `<div class="quick-topic-row service-topic-row">${topics.map(t => `<button class="quick-topic-btn" onclick="showServiceTopic('${t.key}')">${t.title}</button>`).join('')}</div>`;
  }
  c.innerHTML = h;
  if (topics[0]) showServiceTopic(topics[0].key);
}

function showServiceTopic(key) {
  const topics = SERVICE_TOPIC_SUMMARY[S.svcType] || [];
  const topic = topics.find(t => t.key === key) || topics[0];
  if (!topic) return;
  if (S.svcType === 'vaccination' && ['emergency-vaccines','dose-completion','children-vaccines'].includes(topic.key)) {
    window.selectedVaccineAnchor = topic.key;
  }
  const box = document.getElementById('service-topic-detail');
  if (box) box.innerHTML = `<b>${topic.title}</b><p>${topic.body}</p>`;
}

function beginContextSafety() {
  const info = getServiceInfo(S.svcType);
  if (!info) { go('s-safety'); return; }
  go('s-context-safety');
}

function initContextSafety() {
  const c = document.getElementById('context-safety-chips');
  const title = document.getElementById('context-safety-title');
  const info = getServiceInfo(S.svcType);
  if (!c || !info) { home(); return; }
  if (title) title.textContent = T(`فحص سلامة ${info.ar}`, `Safety Check: ${info.en}`);
  window.contextSafetySelections = [];
  c.innerHTML = '';
  const options = CONTEXT_SAFETY_OPTIONS[S.svcType] || SAFETY_WARNINGS;
  options.forEach(w => {
    const b = makeChip(T(w.ar, w.en), () => {
      if (w.id === 'routine' || w.lvl === 'blue_white') {
        window.contextSafetySelections = [];
        c.querySelectorAll('.chip').forEach(x => x.classList.remove('selected'));
      } else {
        const routineChip = Array.from(c.querySelectorAll('.chip')).find(x => x.dataset.routine === '1');
        if (routineChip) routineChip.classList.remove('selected');
        window.contextSafetySelections = (window.contextSafetySelections || []).filter(x => x.id !== 'routine');
      }
      b.classList.toggle('selected');
      if (b.classList.contains('selected')) {
        window.contextSafetySelections.push(w);
      } else {
        window.contextSafetySelections = window.contextSafetySelections.filter(x => x.id !== w.id);
      }
    });
    if (w.id === 'routine' || w.lvl === 'blue_white') b.dataset.routine = '1';
    c.appendChild(b);
  });
}

function submitContextSafety() {
  const selected = window.contextSafetySelections || [];
  if (!selected.length) {
    alert(T('يرجى اختيار إجابة واحدة على الأقل', 'Please select at least one answer'));
    return;
  }
  S.danger = selected.map(x => ({ ar:x.ar, en:x.en, lvl:x.lvl }));
  S.symptoms = [];
  const hasRed = selected.some(x => x.lvl === 'red');
  const hasOrange = selected.some(x => x.lvl === 'orange');
  const hasYellow = selected.some(x => x.lvl === 'yellow');
  S.urgency = hasRed ? 'red' : hasOrange ? 'orange' : hasYellow ? 'yellow' : 'blue_white';
  showResult();
  injectContextResultNote(S.urgency);
}

function injectContextResultNote(level) {
  const info = getServiceInfo(S.svcType);
  const result = document.getElementById('result-content');
  if (!info || !result) return;
  const text = level === 'red' || level === 'orange'
    ? 'يجب عليك التوجه لأقرب طوارئ الآن أو الاتصال بـ 911 إذا كانت الأعراض شديدة.'
    : level === 'yellow'
      ? 'يرجى مراجعة المركز الصحي أو الطبيب خلال اليوم حسب حالتك.'
      : 'يرجى مراجعة المركز الصحي خلال ساعات العمل الرسمية، ولا تتوجه للطوارئ إلا عند ظهور علامات خطر.';
  result.insertAdjacentHTML('afterbegin', `<div class="info-card contextual-result-note"><b>نتيجة فحص السلامة الخاص بـ ${info.ar}</b><p>${text}</p></div>`);
}

function renderContextualMoreButton() {
  if (!S.svcType || !SERVICE_INFO[S.svcType]) return '';
  const info = SERVICE_INFO[S.svcType];
  const label = T(info.ar, info.en);
  const anchor = S.svcType === 'vaccination' && window.selectedVaccineAnchor ? window.selectedVaccineAnchor : info.anchor;
  return `<button class="btn btn-context-more" onclick="goJournal('${anchor}')">📚 ${T('اعرف أكثر عن', 'Learn more about')} ${label}</button>`;
}

function resolveJournalSection(anchor) {
  if (!anchor || anchor === 'top' || anchor === 'index') return null;
  if (['emergency-vaccines','dose-completion','children-vaccines'].includes(anchor)) return JOURNAL_SECTIONS.find(s => s.anchor === 'vaccines');
  return JOURNAL_SECTIONS.find(s => s.anchor === anchor) || null;
}

function buildJournalTopicButtons(section, selectedAnchor) {
  let topics = [];
  const svcType = Object.keys(SERVICE_INFO).find(k => SERVICE_INFO[k].anchor === section.anchor) || (section.anchor === 'vaccines' ? 'vaccination' : null);
  topics = SERVICE_TOPIC_SUMMARY[svcType] || [];
  if (section.anchor === 'vaccines') {
    topics = [
      { key:'emergency-vaccines', title:'المطاعيم الطارئة' },
      { key:'dose-completion', title:'استكمال الجرعات' },
      { key:'children-vaccines', title:'مطاعيم الأطفال' },
      { key:'links', title:'الروابط والمواعيد' }
    ];
  }
  if (!topics.length) return '';
  return `<div class="journal-single-topic-nav">${topics.map(t => `<button class="journal-nav-btn ${t.key === selectedAnchor ? 'active' : ''}" onclick="showJournalTopic('${section.anchor}','${t.key}')">${t.title}</button>`).join('')}</div>`;
}

function getJournalTopicContent(sectionAnchor, topicKey) {
  const section = JOURNAL_SECTIONS.find(s => s.anchor === sectionAnchor);
  if (!section) return '';
  if (sectionAnchor === 'vaccines') {
    const all = section.html;
    if (topicKey === 'emergency-vaccines') return extractBetween(all, 'id="emergency-vaccines"', 'id="dose-completion"');
    if (topicKey === 'dose-completion') return extractBetween(all, 'id="dose-completion"', 'id="children-vaccines"');
    if (topicKey === 'children-vaccines') return extractBetween(all, 'id="children-vaccines"', null);
  }
  const svcType = Object.keys(SERVICE_INFO).find(k => SERVICE_INFO[k].anchor === sectionAnchor);
  const topics = SERVICE_TOPIC_SUMMARY[svcType] || [];
  const topic = topics.find(t => t.key === topicKey) || topics[0];
  if (topic) return `<h3>${topic.title}</h3><p>${topic.body}</p><div class="journal-body-full">${section.html}</div>`;
  return section.html;
}

function extractBetween(html, startNeedle, endNeedle) {
  const s = html.indexOf(startNeedle);
  if (s < 0) return html;
  const startTag = html.lastIndexOf('<h3', s);
  const e = endNeedle ? html.indexOf(endNeedle, s + 1) : -1;
  const endTag = e >= 0 ? html.lastIndexOf('<h3', e) : html.length;
  return html.slice(startTag >= 0 ? startTag : s, endTag > 0 ? endTag : html.length);
}

function showJournalTopic(sectionAnchor, topicKey) {
  const box = document.getElementById('journal-single-body');
  if (box) box.innerHTML = getJournalTopicContent(sectionAnchor, topicKey);
  document.querySelectorAll('.journal-single-topic-nav .journal-nav-btn').forEach(btn => btn.classList.remove('active'));
  const btns = Array.from(document.querySelectorAll('.journal-single-topic-nav .journal-nav-btn'));
  const b = btns.find(x => x.getAttribute('onclick') && x.getAttribute('onclick').includes(`'${topicKey}'`));
  if (b) b.classList.add('active');
}

function goJournal(anchor) {
  window.pendingJournalAnchor = anchor || 'index';
  go('s-medical-journal');
}

function initMedicalJournal() {
  const c = document.getElementById('medical-journal-content');
  if (!c) return;
  const requested = window.pendingJournalAnchor || 'index';
  window.pendingJournalAnchor = null;
  const section = resolveJournalSection(requested);
  if (!section) {
    let h = `<div class="journal-hero"><h2>${T('المجلة الطبية الشاملة', 'Comprehensive Medical Journal')}</h2><p>${T('اختر القسم الذي تريد الاطلاع عليه. لن يتم عرض كل المواضيع دفعة واحدة لتسهيل القراءة والوصول.', 'Choose the section you want. Topics are not all shown at once for easier reading and access.')}</p></div>`;
    h += `<button class="btn btn-outline" onclick="home()">🏠 ${T('العودة إلى الصفحة الرئيسية', 'Back to Home')}</button>`;
    h += `<div class="journal-section-grid">${JOURNAL_SECTIONS.map(s => `<button class="journal-section-card" onclick="goJournal('${s.anchor}')"><span>${s.icon}</span><b>${s.title}</b></button>`).join('')}</div>`;
    c.innerHTML = h;
    return;
  }
  const selectedTopic = section.anchor === 'vaccines'
    ? (['emergency-vaccines','dose-completion','children-vaccines'].includes(requested) ? requested : 'emergency-vaccines')
    : ((SERVICE_TOPIC_SUMMARY[Object.keys(SERVICE_INFO).find(k => SERVICE_INFO[k].anchor === section.anchor)] || [])[0] || {}).key;
  let h = `<section class="journal-section journal-single" id="${section.anchor}"><h2>${section.icon} ${section.title}</h2>`;
  h += `<button class="btn btn-outline journal-home-btn" onclick="home()">🏠 ${T('العودة إلى الصفحة الرئيسية', 'Back to Home')}</button>`;
  h += buildJournalTopicButtons(section, selectedTopic);
  h += `<div id="journal-single-body" class="journal-body">${getJournalTopicContent(section.anchor, selectedTopic)}</div>`;
  h += `</section>`;
  c.innerHTML = h;
}

function scrollJournalToAnchor(anchor) {
  showJournalTopic('vaccines', anchor);
}

function initScreen(id) {
  const map = {
    's-home': initHome,
    's-about': initAbout,
    's-pathway': initPathway,
    's-service-info': initServiceInfo,
    's-context-safety': initContextSafety,
    's-safety': initSafety,
    's-chronic': initChronic,
    's-system': initSystem,
    's-duration': initDuration,
    's-progression': initProgression,
    's-danger': initDanger,
    's-emergency-find': initEmergencyFind,
    's-vaccine-info': initVaccineInfo,
    's-vaccine-safety': initVaccineSafety,
    's-medical-journal': initMedicalJournal,
    's-library': initLibrary,
    's-dyk': initDYK,
    's-directory': initDirectory,
    's-evening': initEvening,
    's-admin': initAdmin
  };
  if (map[id]) map[id]();
}
function refreshLocationButtons() {
  // دالة احتياطية حتى لا تتعطل الصفحة الرئيسية
  applyText();
}

function requestHomeLocation() {
  // تحويل زر تفعيل الموقع لنفس دالة الموقع الموجودة عند النتائج
  requestGPS();
}
// ================= دوال المواقع الجغرافية المفقودة =================
function refreshLocationButtons() {
    console.log("🔄 تحديث أزرار المواقع");
    if (typeof initMap === 'function') {
        initMap();
    }
    if (typeof S !== 'undefined' && S.userLat) {
        const gpsBtn = document.querySelector('.home-btn[onclick*="requestGPS"]');
        if (gpsBtn) gpsBtn.style.opacity = '0.8';
    }
}

function requestHomeLocation() {
    if (!navigator.geolocation) {
        alert("المتصفح لا يدعم تحديد الموقع");
        return;
    }
    navigator.geolocation.getCurrentPosition(
        function(pos) {
            alert(`📍 موقعك: ${pos.coords.latitude}, ${pos.coords.longitude}`);
            if (typeof S !== 'undefined') {
                S.userLat = pos.coords.latitude;
                S.userLng = pos.coords.longitude;
            } else {
                window.userLat = pos.coords.latitude;
                window.userLng = pos.coords.longitude;
            }
            if (typeof initMap === 'function') initMap();
        },
        function(err) {
            alert("❌ فشل تحديد الموقع: " + err.message);
        }
    );
}
