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


// ===== COMPREHENSIVE MEDICAL JOURNAL — separate from awareness library =====
const MEDICAL_TOPICS = {
  cast: {
    icon:'🦴', titleAr:'الاستفسار عن الكسور / الجبيرة القديمة', titleEn:'Fractures / Old Cast Inquiry',
    introAr:'معلومات إرشادية حول الجبيرة القديمة، إعادة التقييم، ومتى تكون الحالة طارئة.',
    sections:[
      {h:'تعريف ووظيفة هذا القسم', p:'يساعد هذا القسم المراجع على فهم متى يحتاج مراجعة مركز صحي أو عيادة عظام بسبب جبيرة قديمة أو ألم بعد كسر سابق.'},
      {h:'متى تراجع المركز الصحي أو عيادة العظام؟', p:'عند الحاجة إلى تقييم الجبيرة، ألم مستقر بعد كسر قديم، أو استفسار عن موعد إزالة الجبيرة أو المتابعة.'},
      {h:'متى لا تنتظر؟', p:'إذا ظهر ألم شديد، تورم واضح، خدر، ازرقاق في الأصابع، برودة شديدة في الطرف، أو ضعف حركة مفاجئ، راجع الطوارئ فورًا.'}
    ], dest:'المركز الصحي أو عيادة العظام للحالات المستقرة، والطوارئ عند علامات الخطر.'
  },
  dressing: {
    icon:'🩹', titleAr:'العناية بالجروح / الغيار بعد العمليات السابقة', titleEn:'Wound Care / Post-op Dressing',
    introAr:'إرشادات عامة حول غيار الجروح ومتابعة الجروح بعد العمليات السابقة.',
    sections:[
      {h:'تعريف ووظيفة هذا القسم', p:'يوضح أين تتم غيارات الجروح ومتابعة الجروح بعد العمليات عند عدم وجود علامات خطورة.'},
      {h:'مكان الإجراء والمتابعة', p:'غالبًا تتم غيارات الجروح في المركز الصحي أو عيادة الغيار أو العيادة التي تتابع الحالة، وليس في الطوارئ للحالات الروتينية.'},
      {h:'متى تحتاج الطوارئ؟', p:'نزيف شديد، خروج قيح مع حرارة، ألم شديد متزايد، فتح الجرح بعد العملية، أو احمرار وتورم سريع حول الجرح.'}
    ], dest:'المركز الصحي/عيادة الغيار للحالات المستقرة، والطوارئ عند النزيف أو علامات الالتهاب الشديد.'
  },
  report: {
    icon:'📄', titleAr:'التقارير الطبية', titleEn:'Medical Reports',
    introAr:'توضيح عام حول طلب التقارير الطبية غير القضائية والجهة المناسبة لذلك.',
    sections:[
      {h:'تعريف ووظيفة هذا القسم', p:'التقارير الطبية تُطلب عادة من الطبيب المعالج أو العيادة المختصة التي تابعت الحالة.'},
      {h:'أين أراجع؟', p:'راجع المركز الصحي أو العيادة المختصة أو قسم السجل الطبي حسب النظام المعمول به في المنشأة.'},
      {h:'تنبيه مهم', p:'أقسام الطوارئ ليست مخصصة لإصدار التقارير الروتينية غير العاجلة.'}
    ], dest:'العيادة المعالجة أو السجل الطبي حسب نوع التقرير.'
  },
  vaccination: {
    icon:'💉', titleAr:'المطاعيم الطبية', titleEn:'Vaccinations',
    introAr:'إرشادات عامة حول متابعة المطاعيم ومكان الحصول عليها.',
    sections:[
      {h:'تعريف ووظيفة هذا القسم', p:'المطاعيم الوقائية والمتابعة الروتينية تكون غالبًا ضمن برامج المراكز الصحية أو عيادات المطاعيم.'},
      {h:'أين أراجع؟', p:'راجع أقرب مركز صحي حسب منطقة السكن وأوقات الدوام، مع إحضار كرت المطاعيم إن وجد.'},
      {h:'متى تصبح الحالة طارئة؟', p:'عند حدوث حساسية شديدة، ضيق نفس، تورم شديد في الوجه أو الحلق، أو تدهور سريع بعد المطعوم.'}
    ], dest:'المراكز الصحية وعيادات المطاعيم، والطوارئ عند أعراض حساسية شديدة.'
  },
  prescription: {
    icon:'💊', titleAr:'تجديد الوصفات الطبية / الأدوية المزمنة', titleEn:'Prescription Refills / Chronic Medications',
    introAr:'توضيح أين تُجدد الوصفات والأدوية المزمنة المستقرة.',
    sections:[
      {h:'تعريف ووظيفة هذا القسم', p:'تجديد أدوية الأمراض المزمنة المستقرة يكون عادة عبر المركز الصحي أو العيادات الخارجية حسب نوع العلاج والمتابعة.'},
      {h:'ما الذي أحضره؟', p:'أحضر الوصفة القديمة، اسم الدواء أو صورته، بطاقة الأمراض المزمنة إن وجدت، وأي تقارير حديثة.'},
      {h:'تنبيه مهم', p:'الطوارئ ليست المكان المناسب لتجديد العلاج الشهري، لكنها ضرورية إذا ظهرت أعراض خطيرة أو تدهور مفاجئ.'}
    ], dest:'المركز الصحي للحالات المستقرة، والعيادات الخارجية للأدوية التخصصية.'
  },
  tests: {
    icon:'🔬', titleAr:'الفحوصات المخبرية الشاملة ونتائجها', titleEn:'Laboratory Tests and Results',
    introAr:'تعرف على دور الفحوصات، أين تُجرى، وكيفية متابعة النتائج إلكترونيًا عند توفر الخدمة.',
    sections:[
      {h:'تعريف ووظيفة هذا القسم', p:'تساعد الفحوصات المخبرية الطبيب على تقييم الحالة الصحية، متابعة الأمراض المزمنة، أو طلب فحوصات دورية حسب الحاجة الطبية.'},
      {h:'مكان الإجراء والمتابعة', p:'تُجرى الفحوصات الروتينية عادة في المراكز الصحية أو العيادات حسب توجيه الطبيب، بينما تُخصص فحوصات الطوارئ للحالات العاجلة والحرجة فقط.'},
      {h:'تنبيه مهم للمراجع', p:'أقسام الطوارئ لا تقوم عادة بإجراء الفحوصات الروتينية أو تسليم نتائجها؛ فهي مخصصة للحالات الحرجة والتحاليل الإسعافية العاجلة.'}
    ], dest:'المراكز الصحية أو العيادات للفحوصات الروتينية، والطوارئ للفحوصات الإسعافية العاجلة.',
    links:true
  },
  referral: {
    icon:'🏨', titleAr:'التحويلات الطبية / عيادات الاختصاص', titleEn:'Referrals / Specialist Clinics',
    introAr:'إرشادات عامة حول التحويلات الطبية والمواعيد مع عيادات الاختصاص.',
    sections:[
      {h:'تعريف ووظيفة هذا القسم', p:'التحويل الطبي يساعد على توجيه المراجع إلى عيادة اختصاص عند الحاجة لتقييم تخصصي.'},
      {h:'أين أبدأ؟', p:'غالبًا يبدأ المراجع من المركز الصحي أو الطبيب المعالج، ثم يتم التحويل حسب الحاجة الطبية والنظام المعمول به.'},
      {h:'متى لا أنتظر الموعد؟', p:'إذا ظهرت أعراض شديدة أو مفاجئة مثل ألم صدر، ضيق نفس، فقدان وعي، نزيف شديد أو علامات جلطة، يجب مراجعة الطوارئ فورًا.'}
    ], dest:'المركز الصحي أو الطبيب المعالج لبدء التحويل، والطوارئ للحالات الخطيرة.'
  },
  sicklv: {
    icon:'📝', titleAr:'الإجازات المرضية واعتمادها', titleEn:'Sick Leave and Approval',
    introAr:'توضيح عام حول الإجازات المرضية ومن يقررها.',
    sections:[
      {h:'تعريف ووظيفة هذا القسم', p:'الإجازة المرضية قرار طبي وإداري يرتبط بتقييم الطبيب المعالج والتعليمات المعتمدة.'},
      {h:'أين أراجع؟', p:'راجع الطبيب المعالج أو العيادة المناسبة حسب حالتك، ولا تراجع الطوارئ فقط للحصول على إجازة.'},
      {h:'تنبيه مهم', p:'هذا التطبيق لا يمنح ولا يضمن الإجازات المرضية.'}
    ], dest:'الطبيب المعالج أو العيادة المناسبة حسب الحالة.'
  }
};

