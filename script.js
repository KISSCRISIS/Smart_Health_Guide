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
  report:      { ar:'التقارير الطبية غير القضائية تُطلب من العيادات أو الطبيب المعالج، وليس من الطوارئ. راجع المركز الصحي أو العيادة المختصة.',                                 en:'Non-legal medical reports are handled by clinics or the treating doctor, not emergency. Visit the health center or relevant clinic.' },
  vaccination: { ar:'متابعة المطاعيم تتم في المراكز الصحية أو عيادات المطاعيم، وليس في الطوارئ. راجع أقرب مركز صحي حسب منطقتك وأوقات الدوام.',                                en:'Vaccination follow-up is handled by health centers or vaccination clinics, not emergency. Visit the nearest health center per your area and working hours.' },
  prescription:{ ar:'تجديد الوصفات أو أدوية الأمراض المزمنة يكون عبر المركز الصحي أو العيادات الخارجية، وليس الطوارئ.',                                                         en:'Prescription refills or chronic medications are handled through health centers or outpatient clinics, not emergency.' },
  tests:       { ar:'الفحوصات الروتينية ومتابعة النتائج تتم في المركز الصحي أو العيادات الخارجية بموعد أو تحويل.',                                                               en:'Routine tests and result follow-up are handled at health centers or outpatient clinics by appointment or referral.' },
  referral:    { ar:'للحصول على موعد اختصاص أو تحويل، ابدأ بأقرب مركز صحي شامل. قد يساعدك المركز في التقييم وترتيب التحويل للعيادات الخارجية.',                               en:'For a specialist appointment or referral, start with the nearest comprehensive health center. They can provide assessment and arrange outpatient referrals.' },
  sicklv:      { ar:'التطبيق لا يقرر الإجازة المرضية ولا يضمنها. الطبيب المعالج يقرر الحاجة ومدتها. لا يُنصح بمراجعة الطوارئ فقط للحصول على إجازة مرضية.',                     en:'The app does not decide or guarantee sick leave. The treating doctor decides based on examination and regulations. Do not visit emergency only to obtain sick leave.' }
};

const PATHWAY_OPTIONS = [
  { icon:'🤒', ar:'أعراض صحية جديدة',                       en:'New Symptoms',                         action:()=>go('s-age') },
  { icon:'🦴', ar:'مشكلة في الجبيرة أو إعادة عمل جبيرة',   en:'Cast or Splint Issue',                 action:()=>startNE('cast') },
  { icon:'🩹', ar:'غيار جرح أو غيار بعد عملية',             en:'Wound / Post-op Dressing',             action:()=>startNE('dressing') },
  { icon:'📄', ar:'تقرير طبي غير قضائي',                    en:'Non-legal Medical Report',             action:()=>startNE('report') },
  { icon:'💉', ar:'متابعة مطاعيم',                          en:'Vaccination Follow-up',                action:()=>startNE('vaccination') },
  { icon:'💊', ar:'تجديد وصفة أو أدوية مزمنة',             en:'Prescription / Chronic Medication',    action:()=>startNE('prescription') },
  { icon:'🔬', ar:'فحوصات روتينية أو متابعة نتائج',         en:'Routine Tests / Results',              action:()=>startNE('tests') },
  { icon:'🏨', ar:'موعد اختصاص أو تحويل',                  en:'Specialist Appointment / Referral',    action:()=>startNE('referral') },
  { icon:'📝', ar:'استفسار عن إجازة مرضية',                 en:'Sick Leave Guidance',                  action:()=>startNE('sicklv') },
  { icon:'❓', ar:'أخرى',                                   en:'Other',                                action:()=>go('s-age') }
];