function initMedicalJournal() {
  const c = document.getElementById('medical-journal-grid');
  if (!c) return;
  const order = ['vaccination','referral','sicklv','report','tests','prescription','cast','dressing'];
  c.innerHTML = order.map(id => {
    const t = MEDICAL_TOPICS[id];
    return `<button class="med-topic-card" onclick="showMedicalTopic('${id}')"><span class="med-topic-icon">${t.icon}</span><span>${T(t.titleAr, t.titleEn)}</span><small>${T('اعرف المزيد', 'Learn more')}</small></button>`;
  }).join('');
}

function showMedicalTopic(id) {
  const t = MEDICAL_TOPICS[id];
  if (!t) return;
  let h = `<div class="medical-topic-page"><div class="medical-topic-head"><div class="medical-topic-icon-big">${t.icon}</div><h2>${T(t.titleAr, t.titleEn)}</h2><p>${T(t.introAr, t.titleEn)}</p></div>`;
  h += `<div class="nav-actions top-nav-actions"><button class="btn btn-outline" onclick="back()">← ${T('الرجوع إلى الصفحة السابقة','Back to previous page')}</button><button class="btn btn-primary" onclick="home()">🏠 ${T('العودة إلى الصفحة الرئيسية','Return to home')}</button></div>`;
  t.sections.forEach(sec => { h += `<div class="info-card glow-card"><b>${sec.h}</b><p>${sec.p}</p></div>`; });
  if (t.links) {
    h += `<div class="info-card official-links-card"><b>🔗 ${T('متابعة النتائج إلكترونيًا','Follow results electronically')}</b><p>${T('عند توفر الخدمة، يمكن متابعة بعض النتائج والمعلومات عبر بوابة أو تطبيق حكيمي حسب المنشأة الصحية.','When available, some results and information can be followed through Hakeem/My Hakeem depending on the facility.')}</p><div class="link-btn-row"><a class="btn btn-primary" target="_blank" href="https://my.hakeem.jo/">بوابة حكيمي الإلكترونية</a><a class="btn btn-primary" target="_blank" href="https://my.hakeem.jo/">تطبيق My Hakeem</a><button class="btn btn-outline" onclick="showHakeemInstructions()">تعليمات التسجيل</button></div><div id="hakeem-instructions" class="hakeem-help" style="display:none"><b>تعليمات التسجيل:</b><p>قد تحتاج زيارة قسم السجل الطبي مرة واحدة للحصول على رمز التسجيل، ثم إنشاء الحساب عبر بوابة حكيمي أو تطبيق My Hakeem.</p></div></div>`;
  }
  h += `<div class="info-card"><b>📍 ${T('أين أتوجه؟','Where to go?')}</b><p>${t.dest}</p></div>`;
  h += `<div class="disc-box"><b>⚠️ ${T('تنويه','Notice')}</b>${T('هذه المعلومات للتوعية فقط ولا تغني عن تقييم الطبيب.','This information is for awareness only and is not a substitute for medical assessment.')}</div>`;
  h += `<div class="nav-actions"><button class="btn btn-outline" onclick="back()">← ${T('الرجوع إلى الصفحة السابقة','Back to previous page')}</button><button class="btn btn-primary" onclick="home()">🏠 ${T('العودة إلى الصفحة الرئيسية','Return to home')}</button></div></div>`;
  document.getElementById('medical-topic-detail').innerHTML = h;
  go('s-medical-topic');
}