const ARTICLES = [
  { id:5, cat:'awareness', icon:'💙',
    titleAr:'قرارك قد ينقذ غيرك', titleEn:'Your Decision May Save Someone Else',
    sumAr:'اختيار الجهة الصحية المناسبة يساعدك ويساعد غيرك.', sumEn:'Choosing the right healthcare destination helps you and others.',
    quickAr:['الطوارئ للحالات الخطيرة والمفاجئة.','الحالات البسيطة قد تكون أسرع في المركز الصحي أو العيادات.','اختيارك الصحيح يترك المجال للحالات الحرجة.'],
    quickEn:['Emergency is for serious and sudden conditions.','Mild cases may be faster at health centers or clinics.','Your right choice leaves room for critical cases.'],
    detailsAr:'عندما يراجع المريض الجهة المناسبة لحالته، يحصل على خدمة أنسب ويوفر وقتًا وجهدًا، ويساعد الكوادر الطبية على إعطاء الأولوية للحالات الأخطر.',
    detailsEn:'When a patient visits the suitable destination for their condition, they receive more appropriate service and help medical teams prioritize more serious cases.',
    actionAr:'إذا كانت حالتك مستقرة، ابدأ بالمركز الصحي أو العيادات. إذا ظهرت علامات خطر، توجّه للطوارئ فورًا.',
    actionEn:'If your condition is stable, start with the health center or clinics. If warning signs appear, go to emergency immediately.',
    destAr:'انتقل إلى خيار: الطوارئ أم المركز الصحي؟', destEn:'Go to: Emergency or Health Center?',
    warnAr:'لا تؤخر طلب المساعدة عند وجود أعراض شديدة أو مفاجئة.', warnEn:'Do not delay seeking help if symptoms are severe or sudden.' },

  { id:9, cat:'previsit', icon:'🩺',
    titleAr:'كيف تستفيد من زيارتك للطبيب؟', titleEn:'How to Benefit from Your Doctor Visit?',
    sumAr:'خطوات بسيطة تساعدك على شرح حالتك والحصول على تقييم أفضل.', sumEn:'Simple steps to explain your condition and get better assessment.',
    quickAr:['اكتب متى بدأت الأعراض.','أحضر أسماء الأدوية أو صورها.','اسأل الطبيب عن علامات الخطر ومتى تراجع.'],
    quickEn:['Write when symptoms started.','Bring medication names or photos.','Ask about warning signs and when to return.'],
    detailsAr:'حضّر معلوماتك قبل الزيارة: مدة الأعراض، شدتها، الأمراض المزمنة، الحساسية الدوائية، الأدوية الحالية، والفحوصات أو التقارير السابقة إن وجدت.',
    detailsEn:'Prepare your information before the visit: symptom duration, severity, chronic diseases, medication allergies, current medications, and previous reports if available.',
    actionAr:'لا تغادر قبل أن تفهم طريقة استخدام العلاج وموعد المراجعة وعلامات الخطر.',
    actionEn:'Do not leave before understanding how to use treatment, when to return, and warning signs.',
    destAr:'المنشأة المناسبة حسب حالتك', destEn:'The suitable facility based on your condition',
    warnAr:'إذا ظهرت أعراض شديدة أثناء الانتظار، أخبر الكادر الطبي فورًا.', warnEn:'If severe symptoms appear while waiting, inform staff immediately.' },

  { id:10, cat:'previsit', icon:'📋',
    titleAr:'قبل الذهاب إلى أي منشأة صحية', titleEn:'Before Visiting Any Health Facility',
    sumAr:'ما الذي يجب أن تحضره معك قبل المراجعة؟', sumEn:'What should you bring before your visit?',
    quickAr:['أحضر الهوية أو دفتر التأمين.','أحضر الوصفات والتقارير السابقة.','للأطفال: أحضر كرت المطاعيم عند الحاجة.'],
    quickEn:['Bring ID or insurance booklet.','Bring previous prescriptions and reports.','For children: bring vaccination card when needed.'],
    detailsAr:'وجود معلومات واضحة يساعد الطبيب على تقييم حالتك بدقة أكبر، خاصة إذا كنت تستخدم أدوية مزمنة أو لديك حساسية دوائية أو عمليات سابقة.',
    detailsEn:'Clear information helps the doctor assess your condition more accurately, especially if you use chronic medications, have medication allergies, or prior operations.',
    actionAr:'اكتب قائمة مختصرة بالأعراض والأدوية قبل الوصول.',
    actionEn:'Write a short list of symptoms and medications before arriving.',
    destAr:'أي منشأة صحية حسب نوع المراجعة', destEn:'Any health facility based on visit type',
    warnAr:'لا تنسَ ذكر الحمل، الحساسية، الأمراض المزمنة، أو العمليات السابقة.', warnEn:'Do not forget to mention pregnancy, allergies, chronic diseases, or prior operations.' },

  { id:11, cat:'awareness', icon:'⏱️',
    titleAr:'متى لا تنتظر؟', titleEn:'When Should You Not Wait?',
    sumAr:'أعراض شديدة أو مفاجئة لا يجوز تأجيلها.', sumEn:'Severe or sudden symptoms should not be delayed.',
    quickAr:['ألم صدر شديد أو مفاجئ.','ضيق نفس شديد أو فقدان وعي.','نزيف شديد أو ضعف مفاجئ في جهة من الجسم.'],
    quickEn:['Severe or sudden chest pain.','Severe shortness of breath or loss of consciousness.','Severe bleeding or sudden weakness on one side.'],
    detailsAr:'بعض الأعراض قد تدل على حالة خطيرة تحتاج تقييمًا عاجلًا. لا تنتظر موعدًا عاديًا إذا كانت الأعراض شديدة، مفاجئة، أو غير محتملة.',
    detailsEn:'Some symptoms may indicate a serious condition that needs urgent assessment. Do not wait for a regular appointment if symptoms are severe, sudden, or intolerable.',
    actionAr:'اتصل بـ 911 أو توجّه للطوارئ فورًا عند وجود علامات خطر.',
    actionEn:'Call 911 or go to emergency immediately if warning signs exist.',
    destAr:'911 والطوارئ فورًا', destEn:'911 and emergency immediately',
    warnAr:'هذه الصفحة للتوعية فقط ولا تغني عن طلب المساعدة الطبية.', warnEn:'This page is for awareness only and does not replace seeking medical help.' },

  { id:12, cat:'medication', icon:'💊',
    titleAr:'الاستخدام الصحيح للأدوية', titleEn:'Safe Medication Use',
    sumAr:'استخدم الدواء بوصفة واضحة، ولا تكرر أو توقف العلاج دون استشارة.', sumEn:'Use medicines with clear instructions; do not repeat or stop treatment without advice.',
    quickAr:['لا تستخدم مضادًا حيويًا دون وصفة.','لا توقف علاج الضغط أو السكري دون مراجعة الطبيب.','لا تستخدم دواء شخص آخر.'],
    quickEn:['Do not use antibiotics without prescription.','Do not stop hypertension or diabetes treatment without medical advice.','Do not use someone else’s medicine.'],
    detailsAr:'الدواء الصحيح في المكان الصحيح وبالطريقة الصحيحة يحمي صحتك. تجنب تخزين كميات كبيرة من الأدوية أو تكرار صرفها من أكثر من جهة دون داعٍ.',
    detailsEn:'The right medicine, in the right place, and in the right way protects your health. Avoid storing large medicine quantities or repeating refills from multiple places unnecessarily.',
    actionAr:'اسأل الطبيب أو الصيدلي إذا لم تفهم الجرعة أو مدة العلاج.',
    actionEn:'Ask the doctor or pharmacist if you do not understand dose or treatment duration.',
    destAr:'لصرف الوصفات العملية راجع خيار: الطوارئ أم المركز الصحي؟', destEn:'For practical prescription guidance, see: Emergency or Health Center?',
    warnAr:'لا تشارك الأدوية ولا تستخدم علاجًا منتهي الصلاحية.', warnEn:'Do not share medicines or use expired medication.' },

  { id:13, cat:'awareness', icon:'📘',
    titleAr:'الوعي الصحي يبدأ من المعلومة الواضحة', titleEn:'Health Awareness Starts with Clear Information',
    sumAr:'معلومات مبسطة تساعدك على اتخاذ قرار صحي أفضل.', sumEn:'Simple information to help you make better health decisions.',
    quickAr:['المعلومة الواضحة تقلل القلق.','التوجيه الصحيح يحسن تجربة المراجع.','التطبيق يساعدك ولا يشخّص حالتك.'],
    quickEn:['Clear information reduces anxiety.','Correct guidance improves visitor experience.','The app helps guide you but does not diagnose.'],
    detailsAr:'تهدف مكتبة التوعية إلى تبسيط المعلومات الصحية، ومساعدة المستخدم على فهم متى يطلب المساعدة، وكيف يستعد للزيارة، وكيف يستخدم الدواء بأمان.',
    detailsEn:'The awareness library aims to simplify health information, helping users know when to seek help, how to prepare for visits, and how to use medication safely.',
    actionAr:'اقرأ المعلومات المختصرة، وعند الشك أو وجود أعراض شديدة اطلب المساعدة الطبية.',
    actionEn:'Read the short information, and if unsure or symptoms are severe, seek medical help.',
    destAr:'حسب حالتك الصحية', destEn:'Based on your health condition',
    warnAr:'هذه المعلومات للتوعية والإرشاد فقط.', warnEn:'This information is for awareness and guidance only.' }
];