function showHakeemInstructions(){
  const el = document.getElementById('hakeem-instructions');
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function serviceTopicButton(){
  if (!S.svcType || !MEDICAL_TOPICS[S.svcType]) return '';
  const t = MEDICAL_TOPICS[S.svcType];
  return `<button class="btn btn-primary" style="margin-top:10px" onclick="showMedicalTopic('${S.svcType}')">📚 ${T('اعرف المزيد عن','Learn more about')} ${T(t.titleAr, t.titleEn)}</button>`;
}

// ===== NAVIGATION =====
function go(screenId) {
  const cur = document.querySelector('.screen.active');
  if (cur && cur.id !== screenId) S.history.push(cur.id);
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) { target.classList.add('active'); window.scrollTo(0, 0); }
  document.body.classList.toggle('hide-watermarks', screenId === 's-supervision');
  applyText();
  initScreen(screenId);
}

function back() {
  if (S.history.length > 0) {
    const prev = S.history.pop();
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const t = document.getElementById(prev);
    if (t) { t.classList.add('active'); window.scrollTo(0, 0); }
    document.body.classList.toggle('hide-watermarks', prev === 's-supervision');
    applyText();
    initScreen(prev);
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
    's-medical-journal': initMedicalJournal,
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
  // Facebook button
  const fbHome  = document.getElementById('fb-home-btn');
  const fbAbout = document.getElementById('fb-about-btn');
  const url    = S.settings.fb_url;
  const active = S.settings.fb_active;
  const fbHTML = active && url
    ? `<a href="${url}" target="_blank" class="btn btn-facebook">📘 <span data-ar="صفحة الفيسبوك الرسمية" data-en="Official Facebook Page"></span></a>`
    : '';
  // Facebook shown in home menu as a home-btn, not on About page
  if (fbHome) {
    if (active && url) {
      fbHome.innerHTML = `<a href="${url}" target="_blank" class="home-btn home-btn-outline" style="text-decoration:none">
        <span class="home-btn-icon">📘</span>
        <span class="home-btn-text" data-ar="تابعونا على صفحتنا الرسمية لمستشفى الإسعاف والطوارئ / البشير" data-en="Follow Our Official Facebook Page"></span>
        <span class="home-btn-arrow">›</span>
      </a>`;
    } else {
      fbHome.innerHTML = '';
    }
  }
  // Facebook button intentionally removed from About page per design
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
    h += `<div class="info-card"><b>💡 ${T('إرشاد الخدمة', 'Service Guidance')}</b><p>${T(NE_MSGS[S.svcType].ar, NE_MSGS[S.svcType].en)}</p>${serviceTopicButton()}</div>`;
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

// ===== LIBRARY =====
let libCat = 'all';
function initLibrary() {
  const tabs = document.getElementById('lib-tabs');
  const libraryCats = [
    { id:'all', ar:'الكل', en:'All' },
    { id:'awareness', ar:'التوعية العامة', en:'Awareness' },
    { id:'tips', ar:'نصائح قبل المراجعة', en:'Before Visit Tips' },
    { id:'medsafety', ar:'السلامة الدوائية', en:'Medication Safety' },
    { id:'info', ar:'الخدمات والمعلومات', en:'Services & Information' }
  ];
  tabs.innerHTML = libraryCats.map(c => `<button class="tab-btn ${c.id === libCat ? 'active' : ''}" onclick="setLibCat('${c.id}')">${T(c.ar, c.en)}</button>`).join('');

  const cards = [
    {cat:'info', icon:'🗂️', titleAr:'دليل المنشآت الصحية', titleEn:'Healthcare Facility Directory', sumAr:'استعرض المنشآت والروابط المتاحة.', sumEn:'Browse available facilities and links.', action:"go('s-directory')"},
    {cat:'info', icon:'🌙', titleAr:'الدوام المسائي حول مستشفى البشير', titleEn:'Evening Hours Around Al-Bashir', sumAr:'معلومات عن المراكز ذات الدوام المسائي.', sumEn:'Information about evening-hour centers.', action:"go('s-evening')"},
    {cat:'awareness', icon:'💡', titleAr:'هل تعلم؟', titleEn:'Did You Know?', sumAr:'أرقام وحقائق رسمية لفهم الضغط على الخدمات الصحية.', sumEn:'Numbers and facts about healthcare service pressure.', action:"go('s-dyk')"},
    {cat:'awareness', icon:'💙', titleAr:'قرارك قد ينقذ غيرك', titleEn:'Your decision may save someone else', sumAr:'اختيار الجهة المناسبة يساعد الحالات الحرجة.', sumEn:'Choosing the right destination helps critical cases.', action:"showArticle(5)"},
    {cat:'tips', icon:'🩺', titleAr:'كيف تستفيد من زيارتك للطبيب؟', titleEn:'How to benefit from your doctor visit?', sumAr:'حضّر أعراضك وأدويتك وأسئلتك قبل الزيارة.', sumEn:'Prepare your symptoms, medicines and questions.', custom:'doctorVisit'},
    {cat:'tips', icon:'📋', titleAr:'قبل الذهاب إلى أي منشأة صحية', titleEn:'Before visiting any health facility', sumAr:'ما الذي يجب إحضاره قبل المراجعة؟', sumEn:'What should you bring before your visit?', custom:'beforeVisit'},
    {cat:'awareness', icon:'⏱️', titleAr:'متى لا تنتظر؟', titleEn:'When not to wait?', sumAr:'أعراض شديدة أو مفاجئة لا يجوز تأجيلها.', sumEn:'Severe or sudden symptoms should not be delayed.', custom:'dontWait'},
    {cat:'medsafety', icon:'💊', titleAr:'الاستخدام الصحيح للأدوية', titleEn:'Correct medication use', sumAr:'لا تستخدم أو توقف أو تكرر الدواء دون استشارة.', sumEn:'Do not use, stop or repeat medicine without advice.', custom:'medSafety'}
  ];
  const c = document.getElementById('lib-content');
  const shown = libCat === 'all' ? cards : cards.filter(x => x.cat === libCat);
  c.innerHTML = `<div class="library-hero"><h2>${T('مكتبة التوعية الصحية','Health Education Library')}</h2><p>${T('معلومات صحية مبسطة وموثوقة تساعدك على التصرف بشكل أفضل عند الحاجة.','Simple reliable health information to help you act better when needed.')}</p></div>` +
    shown.map(card => `<button class="library-new-card" onclick="${card.custom ? `showLibraryCustom('${card.custom}')` : card.action}"><span class="library-new-icon">${card.icon}</span><span><b>${T(card.titleAr, card.titleEn)}</b><small>${T(card.sumAr, card.sumEn)}</small></span><em>${T('اقرأ المزيد','Read more')} ›</em></button>`).join('');
}


function showLibraryCustom(type) {
  const data = {
    doctorVisit: {icon:'🩺', title:'كيف تستفيد من زيارتك للطبيب؟', quick:['اكتب أعراضك قبل الزيارة.','أحضر قائمة الأدوية والحساسيات.','اسأل عن علامات الخطر ومتى تراجع.'], details:['متى بدأت الأعراض؟ هل تتحسن أم تزداد؟','ما الأدوية التي تستخدمها حاليًا؟','هل لديك أمراض مزمنة أو تقارير سابقة؟']},
    beforeVisit: {icon:'📋', title:'قبل الذهاب إلى أي منشأة صحية', quick:['أحضر الهوية أو دفتر التأمين إن وجد.','أحضر الوصفات والتقارير السابقة.','للأطفال: أحضر كرت المطاعيم عند الحاجة.'], details:['اكتب أسماء الأدوية أو صوّرها.','اذكر الحمل أو العمليات السابقة أو الحساسية.','كلما كانت معلوماتك أوضح كان تقييمك أسرع.']},
    dontWait: {icon:'⏱️', title:'متى لا تنتظر؟', quick:['ألم صدر شديد أو مفاجئ.','ضيق نفس شديد أو فقدان وعي.','نزيف شديد أو ضعف مفاجئ بجهة من الجسم.'], details:['في هذه الحالات اتصل بـ 911 أو توجه للطوارئ فورًا.','لا تنتظر موعدًا عاديًا إذا كانت الأعراض شديدة أو مفاجئة.']},
    medSafety: {icon:'💊', title:'الاستخدام الصحيح للأدوية', quick:['لا تستخدم مضادًا حيويًا دون وصفة.','لا توقف علاج الضغط أو السكري دون طبيب.','لا تكرر صرف الدواء من أكثر من جهة دون داعٍ.'], details:['اسأل الطبيب أو الصيدلي إذا لم تفهم طريقة الاستخدام.','لا تستخدم دواء شخص آخر حتى لو تشابهت الأعراض.','لا تحتفظ بكميات كبيرة من الأدوية في المنزل.']}
  }[type];
  if (!data) return;
  document.getElementById('article-detail').innerHTML = `<div class="article-modern"><div class="article-head"><div class="article-icon-big">${data.icon}</div><h2>${data.title}</h2><span>${T('التوعية الصحية','Health awareness')}</span></div><div class="info-card glow-card"><b>${T('الخلاصة السريعة','Quick summary')}</b><ul>${data.quick.map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="info-card"><b>${T('التفاصيل','Details')}</b><ul>${data.details.map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="disc-box"><b>⚠️ ${T('تنبيه مهم','Important notice')}</b>${T('هذه المعلومات للتوعية فقط ولا تغني عن تقييم الطبيب.','This information is for awareness only and is not a substitute for medical assessment.')}</div><div class="nav-actions"><button class="btn btn-outline" onclick="back()">← ${T('الرجوع إلى الصفحة السابقة','Back to previous page')}</button><button class="btn btn-primary" onclick="home()">🏠 ${T('العودة إلى الصفحة الرئيسية','Return to home')}</button></div></div>`;
  go('s-article');
}

function setLibCat(cat) { libCat = cat; initLibrary(); }

function showArticle(id) {
  const a = ARTICLES.find(x => x.id === id);
  if (!a) return;
  const cat = ART_CATS.find(x => x.id === a.cat);
  document.getElementById('article-detail').innerHTML = `
    <div class="article-modern">
      <div class="article-head"><div class="article-icon-big">${a.icon}</div><h2>${T(a.titleAr, a.titleEn)}</h2><span>${cat ? T(cat.ar, cat.en) : ''}</span></div>
      <div class="info-card glow-card"><b>${T('الخلاصة السريعة', 'Quick summary')}</b><p>${T(a.sumAr, a.sumEn)}</p></div>
      <div class="info-card"><b>${T('التفاصيل', 'Details')}</b><div class="art-body">${T(a.bodyAr, a.bodyEn)}</div></div>
      <div class="info-card card-red"><b>⚠️ ${T('تنبيه مهم', 'Important Warning')}</b><p>${T(a.warnAr, a.warnEn)}</p></div>
      <div class="info-card"><b>📍 ${T('أين تتوجه؟', 'Where to Go?')}</b><p>${T(a.destAr, a.destEn)}</p></div>
      <div class="disc-box"><b>${T('⚠️ إخلاء مسؤولية', '⚠️ Disclaimer')}</b>${T('هذه المعلومات للتوعية فقط وليست بديلًا عن الطبيب.', 'This information is for awareness only and is not a substitute for a doctor.')}</div>
      <p style="text-align:center;font-size:12px;color:var(--gray-400);margin-top:8px">${T('آخر مراجعة:', 'Last review:')} 2025</p>
      ${a.cat === 'emergency' ? `<a href="tel:911" class="btn btn-red" style="margin-top:12px">📞 ${T('اتصل بـ 911 في الطوارئ', 'Call 911 in Emergencies')}</a>` : ''}
      <div class="nav-actions"><button class="btn btn-outline" onclick="back()">← ${T('الرجوع إلى الصفحة السابقة','Back to previous page')}</button><button class="btn btn-primary" onclick="home()">🏠 ${T('العودة إلى الصفحة الرئيسية','Return to home')}</button></div>
    </div>`;
  go('s-article');
}


// ===== DID YOU KNOW =====
function initDYK() {
  const stats = [
    { stat:'~2M', title:'ملايين المراجعات سنويًا', text:'مستشفيات البشير تستقبل سنويًا حوالي 1.5 إلى 2 مليون مراجع.', meaning:'اختيار الجهة المناسبة يساعد على تخفيف الضغط وتحسين الوصول للخدمة.' },
    { stat:'~650K', title:'ضغط كبير على الطوارئ سنويًا', text:'قسم الإسعاف والطوارئ يستقبل سنويًا حوالي 600–650 ألف مراجع.', meaning:'الحالات غير الطارئة قد تنتظر أطول لأن الأولوية للأخطر.' },
    { stat:'~3000', title:'ضغط يومي على طوارئ البشير', text:'طوارئ البشير تستقبل نحو 3000 مراجع يوميًا.', meaning:'إذا كانت حالتك بسيطة، فقد يكون المركز الصحي أسرع وأنسب.' },
    { stat:'~65%', title:'كثير من الحالات بسيطة', text:'حوالي 65% من الحالات تُصنف ضمن الحالات البسيطة التي يمكن التعامل معها في المراكز الصحية.', meaning:'المركز الصحي ليس خيارًا ثانويًا دائمًا؛ قد يكون هو الأنسب.' },
    { stat:'70–75%', title:'ليست كل الحالات طارئة', text:'حوالي 70–75% من الحالات قد تكون من المستوى الرابع والخامس غير عاجلة.', meaning:'الفرز يعطي الأولوية للحالات الحرجة، لذلك الانتظار للحالات البسيطة متوقع.' },
    { stat:'~250', title:'إدخالات يومية من الطوارئ', text:'حوالي 250 حالة إدخال يوميًا تأتي من الطوارئ.', meaning:'موارد الطوارئ يجب أن تبقى متاحة للحالات التي تحتاج إدخالًا أو تدخلًا عاجلًا.' }
  ];
  let h = `<div class="dyk-hero"><h2>${T('هل تعلم؟ أرقام تكشف حجم الضغط على الخدمات الصحية','Did you know? Numbers that reveal healthcare pressure')}</h2><p>${T('هذه الأرقام توضّح لماذا يساعد اختيار الجهة الصحية المناسبة في تقليل الازدحام وتحسين وصول الخدمة لمن يحتاجها فعلًا.','These numbers explain why choosing the right healthcare destination reduces crowding and helps those who truly need urgent care.')}</p></div>`;
  stats.forEach(s => { h += `<div class="dyk-impact-card"><div class="dyk-big">${s.stat}</div><div><h3>${s.title}</h3><p>${s.text}</p><b>${T('ماذا يعني لك؟','What does it mean for you?')}</b><p>${s.meaning}</p></div></div>`; });
  h += `<div class="disc-box">${T('تُستخدم الأرقام للتوعية وفهم حجم الضغط على الخدمات، ويجب تحديثها عند توفر مصادر رسمية أحدث.','Numbers are used for awareness and should be updated when newer official sources are available.')}</div>`;
  h += `<div class="nav-actions"><button class="btn btn-outline" onclick="back()">← ${T('الرجوع إلى الصفحة السابقة','Back to previous page')}</button><button class="btn btn-primary" onclick="home()">🏠 ${T('العودة إلى الصفحة الرئيسية','Return to home')}</button></div>`;
  document.getElementById('dyk-content').innerHTML = h;
}



function showErVsCenterDetail(type) {
  const box = document.getElementById('er-vs-detail');
  const data = {
    emergency: {title:'🚨 الطوارئ', cls:'er-detail-emergency', sections:[
      ['متى أذهب إلى الطوارئ؟','عند وجود ألم صدر شديد، ضيق نفس شديد، فقدان وعي، نزيف شديد، أعراض جلطة، حادث أو إصابة قوية، حروق كبيرة، ألم شديد غير محتمل، أو تدهور سريع في الحالة العامة.'],
      ['ماذا تستفيد عند مراجعة الطوارئ في الحالة الحرجة؟','سرعة إنقاذ الحياة، فرز طبي حسب الأولوية، إمكانية الإنعاش، الإدخال للمستشفى أو العمليات، والفحوصات المتقدمة عند الحاجة.'],
      ['أمثلة مهمة','الإصابات والحوادث، السقوط والكسور المعقدة، آلام الصدر، الاشتباه بجلطة، ضيق النفس الحاد، ألم البطن الشديد، المغص الكلوي الحاد، نوبات الربو الشديدة.']
    ]},
    center: {title:'🏥 المركز الصحي', cls:'er-detail-center', sections:[
      ['متى أراجع المركز الصحي؟','عند الرشح، التهاب الحلق البسيط، الحرارة الخفيفة دون علامات خطورة، آلام العضلات أو الظهر الخفيفة، المتابعة العامة، المطاعيم، وتجديد أدوية الأمراض المزمنة المستقرة.'],
      ['ماذا يقدم المركز الصحي الشامل؟','تقييم طبي للحالات البسيطة والمتوسطة، علاج أولي، متابعة الأمراض المزمنة، أدوية الرعاية الأولية، مطاعيم، وقد يثبت بعض الحالات مؤقتًا ويحوّلها إذا لزم.'],
      ['لماذا قد يكون أسرع؟','في الطوارئ الأولوية للحالات الحرجة. لذلك الحالات البسيطة قد تنتظر أطول، بينما يكون المركز الصحي أنسب وأسرع لكثير من الحالات المستقرة.']
    ]},
    clinic: {title:'🩺 العيادات المسائية / الخارجية', cls:'er-detail-clinic', sections:[
      ['متى أراجع العيادات؟','عند الحاجة لموعد اختصاص، مراجعة نتائج، متابعة مرض مزمن، استشارة تخصصية، تحويل طبي، أو أدوية تخصصية تحتاج طبيب اختصاص.'],
      ['ماذا تستفيد؟','تنظيم المواعيد، مراجعة طبيب اختصاص، متابعة دقيقة للحالات المزمنة أو المعقدة، وصرف أدوية تخصصية حسب النظام.'],
      ['تنبيه مهم','العيادات ليست مخصصة للحالات الحرجة أو المفاجئة. عند ظهور علامات خطر توجّه للطوارئ فورًا.']
    ]}
  }[type];
  if (!data) return;
  box.innerHTML = `<div class="er-detail-box ${data.cls}"><h2>${data.title}</h2>${data.sections.map(s=>`<div class="info-card glow-card"><b>${s[0]}</b><p>${s[1]}</p></div>`).join('')}<div class="disc-box">هذا الدليل للتوعية والإرشاد فقط، ولا يغني عن تقييم الطبيب.</div></div>`;
  box.scrollIntoView({behavior:'smooth', block:'start'});
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
function setContactMode(mode) {
  const isTech = mode === 'tech';
  document.getElementById('ct-tab-tech')?.classList.toggle('active', isTech);
  document.getElementById('ct-tab-thanks')?.classList.toggle('active', !isTech);
  document.getElementById('contact-tech-form')?.classList.toggle('active', isTech);
  document.getElementById('contact-thanks-form')?.classList.toggle('active', !isTech);
}

function submitContact(mode='tech') {
  const success = document.getElementById('ct-success');
  const item = { id: Date.now(), mode, createdAt: new Date().toISOString() };
  if (mode === 'thanks') {
    item.type = document.getElementById('ct-thanks-type')?.value || 'thanks';
    item.msg = document.getElementById('ct-thanks-msg')?.value || '';
    item.name = document.getElementById('ct-thanks-name')?.value || '';
    item.phone = document.getElementById('ct-thanks-phone')?.value || '';
    item.email = document.getElementById('ct-thanks-email')?.value || '';
    item.area = document.getElementById('ct-thanks-area')?.value || '';
  } else {
    item.type = document.getElementById('ct-type')?.value || 'other';
    item.msg = document.getElementById('ct-msg')?.value || '';
    item.name = document.getElementById('ct-name')?.value || '';
  }
  S.reports.push(item);
  localStorage.setItem('shg_reports', JSON.stringify(S.reports));
  if (success) { success.style.display = 'block'; setTimeout(()=>success.style.display='none', 2500); }
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
   const feedbackFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLScm9orJGWGWHXd_UfbQ3Qzt_YN_8Tq4GTP2pj_wHSOFgCP1mg/viewform?usp=publish-editor";

  if (typeof gtag === "function") {
    gtag("event", "rating_click", {
      rating: type === "happy" ? "راضي" : "غير راضي"
    });
  }

  window.open(feedbackFormUrl, "_blank");
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