const ART_CATS = [
  { id:'all',        ar:'الكل',                 en:'All' },
  { id:'awareness',  ar:'التوعية العامة',       en:'General Awareness' },
  { id:'previsit',   ar:'نصائح قبل المراجعة',  en:'Before Visit Tips' },
  { id:'medication', ar:'السلامة الدوائية',     en:'Medication Safety' },
  { id:'services',   ar:'الخدمات والمعلومات',   en:'Services & Info' }
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

// ===== NAVIGATION =====
function go(screenId) {
  const cur = document.querySelector('.screen.active');
  if (cur && cur.id !== screenId) S.history.push(cur.id);
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) { target.classList.add('active'); window.scrollTo(0, 0); }
  shgTrack('section_view', { section_id: screenId });
  applyText();
  initScreen(screenId);
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
    's-pathway':      initPathway,
    's-safety':       initSafety,
    's-chronic':      initChronic,
    's-system':       initSystem,
    's-duration':     initDuration,
    's-progression':  initProgression,
    's-danger':       initDanger,
    's-emergency-find': initEmergencyFind,
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
function initHome() {
  const link = document.getElementById('fb-about-official');
  if (link && S.settings.fb_url) link.href = S.settings.fb_url;
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
    <div class="gps-note">🔒 ${T('لن يتم حفظ موقعك — للجلسة الحالية فقط. لتحسين الخدمة المقدمة فقط.', 'Location will not be stored — current session only, only to improve the service provided.')}</div>
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
  if (distKm) h += `<div class="fac-row"><span class="fac-ico">📏</span><span>${distKm} ${T('كم', 'km')}</span></div>`;
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
  const btn = document.getElementById('gps-btn');
  if (btn) btn.textContent = T('جاري تحديد موقعك...', 'Detecting your location...');
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => { S.userLat = pos.coords.latitude; S.userLng = pos.coords.longitude; updateFacsWithGPS(); },
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
  const cfg = URG[S.urgency];
  let facs = FACILITIES.filter(f => cfg.dest.includes(f.type));
  facs = facs.map(f => ({ ...f, dist: geoDistance(S.userLat, S.userLng, f.lat, f.lng) }))
             .sort((a, b) => a.dist - b.dist).slice(0, 3);
  const gpsCard = document.querySelector('.gps-card');
  if (gpsCard) gpsCard.innerHTML = `<p style="color:var(--teal-dark);font-weight:700">✅ ${T('تم تحديد موقعك بنجاح', 'Location detected successfully')}</p>`;
  const fc = document.getElementById('fac-result');
  if (fc) {
    let h = `<div class="section-label" style="margin-bottom:8px">📍 ${T('أقرب المنشآت إليك', 'Nearest Facilities to You')}</div>`;
    facs.forEach((f, i) => h += renderFac(f, i === 0, f.dist.toFixed(1)));
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
    facs = FACILITIES.filter(f => f.type === 'emergency_hospital');
  } else {
    const prim = FACILITIES.find(f => f.id === area?.fid);
    facs = prim
      ? [prim, ...FACILITIES.filter(f => f.id !== area?.fid && cfg.dest.includes(f.type)).slice(0, 2)]
      : FACILITIES.filter(f => cfg.dest.includes(f.type)).slice(0, 3);
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
function startNE(type) { S.svcType = type; S.safetyWarnings = []; go('s-safety'); }

// ===== FIND EMERGENCY =====
function initEmergencyFind() {
  const c = document.getElementById('emergency-list');
  c.innerHTML = FACILITIES.filter(f => f.type === 'emergency_hospital').map((f, i) => renderFac(f, i === 0)).join('');
}


// ===== EMERGENCY OR HEALTH CENTER DETAILS =====
function showCareDetail(type) {
  const data = {
    emergency: {
      icon:'🚨', titleAr:'الطوارئ', titleEn:'Emergency', cls:'care-detail-emergency',
      quickAr:['ألم صدر شديد أو مفاجئ، ضيق نفس شديد، فقدان وعي، نزيف شديد.','أعراض جلطة محتملة، حادث شديد، إصابة قوية، ألم شديد غير محتمل.','في الحالات الخطيرة لا تنتظر استخدام التطبيق.'],
      quickEn:['Severe/sudden chest pain, severe shortness of breath, loss of consciousness, severe bleeding.','Possible stroke signs, severe accident, strong injury, intolerable pain.','In serious cases, do not wait to use the app.'],
      benefitAr:['سرعة إنقاذ الحياة عبر أولوية الفرز الطبي.','توفر الإنعاش والعناية الحثيثة والتدخل العاجل عند الحاجة.','إمكانية الإدخال للمستشفى أو العمليات والفحوصات المتقدمة للحالات الحرجة.'],
      benefitEn:['Life-saving speed through triage priority.','Resuscitation, ICU, and urgent intervention when needed.','Admission, surgery, and advanced testing for critical cases.'],
      medsAr:'الأدوية في الطوارئ إسعافية للحالات الحادة حسب تقييم الطبيب، وليست لتجديد العلاجات الشهرية.',
      medsEn:'Emergency medications are for acute cases based on medical assessment, not for monthly refill requests.'
    },
    center: {
      icon:'🏥', titleAr:'المركز الصحي', titleEn:'Health Center', cls:'care-detail-center',
      quickAr:['الرشح، التهاب الحلق البسيط، الحرارة الخفيفة دون علامات خطورة.','متابعة الضغط والسكري المستقر، المطاعيم، رعاية الأمومة والطفولة.','تجديد أدوية الأمراض المزمنة المستقرة حسب تقييم الطبيب.'],
      quickEn:['Cold, simple sore throat, mild fever without warning signs.','Stable hypertension/diabetes follow-up, vaccines, maternal and child care.','Stable chronic medication refills based on doctor assessment.'],
      benefitAr:['خدمة أقرب وأسرع للحالات البسيطة والمتوسطة.','متابعة مستمرة وملف صحي أوضح للمريض.','تخفيف الازدحام عن الطوارئ وإعطاء الأولوية للحالات الحرجة.'],
      benefitEn:['Closer and faster service for mild/moderate cases.','Continuous follow-up and clearer health record.','Reducing ED crowding and preserving priority for critical cases.'],
      medsAr:'المركز الصحي مناسب لتجديد أدوية الأمراض المزمنة المستقرة وأدوية الرعاية الأولية والمطاعيم حسب النظام والتوفر.',
      medsEn:'Health centers are suitable for stable chronic medication refills, primary care medicines, and vaccines based on regulations and availability.'
    },
    clinic: {
      icon:'🩺', titleAr:'العيادات المسائية / الخارجية', titleEn:'Evening / Outpatient Clinics', cls:'care-detail-clinic',
      quickAr:['مواعيد الاختصاص والمتابعة غير الطارئة.','مراجعة نتائج الفحوصات والتحويلات الطبية.','الأدوية التخصصية أو الحالات المزمنة التي تحتاج طبيب اختصاص.'],
      quickEn:['Specialist appointments and non-emergency follow-up.','Reviewing test results and medical referrals.','Specialized medications or chronic cases needing a specialist.'],
      benefitAr:['تقييم أدق من طبيب الاختصاص.','تنظيم المراجعة عبر موعد بدل الانتظار العشوائي.','متابعة طويلة المدى للحالات المزمنة أو المعقدة.'],
      benefitEn:['More specific assessment by a specialist.','Organized appointment instead of random waiting.','Long-term follow-up for chronic or complex cases.'],
      medsAr:'العيادات الخارجية مناسبة للأدوية التخصصية والمتابعة مع طبيب اختصاص أو الحالات التي تحتاج تحويلًا أو موافقة حسب النظام.',
      medsEn:'Outpatient clinics are suitable for specialized medications, specialist follow-up, referrals, or approvals based on regulations.'
    }
  }[type];
  if (!data) return;
  document.getElementById('care-detail-title').textContent = `${data.icon} ${T(data.titleAr, data.titleEn)}`;
  const list = arr => `<ul>${arr.map(x => `<li>${x}</li>`).join('')}</ul>`;
  document.getElementById('care-detail-content').innerHTML = `
    <div class="care-detail-head ${data.cls}"><div class="care-detail-icon">${data.icon}</div><h2>${T(data.titleAr, data.titleEn)}</h2></div>
    <div class="article-block"><h3>${T('متى أراجع هذه الجهة؟','When should I go there?')}</h3>${list(T(data.quickAr, data.quickEn))}</div>
    <div class="article-block"><h3>${T('ماذا تستفيد؟','What do you benefit?')}</h3>${list(T(data.benefitAr, data.benefitEn))}</div>
    <div class="article-block"><h3>${T('الأدوية والوصفات','Medications & Prescriptions')}</h3><p>${T(data.medsAr, data.medsEn)}</p></div>
    <div class="disc-box"><b>${T('تنبيه مهم','Important Notice')}</b>${T('هذا الدليل للتوعية والإرشاد فقط ولا يغني عن تقييم الطبيب. عند وجود أعراض شديدة أو مفاجئة، توجّه للطوارئ فورًا أو اتصل بـ 911.', 'This guide is for awareness only and does not replace medical evaluation. If symptoms are severe or sudden, go to emergency or call 911 immediately.')}</div>
    <a href="tel:911" class="btn btn-red">📞 ${T('اتصل بـ 911 عند الطوارئ','Call 911 in Emergencies')}</a>
    <button class="btn btn-outline" onclick="back()">← ${T('الرجوع إلى الصفحة السابقة','Back to Previous Page')}</button>
    <button class="btn btn-primary" onclick="home()">🏠 ${T('العودة إلى الصفحة الرئيسية','Return to Home')}</button>
  `;
  go('s-care-detail');
}

// ===== LIBRARY =====
let libCat = 'all';
function initLibrary() {
  const tabs = document.getElementById('lib-tabs');
  tabs.innerHTML = ART_CATS.map(c =>
    `<button class="tab-btn ${c.id === libCat ? 'active' : ''}" onclick="setLibCat('${c.id}')">${T(c.ar, c.en)}</button>`
  ).join('');

  const c = document.getElementById('lib-content');
  let h = `<div class="library-hero-card">
    <h2>${T('مكتبة التوعية الصحية', 'Health Awareness Library')}</h2>
    <p>${T('معلومات صحية مبسطة وموثوقة تساعدك على فهم الخدمات الصحية والتصرف بشكل أفضل عند الحاجة.', 'Simple trusted health information to help you understand services and act better when needed.')}</p>
  </div>`;

  h += `<div class="library-quick-grid">
    <button class="library-mini-card" onclick="go('s-dyk')"><span>💡</span><b>${T('هل تعلم؟', 'Did You Know?')}</b><small>${T('أرقام وحقائق رسمية مؤثرة', 'Official impactful facts')}</small></button>
    <button class="library-mini-card" onclick="go('s-directory')"><span>🗂️</span><b>${T('دليل المنشآت الصحية', 'Facility Directory')}</b><small>${T('روابط ومعلومات خدماتية', 'Service information and links')}</small></button>
    <button class="library-mini-card" onclick="go('s-evening')"><span>🌙</span><b>${T('الدوام المسائي', 'Evening Hours')}</b><small>${T('الخدمات المسائية حول البشير', 'Evening services around Al-Bashir')}</small></button>
  </div>`;

  const arts = libCat === 'all' ? ARTICLES : ARTICLES.filter(a => a.cat === libCat);
  arts.forEach(a => {
    const cat = ART_CATS.find(x => x.id === a.cat);
    h += `<div class="art-card new-art-card" onclick="showArticle(${a.id})">
      <div class="art-icon">${a.icon}</div>
      <div class="art-main">
        <div class="art-cat">${cat ? T(cat.ar, cat.en) : ''}</div>
        <div class="art-title">${T(a.titleAr, a.titleEn)}</div>
        <div class="art-sum">${T(a.sumAr, a.sumEn)}</div>
      </div>
      <span class="art-arrow">›</span>
    </div>`;
  });
  c.innerHTML = h;
}

function setLibCat(cat) { libCat = cat; initLibrary(); }

function showArticle(id) {
  const a = ARTICLES.find(x => x.id === id);
  if (!a) return;
  const cat = ART_CATS.find(x => x.id === a.cat);
  const quick = T(a.quickAr || [], a.quickEn || []);
  const qHtml = quick.length ? `<ul>${quick.map(x => `<li>${x}</li>`).join('')}</ul>` : '';
  document.getElementById('article-detail').innerHTML = `
    <div class="article-head">
      <div class="article-head-icon">${a.icon}</div>
      <h2>${T(a.titleAr, a.titleEn)}</h2>
      <span class="art-cat">${cat ? T(cat.ar, cat.en) : ''}</span>
      <p>${T(a.sumAr, a.sumEn)}</p>
    </div>
    <div class="article-block article-summary"><h3>${T('الخلاصة السريعة','Quick Summary')}</h3>${qHtml}</div>
    <div class="article-block"><h3>${T('التفاصيل','Details')}</h3><p>${T(a.detailsAr || '', a.detailsEn || '')}</p></div>
    <div class="article-block"><h3>${T('ماذا أفعل؟','What should I do?')}</h3><p>${T(a.actionAr || '', a.actionEn || '')}</p></div>
    <div class="article-block"><h3>${T('أين أتوجه؟','Where to go?')}</h3><p>${T(a.destAr || '', a.destEn || '')}</p>${a.destAr && a.destAr.includes('الطوارئ أم المركز الصحي') ? `<button class="btn btn-secondary btn-sm" onclick="go('s-er-vs-center')">🚦 ${T('الطوارئ أم المركز الصحي؟','Emergency or Health Center?')}</button>` : ''}</div>
    <div class="disc-box"><b>${T('تنبيه مهم','Important Notice')}</b>${T(a.warnAr || 'هذه المعلومات للتوعية فقط وليست بديلاً عن الطبيب.', a.warnEn || 'This information is for awareness only and not a substitute for a doctor.')}</div>
    <p class="article-review">${T('آخر مراجعة:', 'Last review:')} 2025</p>
    <button class="btn btn-outline" onclick="back()">← ${T('الرجوع إلى الصفحة السابقة','Back to Previous Page')}</button>
    <button class="btn btn-primary" onclick="home()">🏠 ${T('العودة إلى الصفحة الرئيسية','Return to Home')}</button>
  `;
  go('s-article');
}

// ===== DID YOU KNOW =====
function initDYK() {
  const stats = [
    { stat:'~2M', titleAr:'مراجعات سنوية ضخمة', titleEn:'Huge Annual Visits', ar:'مستشفيات البشير تستقبل سنويًا حوالي 1.5 إلى 2 مليون مراجع.', en:'Al-Bashir hospitals receive approximately 1.5–2 million visitors annually.', meaningAr:'هذا يوضح حجم الضغط على منظومة الخدمة.', meaningEn:'This shows the pressure on the service system.' },
    { stat:'~650K', titleAr:'ضغط كبير على الطوارئ سنويًا', titleEn:'Major ED Pressure Annually', ar:'قسم الإسعاف والطوارئ يستقبل سنويًا حوالي 600–650 ألف مراجع.', en:'The emergency department receives approximately 600–650 thousand visitors annually.', meaningAr:'اختيار الجهة الصحيحة يساعد الطوارئ على خدمة الحالات الأخطر.', meaningEn:'Choosing the right destination helps the ED serve critical cases.' },
    { stat:'~3000', titleAr:'مراجعون يوميًا', titleEn:'Daily Visitors', ar:'طوارئ البشير تستقبل نحو 3000 مراجع يوميًا.', en:'Al-Bashir emergency receives approximately 3,000 visitors daily.', meaningAr:'الحالة البسيطة قد تنتظر أطول لأن الأولوية للحالات الحرجة.', meaningEn:'Mild cases may wait longer because priority goes to critical cases.' },
    { stat:'~65%', titleAr:'كثير من الحالات قد لا تحتاج طوارئ', titleEn:'Many Cases May Not Need ED', ar:'حوالي 65% من الحالات تُصنف ضمن الحالات البسيطة التي يمكن التعامل معها في المراكز الصحية.', en:'Approximately 65% of cases are classified as simple cases handleable at health centers.', meaningAr:'المركز الصحي قد يكون أسرع وأنسب لكثير من المراجعين.', meaningEn:'Health centers may be faster and more suitable for many visitors.' },
    { stat:'70–75%', titleAr:'حالات أقل استعجالًا', titleEn:'Less Urgent Cases', ar:'حوالي 70–75% من الحالات قد تكون من المستوى الرابع والخامس (غير عاجلة).', en:'Approximately 70–75% of cases may be at triage level 4 or 5 (non-urgent).', meaningAr:'الفرز الطبي لا يعتمد على وقت الوصول فقط بل على الخطورة.', meaningEn:'Triage depends on severity, not only arrival time.' },
    { stat:'~250', titleAr:'إدخالات يومية من الطوارئ', titleEn:'Daily Admissions from ED', ar:'حوالي 250 حالة إدخال يوميًا تأتي من الطوارئ.', en:'Approximately 250 admission cases daily come from emergency.', meaningAr:'هذا يوضح أن الطوارئ تتعامل مع حالات تحتاج موارد كبيرة.', meaningEn:'This shows ED handles cases requiring major resources.' }
  ];
  let h = `<div class="dyk-hero"><h2>${T('هل تعلم؟ أرقام تكشف حجم الضغط', 'Did You Know? Numbers Reveal the Pressure')}</h2><p>${T('هذه الأرقام توضّح لماذا يساعد اختيار الجهة الصحية المناسبة في تحسين وصول الخدمة لمن يحتاجها فعلاً.', 'These numbers show why choosing the right destination helps service reach those who truly need it.')}</p></div>`;
  stats.forEach(s => {
    h += `<div class="dyk-impact-card"><div class="dyk-stat">${s.stat}</div><div class="dyk-body"><h3>${T(s.titleAr, s.titleEn)}</h3><p>${T(s.ar, s.en)}</p><div class="dyk-meaning"><b>${T('ماذا يعني لك؟','What does this mean for you?')}</b><span>${T(s.meaningAr, s.meaningEn)}</span></div></div></div>`;
  });
  h += `<div class="disc-box"><b>${T('ملاحظة توثيقية','Documentation Note')}</b>${T('تُعرض الأرقام في التطبيق فقط عند اعتمادها من مصادر موثوقة أو رسمية ضمن بيانات المشروع.', 'Numbers are displayed only when adopted from trusted or official sources within the project data.')}</div>`;
  h += `<button class="btn btn-outline" onclick="back()">← ${T('الرجوع إلى الصفحة السابقة','Back to Previous Page')}</button><button class="btn btn-primary" onclick="home()">🏠 ${T('العودة إلى الصفحة الرئيسية','Return to Home')}</button>`;
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


// ===== EXTERNAL CONNECTIONS: GOOGLE ANALYTICS + GOOGLE SHEETS =====
// بعد إنشاء Google Apps Script، ضعي رابط Web App بين علامتي التنصيص هنا.
// مثال: const SHG_APPS_SCRIPT_URL = "https://script.google.com/macros/s/XXXX/exec";
const SHG_APPS_SCRIPT_URL = "";

function shgTrack(eventName, params = {}) {
  try {
    if (typeof gtag === "function") {
      gtag("event", eventName, params);
    }
  } catch (e) {}
}

async function sendToGoogleSheet(payload) {
  const fullPayload = {
    app: "Smart Health Guide",
    source: "web_app_internal",
    page: document.querySelector('.screen.active')?.id || "unknown",
    language: S.lang || "ar",
    createdAt: new Date().toISOString(),
    ...payload
  };

  // نسخة احتياطية داخل المتصفح في حال لم يتم تركيب رابط Apps Script بعد.
  const outbox = JSON.parse(localStorage.getItem("shg_pending_submissions") || "[]");

  if (!SHG_APPS_SCRIPT_URL) {
    outbox.push({ ...fullPayload, syncStatus: "pending_no_apps_script_url" });
    localStorage.setItem("shg_pending_submissions", JSON.stringify(outbox));
    return { ok: false, localOnly: true };
  }

  try {
    // no-cors يمنع قراءة الرد، لكنه يسمح بالإرسال إلى Apps Script من موقع Netlify.
    await fetch(SHG_APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(fullPayload)
    });
    return { ok: true };
  } catch (error) {
    outbox.push({ ...fullPayload, syncStatus: "failed", error: String(error) });
    localStorage.setItem("shg_pending_submissions", JSON.stringify(outbox));
    return { ok: false, error };
  }
}

// ===== CONTACT =====
function showContactPanel(panel) {
  shgTrack('contact_tab_select', { tab: panel === 'thanks' ? 'thanks_suggestion' : 'technical_report' });
  document.getElementById('tab-tech')?.classList.toggle('active', panel === 'tech');
  document.getElementById('tab-thanks')?.classList.toggle('active', panel === 'thanks');
  document.getElementById('panel-tech')?.classList.toggle('active', panel === 'tech');
  document.getElementById('panel-thanks')?.classList.toggle('active', panel === 'thanks');
  const success = document.getElementById('ct-success');
  if (success) success.style.display = 'none';
  applyText();
}

function submitContact(mode = 'tech') {
  let report;
  if (mode === 'thanks') {
    const msg = document.getElementById('th-msg').value.trim();
    const name = document.getElementById('th-name').value.trim();
    const phone = document.getElementById('th-phone').value.trim();
    if (!msg || !name || !phone) {
      alert(T('يرجى كتابة الرسالة والاسم ورقم الهاتف', 'Please write the message, name, and phone number'));
      return;
    }
    report = {
      id: Date.now(),
      recordType: 'contact_message',
      category: 'thanks_suggestion',
      messageType: document.getElementById('th-type').value,
      msg,
      name,
      phone,
      email: document.getElementById('th-email').value.trim(),
      area: document.getElementById('th-area').value.trim(),
      date: new Date().toISOString(),
      status: 'جديد'
    };
    ['th-msg','th-name','th-phone','th-email','th-area'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  } else {
    const type = document.getElementById('ct-type').value;
    const msg  = document.getElementById('ct-msg').value.trim();
    if (!type || !msg) {
      alert(T('يرجى اختيار النوع وكتابة رسالتك', 'Please select type and write your message'));
      return;
    }
    report = {
      id: Date.now(),
      recordType: 'contact_message',
      category: 'technical_report',
      messageType: type,
      msg,
      name: document.getElementById('ct-name').value.trim(),
      phone: document.getElementById('ct-phone').value.trim(),
      date: new Date().toISOString(),
      status: 'جديد'
    };
    ['ct-type','ct-msg','ct-name','ct-phone'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  }

  S.reports.push(report);
  localStorage.setItem('shg_reports', JSON.stringify(S.reports));
  S.notifs.push({ id: Date.now() + 1, type: 'new_report', titleAr: mode === 'thanks' ? 'رسالة شكر / اقتراح جديدة' : 'بلاغ تقني جديد', read: false, date: new Date().toISOString() });
  localStorage.setItem('shg_notifs', JSON.stringify(S.notifs));

  shgTrack('contact_submit', { contact_type: report.category, message_type: report.messageType });
  sendToGoogleSheet(report);

  const success = document.getElementById('ct-success');
  if (success) success.style.display = 'block';
  alert(T('تم استلام رسالتك بنجاح من داخل التطبيق. شكرًا لمساهمتك.', 'Your message has been submitted inside the app. Thank you.'));
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
      : S.reports.slice().reverse().map(r => `<div class="info-card" style="margin-bottom:8px"><b>${r.type}</b><p>${r.msg}</p>${r.name ? `<p style="font-size:13px;color:var(--gray-600)">${r.name}${r.phone ? " · "+r.phone : ""}</p>` : ''}<p style="font-size:11px;color:var(--gray-400)">${new Date(r.date).toLocaleDateString()}</p></div>`).join('');
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

  const ratingValue = type === 'happy' ? 'راضي' : 'غير راضي';

  // تسجيل التقييم في Google Analytics كرقم/حدث فقط.
  shgTrack('rating_click', { rating: ratingValue });

  // حفظ نسخة محلية داخل التطبيق.
  const savedRatings = JSON.parse(localStorage.getItem('shg_ratings') || '[]');
  const ratingRecord = {
    id: Date.now(),
    recordType: 'app_rating',
    rating: ratingValue,
    date: new Date().toISOString()
  };
  savedRatings.push(ratingRecord);
  localStorage.setItem('shg_ratings', JSON.stringify(savedRatings));

  // إرسال التقييم إلى Google Sheet بعد تركيب رابط Apps Script.
  sendToGoogleSheet(ratingRecord);

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
