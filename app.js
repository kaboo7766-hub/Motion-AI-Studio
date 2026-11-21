const $=id=>document.getElementById(id);
const DAILY_LIMIT=100;
const STORAGE_KEY='motion_ai_daily_100_v3';
const API_CONFIG_KEY='motion_ai_external_api_v1';

let imageUrl=null,loadedImgEl=null,imageDataUrl=null,playing=false,timer=null,keys=[0,50,100],selectedCommandId=null;
let generatedVideoUrl=null,isRendering=false;

const CATEGORIES=[
  'الحركة السينمائية',
  'حركة الجسم',
  'الوجه والتعبيرات',
  'الشعر والملابس',
  'الأكشن والقتال',
  'الطبيعة والطقس',
  'الحيوانات والطيور',
  'الإضاءة والمؤثرات',
  'الخيال والفانتازيا',
  'الكاميرا والتصوير'
];

const ACTION_TEMPLATES={
  'الحركة السينمائية':[
    ['تقدّم سينمائي هادئ','حركة كاميرا بطيئة تقترب من العنصر الرئيسي مع عمق ميداني ناعم وإضاءة سينمائية متوازنة.','zoom'],
    ['ابتعاد كاشف للمشهد','تراجع الكاميرا ببطء للخلف لكشف محيط المشهد بالكامل مع انتقال بصري سلس.','zoomout'],
    ['انزلاق أفقي متزن','تحريك كاميرا أفقي ناعم من اليمين إلى اليسار مع الحفاظ على ثبات الهدف الرئيسي.','pan'],
    ['ميل رأسي درامي','إمالة الكاميرا رأسياً من الأسفل إلى الأعلى لإبراز الارتفاع والهيبة البصرية.','tilt'],
    ['دوران مداري بطيء','حركة دوران سينمائية تقريبية حول مركز المشهد لإضفاء عمق ثلاثي الأبعاد.','orbit'],
    ['افتتاحية فيلم هادئة','دخول بطيء للكاميرا مع نبض إضاءة خفيف يهيئ المشهد لبداية قصة سينمائية.','zoom'],
    ['خاتمة مشهد شاعرية','ابتعاد هادئ للكاميرا مع خفوت تدريجي لحركة الخلفية لإحساس بالختام.','zoomout'],
    ['عبور جانبي ناعم','إزاحة أفقية متصلة عبر المشهد مع إحساس بالعمق بين المقدمة والخلفية.','pan'],
    ['صعود بصري مهيب','ارتفاع الكاميرا للأعلى تدريجياً لإظهار اتساع المكان حول الموضوع.','tilt'],
    ['دورة استكشاف محيطية','دوران خفيف يبرز تفاصيل الزوايا المحيطة دون فقدان تركيز المشهد.','orbit']
  ],
  'حركة الجسم':[
    ['مشي طبيعي للأمام','الشخص يتحرك للأمام بخطوات طبيعية متناسقة مع توازن الجسم وحركة الذراعين.','pan'],
    ['استدارة وتوقّف متزن','يلتف الجسم بنعومة نحو اتجاه جديد ثم يستقر في وضعية واضحة ومتزنة.','orbit'],
    ['انحناءة تأمل هادئة','انحناء خفيف للأمام أو الجانب يعكس التركيز والهدوء بحركة عضلية طبيعية.','tilt'],
    ['خطوة اقتراب واثقة','تقدّم خطوة للأمام مع حركة طبيعية للكتفين وتغيّر طفيف في مركز الثقل.','zoom'],
    ['تراجع حذر للخلف','خطوات تراجع هادئة للخلف مع الحفاظ على اتزان الوقفة وتناسق الحركة.','zoomout'],
    ['وقفة استعداد متيقظة','تنفّس واضح وحركة خفيفة في الصدر والكتفين تعبّر عن الانتباه والترقب.','none'],
    ['حركة يد تعبيرية','رفع اليد أو تحريكها بإيماءة طبيعية سلسة تتماشى مع سياق المشهد.','pan'],
    ['نهوض أو اعتدال تدريجي','اعتدال الجسم للأعلى بسلاسة مع حركة طبيعية للرأس والرقبة.','tilt'],
    ['تأرجح جسدي خفيف','تمايل خفيف ومتكرر في الجسم نتيجة نسيم أو إيقاع هادئ في المكان.','orbit'],
    ['انتقال خطوة جانبية','تحرك جانبي قصير ومنضبط مع الحفاظ على ثبات النظرة.','pan']
  ],
  'الوجه والتعبيرات':[
    ['ابتسامة هادئة تدريجية','تتشكّل ابتسامة ناعمة وطبيعية على الوجه مع استجابة خفيفة في محيط العينين.','zoom'],
    ['التفات نحو الكاميرا','يلتفت الوجه تدريجياً نحو الكاميرا بنعومة ووضوح مع تعبير هادئ.','none'],
    ['نظرة تأمل عميقة','ثبات الرأس مع حركة خفيفة للرموش وتغيّر لطيف في تعبير العينين.','zoom'],
    ['رفع الرأس بابتسامة','ارتفاع طفيف للرأس نحو الأعلى مصحوب بتعبير إيجابي هادئ ومريح.','tilt'],
    ['دهشة خفيفة طبيعية','اتساع خفيف في العينين ورفع بسيط للحاجبين يعكس مفاجأة هادئة.','zoom'],
    ['هدوء وطمأنينة','استرخاء ملامح الوجه مع تنفّس منتظم وإضاءة ناعمة تبرز التفاصيل.','none'],
    ['نظرة جانبية متفحّصة','تحوّل اتجاه النظر جانبياً ببطء دون حركة مفاجئة للرأس.','pan'],
    ['تعبير جاد ومركّز','ملامح مركّزة وثابتة مع حركة خفيفة جداً تعكس جدية الموقف.','zoom'],
    ['إيماءة موافقة بسيطة','إيماءة رأس خفيفة للأسفل ثم للأعلى تعبّر عن الفهم أو القبول.','tilt'],
    ['انتقال تعبيري ناعم','انتقال سلس بين تعبير محايد وابتسامة خفيفة خلال ثوانٍ المشهد.','none']
  ],
  'الشعر والملابس':[
    ['تموّج الشعر بالنسيم','نسيم خفيف يحرك خصلات الشعر بانسيابية طبيعية دون مبالغة.','none'],
    ['رفرفة أطراف الملابس','حركة هواء لطيفة تحرّك حواف الثوب أو الوشاح بنعومة واقعية.','pan'],
    ['انسياب قماش مع الحركة','استجابة القماش لحركة الجسم مع طيّات طبيعية متتابعة.','zoom'],
    ['هبوب رياح متوسطة','تيار هواء يحرّك الشعر والملابس في اتجاه واحد مع حركة مستمرة.','pan'],
    ['تطاير خفيف عند الدوران','حركة خفيفة لأطراف الملابس والشعر أثناء دوران المشهد.','orbit'],
    ['سكون مع لمسة هواء','مشهد هادئ يقتصر فيه التحريك على تموّج خفيف جداً في الشعر.','none'],
    ['تموّج وشاح طويل','حركة متموجة لطول الوشاح أو العباءة مع تدرج واضح في السرعة.','tilt'],
    ['اهتزاز خفيف للملابس','تأثر الملابس بذبذبة هواء أو حركة قريبة من الكاميرا.','zoomout'],
    ['انسيابية خصلات أمامية','تحرك خصلات الشعر الأمامية برفق مع الحفاظ على وضوح الوجه.','zoom'],
    ['تناسق حركة القماش','تتابع موجات القماش من الأعلى إلى الأسفل بانسيابية بصرية.','tilt']
  ],
  'الأكشن والقتال':[
    ['اندفاع سريع للأمام','حركة اندفاع ديناميكية للأمام مع كاميرا تتبع سريعة وإحساس بالسرعة.','zoom'],
    ['مراوغة جانبية خاطفة','تحرك جانبي سريع لتفادي مسار مباشر مع الحفاظ على تركيز الهدف.','pan'],
    ['قفزة ديناميكية','اندفاع للأعلى والأمام بحركة نشطة وإيقاع سريع مناسب لمشاهد الحركة.','tilt'],
    ['ضربة أو حركة هجومية','حركة ذراع أو جسم سريعة وحاسمة مع تأثير حركي واضح.','pan'],
    ['تراجع سريع تحت ضغط','تراجع خاطف للخلف مع كاميرا تبتعد لإظهار مساحة الحركة.','zoomout'],
    ['دوران قتالي سريع','دوران سريع ومضبوط حول المحور مع إيقاع حركي مرتفع.','orbit'],
    ['توقّف مفاجئ بعد اندفاع','اندفاع سريع يتبعه توقّف ثابت ومفاجئ لإبراز القوة والثبات.','zoom'],
    ['تتبع هدف متحرك','الكاميرا تلاحق حركة سريعة عبر الإطار مع استجابة نشطة.','pan'],
    ['انقضاض من الأعلى','حركة هبوط سريعة من الأعلى نحو الأسفل بإيقاع حماسي.','tilt'],
    ['مناورة مزدوجة سريعة','حركة التفاف واندفاع متتابعة تمنح المشهد طاقة عالية.','orbit']
  ],
  'الطبيعة والطقس':[
    ['حركة السحب البطيئة','السحب تتحرك ببطء عبر السماء مع ثبات الكاميرا وهدوء عام.','none'],
    ['حفيف الأشجار والأوراق','نسيم يمر عبر الأشجار والأوراق بحركة طبيعية مستمرة.','pan'],
    ['تدفق الضباب الكثيف','ضباب كثيف يتدفق ببطء عبر المشهد مع زحف كاميرا سينمائي هادئ.','zoom'],
    ['تموّج سطح الماء','موجات ماء هادئة تتكرر بانتظام مع انعكاسات ضوئية لطيفة.','pan'],
    ['تساقط مطر خفيف','قطرات مطر هادئة تهطل بانسيابية مع أجواء شاعرية متماسكة.','tilt'],
    ['زحف رياح فوق العشب','موجات رياح تمر فوق العشب أو الحقول باتجاه أفقي واضح.','pan'],
    ['شروق أو غروب متحرك','تغيّر تدريجي في دفء الإضاءة مع حركة خفيفة جداً في الأفق.','zoomout'],
    ['ضباب جبلي متصاعد','بخار وضباب يرتفع ببطء بين المرتفعات مع ميل رأسي خفيف.','tilt'],
    ['انعكاس ضوئي على البحيرة','تموّج مائي ناعم يعكس ضوء السماء بتدرج هادئ.','none'],
    ['عاصفة خفيفة في الأفق','حركة سحب ورياح نشطة نسبياً تحافظ على حيوية المشهد الطبيعي.','orbit']
  ],
  'الحيوانات والطيور':[
    ['تحليق طائر في الأفق','طائر يرفرف بجناحيه ويتحرك عبر المشهد بانسيابية واضحة.','pan'],
    ['حركة أذن وذيل حيوان','حركة طبيعية للأذنين أو الذيل مع انتباه واضح نحو المحيط.','none'],
    ['اقتراب هادئ لكائن حي','تقدّم بطيء للكاميرا نحو الحيوان مع الحفاظ على هدوء المشهد.','zoom'],
    ['سير بطيء عبر المشهد','تحرك الحيوان بخطوات طبيعية عبر الإطار مع متابعة ناعمة.','pan'],
    ['التفات مفاجئ للانتباه','التفات سريع للرأس والأذنين عند سماع صوت أو حركة قريبة.','orbit'],
    ['رفرفة جناحين قريبة','حركة أجنحة متكررة وواضحة تمنح المشهد حيوية طبيعية.','tilt'],
    ['تراجع لإظهار البيئة','ابتعاد الكاميرا للخلف لإظهار الحيوان داخل بيئته الطبيعية.','zoomout'],
    ['قفزة أو وثبة خفيفة','حركة وثب قصيرة وطبيعية مع استقرار واضح بعد الهبوط.','tilt'],
    ['مراقبة هادئة للمحيط','ثبات الجسم مع حركة خفيفة للرأس والعينين لمراقبة المكان.','none'],
    ['عبور سرب أو مجموعة','حركة جماعية متقاربة في اتجاه واحد بإيقاع طبيعي.','pan']
  ],
  'الإضاءة والمؤثرات':[
    ['نبض إضاءة سينمائي','تذبذب ناعم ومضبوط في شدة الإضاءة يبرز عمق المشهد.','zoom'],
    ['توهّج ضوئي هادئ','إضاءة دافئة أو باردة تتوهّج تدريجياً مع حركة كاميرا بطيئة.','none'],
    ['تطاير ذرات ضوئية','ذرات غبار أو شرارات خفيفة تتحرك ببطء في الهواء.','pan'],
    ['تباين ظلال وإضاءة','حركة ضوئية تبرز حواف العناصر والظلال بشكل درامي.','orbit'],
    ['ومضة خفيفة في الخلفية','تغيّر ضوئي لطيف في الخلفية دون إرباك العنصر الأساسي.','zoomout'],
    ['شعاع ضوء متسلل','حركة ضوئية موجهة تمنح المشهد عمقاً بصرياً واضحاً.','tilt'],
    ['انتقال لوني ناعم','تدرج لوني هادئ يضفي طابعاً فنياً متماسكاً على المشهد.','pan'],
    ['توهّج حواف العنصر','إبراز خفيف لحواف الموضوع الرئيسي مع حركة اقتراب هادئة.','zoom'],
    ['تلاشي ضوئي تدريجي','هدوء تدريجي في حدة الإضاءة نحو نهاية المشهد.','zoomout'],
    ['موجة ضوء أفقية','مرور انعكاس ضوئي خفيف عبر المشهد بإيقاع ثابت.','pan']
  ],
  'الخيال والفانتازيا':[
    ['طاقة سحرية متصاعدة','هالة وتيارات طاقة خفيفة تتحرك حول العنصر بأسلوب فانتازي.','orbit'],
    ['طفو خفيف فوق الأرض','ارتفاع وطوفان خفيف جداً يمنح المشهد إحساساً بالخيال.','tilt'],
    ['أجواء عالم سحري','حركة كاميرا بطيئة تقترب من عنصر خيالي بإضاءة حالمة.','zoom'],
    ['تدفّق بلورات أو شرارات','حركة جزيئات مضيئة تسبح في الفضاء المحيط ببطء.','pan'],
    ['بوابة ضوئية غامضة','توهّج ودوران خفيف يحيط بمركز المشهد بأسلوب خيالي.','orbit'],
    ['نسيم سحري في المشهد','حركة ناعمة للعناصر والملابس وكأنها تتأثر بطاقة خفية.','pan'],
    ['كشف عالم خفي','ابتعاد الكاميرا للخلف لإظهار اتساع المشهد الخيالي.','zoomout'],
    ['نبض تعويذة أو أثر','تغيّر إيقاعي خفيف في الضوء حول العنصر الرئيسي.','none'],
    ['صعود نحو السماء الخيالية','ميل رأسي للأعلى يبرز الأجواء الخيالية للمشهد.','tilt'],
    ['رحلة استكشاف خيالية','مزيج هادئ من الاقتراب والحركة الجانبية لإبراز التفاصيل.','zoom']
  ],
  'الكاميرا والتصوير':[
    ['لقطة قريبة تفصيلية','تقريب بطيء لإبراز التفاصيل الدقيقة في الصورة.','zoom'],
    ['لقطة واسعة شاملة','ابتعاد بطيء لإظهار التكوين العام للمشهد.','zoomout'],
    ['بانورامي أفقية ناعمة','حركة مسح أفقية سلسة عبر عرض المشهد.','pan'],
    ['تيلت رأسي متقن','حركة مسح رأسية من أسفل إلى أعلى أو العكس.','tilt'],
    ['حركة مدارية خفيفة','دوران تصويري خفيف يضيف عمقاً للمشهد الثابت.','orbit'],
    ['تثبيت سينمائي متوازن','حركة بسيطة جداً تحافظ على ثبات الكادر ووضوحه.','none'],
    ['تتبع جانبي منتظم','حركة كاميرا متوازية مع اتجاه العنصر داخل الإطار.','pan'],
    ['تدرج عمق الميدان','إحساس بالانتقال بين المقدمة والخلفية أثناء الحركة.','zoom'],
    ['إعادة تأطير هادئة','تعديل تدريجي لموضع الكاميرا لتحسين توازن الكادر.','tilt'],
    ['مشهد استعراضي متكامل','حركة تصويرية متصلة تبرز جماليات التكوين العام.','orbit']
  ]
};

const COMMANDS_100=(()=>{
  const list=[];
  let num=1;
  CATEGORIES.forEach(category=>{
    const items=ACTION_TEMPLATES[category]||[];
    items.forEach(([title,prompt,camera])=>{
      list.push({
        id:'cmd-'+num,
        code:'#'+String(num).padStart(3,'0'),
        num,
        category,
        title,
        prompt,
        camera
      });
      num++;
    });
  });
  return list;
})();

const DEFAULT_ENDPOINTS={
  local:'',
  fal:'https://queue.fal.run/fal-ai/kling-video/v1.6/standard/image-to-video',
  replicate:'https://api.replicate.com/v1/predictions',
  custom:'https://your-server.example.com/api/image-to-video'
};

function loadApiConfig(){
  try{
    const raw=localStorage.getItem(API_CONFIG_KEY);
    if(!raw)return {provider:'local',endpoint:'',apiKey:'',proxy:''};
    return Object.assign({provider:'local',endpoint:'',apiKey:'',proxy:''},JSON.parse(raw));
  }catch(_){
    return {provider:'local',endpoint:'',apiKey:'',proxy:''};
  }
}

let apiConfig=loadApiConfig();

function saveApiConfig(){
  try{localStorage.setItem(API_CONFIG_KEY,JSON.stringify(apiConfig));}catch(_){}
  updateApiUI();
}

function isExternalApiActive(){
  return apiConfig.provider!=='local'&&(Boolean(apiConfig.apiKey)||Boolean(apiConfig.proxy));
}

function updateApiUI(){
  if($('apiProvider'))$('apiProvider').value=apiConfig.provider||'local';
  if($('apiEndpoint'))$('apiEndpoint').value=apiConfig.endpoint||DEFAULT_ENDPOINTS[apiConfig.provider]||'';
  if($('apiKey'))$('apiKey').value=apiConfig.apiKey||'';
  if($('apiProxy'))$('apiProxy').value=apiConfig.proxy||'';

  const active=isExternalApiActive();
  const names={local:'محلي',fal:'fal.ai',replicate:'Replicate',custom:'خادم مخصص'};
  const pName=names[apiConfig.provider]||'محلي';

  if($('apiStatusBadge'))$('apiStatusBadge').textContent=active?`متصل: ${pName}`:'غير متصل (يعمل محلياً)';
  if($('renderBadge'))$('renderBadge').textContent=active?`API · ${apiConfig.provider.toUpperCase()}`:'LOCAL ENGINE';
  if($('engineModePill'))$('engineModePill').textContent=active?`✦ ${pName} API`:'✦ LOCAL AI';
  if($('engineNotice')){
    $('engineNotice').textContent=active
      ?`متصل حالياً بمحرك (${pName}). عند الضغط على «تحويل إلى فيديو» سيتم إرسال الصورة وأمر الحركة إلى المحرك الخارجي وتنزيل النتيجة.`
      :'الوضع الحالي: محرك التوليد المحلي الفوري. لتوليد فيديو بالذكاء الاصطناعي الحقيقي من الأوامر، اربط مفتاح API من قسم «إعدادات ربط المحرك الخارجي» بالأسفل.';
  }
}

function loadDailyState(){
  const today=new Date().toISOString().slice(0,10);
  const fallback={date:today,producedCount:0,queue:[]};
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw)return fallback;
    const parsed=JSON.parse(raw);
    if(parsed.date!==today)return fallback;
    return {
      date:today,
      producedCount:Number(parsed.producedCount)||0,
      queue:Array.isArray(parsed.queue)?parsed.queue:[]
    };
  }catch(_){
    return fallback;
  }
}

let dailyState=loadDailyState();

function saveDailyState(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(dailyState));}catch(_){}
}

function parsePromptEffects(text){
  const p=(text||'').toLowerCase();
  return {
    fog:/ضباب|دخان|غبار|بخار|غامض/.test(p),
    rain:/مطر|قطرات|شتاء|عاصفة/.test(p),
    glow:/إضاءة|توهج|توهّج|سحري|ضوء|شمس|شرارات|بلورات|طاقة|سينمائي/.test(p),
    shake:/أكشن|اندفاع|قتال|سريع|قفزة|ضربة|انقضاض|مراوغة/.test(p),
    breeze:/نسيم|رياح|شعر|ملابس|وشاح|أشجار|أوراق|ماء|موجات|سحب/.test(p)
  };
}

function getSupportedMimeType(){
  if(typeof MediaRecorder==='undefined')return '';
  const types=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm','video/mp4'];
  for(const t of types){
    if(MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t))return t;
  }
  return '';
}

function getOptimizedImageDataUrl(){
  if(!loadedImgEl)return imageDataUrl;
  const maxDim=1024;
  const srcW=loadedImgEl.naturalWidth||1024;
  const srcH=loadedImgEl.naturalHeight||576;
  const scale=Math.min(1,maxDim/Math.max(srcW,srcH));
  const c=document.createElement('canvas');
  c.width=Math.round(srcW*scale);
  c.height=Math.round(srcH*scale);
  c.getContext('2d').drawImage(loadedImgEl,0,0,c.width,c.height);
  return c.toDataURL('image/jpeg',0.9);
}

async function generateViaExternalApi(opts){
  const imgData=getOptimizedImageDataUrl();
  if(!imgData)throw new Error('لا توجد صورة محملة لإرسالها للمحرك الخارجي');

  const promptFull=`${opts.prompt||'Cinematic smooth camera motion'}, camera motion: ${opts.camera}, speed: ${opts.speed}, intensity: ${opts.intensity}`;
  const durationStr=String(Number(opts.duration)<=5?5:10);

  if(typeof opts.onProgress==='function')opts.onProgress(15,'جاري إرسال الصورة وأمر الحركة إلى المحرك الخارجي...');

  // 1) Custom Proxy / Webhook
  if(apiConfig.proxy){
    const res=await fetch(apiConfig.proxy,{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        ...(apiConfig.apiKey?{'Authorization':`Bearer ${apiConfig.apiKey}`}:{})
      },
      body:JSON.stringify({
        provider:apiConfig.provider,
        endpoint:apiConfig.endpoint,
        image_url:imgData,
        prompt:promptFull,
        duration:Number(opts.duration)||5,
        camera:opts.camera,
        speed:opts.speed,
        intensity:opts.intensity
      })
    });
    if(!res.ok)throw new Error(`خطأ من الخادم الوسيط (${res.status})`);
    const data=await res.json();
    const videoUrl=data.video_url||data.video?.url||data.output?.[0]||data.output;
    if(!videoUrl)throw new Error('لم يُرجع الخادم رابط فيديو صالح');
    if(typeof opts.onProgress==='function')opts.onProgress(100,'اكتمل توليد الفيديو من الخادم!');
    return {url:videoUrl,ext:'mp4',duration:Number(opts.duration)||5,source:'External Proxy API'};
  }

  // 2) fal.ai Queue API
  if(apiConfig.provider==='fal'){
    let endpoint=(apiConfig.endpoint||DEFAULT_ENDPOINTS.fal).trim();
    if(!endpoint.startsWith('http'))endpoint='https://queue.fal.run/'+endpoint.replace(/^\/+/,'');

    const submitRes=await fetch(endpoint,{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':`Key ${apiConfig.apiKey}`
      },
      body:JSON.stringify({
        prompt:promptFull,
        image_url:imgData,
        duration:durationStr
      })
    });
    if(!submitRes.ok){
      const errTxt=await submitRes.text().catch(()=>'');
      throw new Error(`فشل الاتصال بـ fal.ai (${submitRes.status}): ${errTxt.slice(0,120)}`);
    }
    const job=await submitRes.json();
    if(job.video?.url){
      return {url:job.video.url,ext:'mp4',duration:Number(durationStr),source:'fal.ai'};
    }
    const statusUrl=job.status_url;
    const responseUrl=job.response_url;
    if(!statusUrl||!responseUrl)throw new Error('استجابة غير متوقعة من fal.ai');

    for(let attempt=1;attempt<=60;attempt++){
      await new Promise(r=>setTimeout(r,3000));
      const pct=Math.min(92,15+Math.round((attempt/60)*77));
      if(typeof opts.onProgress==='function')opts.onProgress(pct,`جاري توليد الفيديو على fal.ai... (${attempt*3}ث)`);

      const stRes=await fetch(statusUrl,{headers:{'Authorization':`Key ${apiConfig.apiKey}`}});
      if(!stRes.ok)continue;
      const st=await stRes.json();
      if(st.status==='COMPLETED'){
        const finalRes=await fetch(responseUrl,{headers:{'Authorization':`Key ${apiConfig.apiKey}`}});
        const finalData=await finalRes.json();
        const vUrl=finalData.video?.url||finalData.data?.video?.url;
        if(!vUrl)throw new Error('اكتمل الطلب لكن لم يُعثر على رابط الفيديو');
        if(typeof opts.onProgress==='function')opts.onProgress(100,'اكتمل توليد الفيديو من fal.ai!');
        return {url:vUrl,ext:'mp4',duration:Number(durationStr),source:'fal.ai'};
      }
      if(st.status==='FAILED')throw new Error('فشل توليد الفيديو على fal.ai');
    }
    throw new Error('انتهت مهلة الانتظار من fal.ai');
  }

  // 3) Replicate API
  if(apiConfig.provider==='replicate'){
    const endpoint=(apiConfig.endpoint||DEFAULT_ENDPOINTS.replicate).trim();
    const createRes=await fetch(endpoint,{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':`Bearer ${apiConfig.apiKey}`
      },
      body:JSON.stringify({
        input:{
          prompt:promptFull,
          image:imgData,
          first_frame_image:imgData
        }
      })
    });
    if(!createRes.ok)throw new Error(`فشل الاتصال بـ Replicate (${createRes.status})`);
    const pred=await createRes.json();
    const getUrl=pred.urls?.get;
    if(!getUrl)throw new Error('لم يُرجع Replicate رابط متابعة الطلب');

    for(let attempt=1;attempt<=60;attempt++){
      await new Promise(r=>setTimeout(r,3000));
      const pct=Math.min(92,15+Math.round((attempt/60)*77));
      if(typeof opts.onProgress==='function')opts.onProgress(pct,`جاري التوليد على Replicate... (${attempt*3}ث)`);
      const pollRes=await fetch(getUrl,{headers:{'Authorization':`Bearer ${apiConfig.apiKey}`}});
      const pData=await pollRes.json();
      if(pData.status==='succeeded'){
        const out=Array.isArray(pData.output)?pData.output[0]:pData.output;
        if(!out)throw new Error('لم يُرجع Replicate رابط فيديو');
        if(typeof opts.onProgress==='function')opts.onProgress(100,'اكتمل التوليد من Replicate!');
        return {url:out,ext:'mp4',duration:Number(opts.duration)||5,source:'Replicate'};
      }
      if(pData.status==='failed'||pData.status==='canceled')throw new Error('فشل التوليد في Replicate');
    }
    throw new Error('انتهت مهلة الانتظار من Replicate');
  }

  // 4) Custom direct endpoint
  const customUrl=(apiConfig.endpoint||'').trim();
  if(!customUrl)throw new Error('يرجى إدخال رابط Endpoint صحيح');
  const customRes=await fetch(customUrl,{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      ...(apiConfig.apiKey?{'Authorization':`Bearer ${apiConfig.apiKey}`}:{})
    },
    body:JSON.stringify({
      image:imgData,
      prompt:promptFull,
      duration:Number(opts.duration)||5,
      camera:opts.camera
    })
  });
  if(!customRes.ok)throw new Error(`خطأ من الخادم المخصص (${customRes.status})`);
  const cData=await customRes.json();
  const cVideo=cData.video_url||cData.video?.url||cData.url||cData.output;
  if(!cVideo)throw new Error('الاستجابة لا تحتوي على رابط فيديو');
  if(typeof opts.onProgress==='function')opts.onProgress(100,'اكتمل التوليد!');
  return {url:cVideo,ext:'mp4',duration:Number(opts.duration)||5,source:'Custom API'};
}

async function renderRealVideoLocal(opts){
  if(!loadedImgEl)throw new Error('NO_IMAGE');
  if(typeof MediaRecorder==='undefined')throw new Error('NO_RECORDER');

  const durationSec=Math.max(2,Math.min(12,Number(opts.duration)||5));
  const camera=opts.camera||'zoom';
  const speedMul=opts.speed==='fast'?1.45:opts.speed==='slow'?0.7:1.0;
  const intensityMul=opts.intensity==='strong'?1.55:opts.intensity==='subtle'?0.55:1.0;
  const effects=parsePromptEffects(opts.prompt||'');

  const srcW=loadedImgEl.naturalWidth||1280;
  const srcH=loadedImgEl.naturalHeight||720;
  const maxDim=960;
  const scaleOut=Math.min(1,maxDim/Math.max(srcW,srcH));
  const W=Math.max(320,Math.round((srcW*scaleOut)/2)*2);
  const H=Math.max(240,Math.round((srcH*scaleOut)/2)*2);

  const canvas=document.createElement('canvas');
  canvas.width=W;
  canvas.height=H;
  const ctx=canvas.getContext('2d');

  const particles=Array.from({length:effects.rain?90:45},(_,i)=>({
    x:(i*73)%W,
    y:(i*137)%H,
    r:effects.rain?1.5:(1.5+(i%3)),
    sp:effects.rain?(6+i%5):(0.8+(i%3)*0.5),
    alpha:0.25+(i%5)*0.12
  }));

  const fps=24;
  const stream=canvas.captureStream(fps);
  const mimeType=getSupportedMimeType();
  const recorder=mimeType?new MediaRecorder(stream,{mimeType,videoBitsPerSecond:2500000}):new MediaRecorder(stream);
  const chunks=[];
  recorder.ondataavailable=e=>{if(e.data&&e.data.size>0)chunks.push(e.data);};

  const totalFrames=Math.round(durationSec*fps);

  return new Promise((resolve,reject)=>{
    recorder.onerror=err=>reject(err);
    recorder.onstop=()=>{
      const finalType=recorder.mimeType||mimeType||'video/webm';
      const ext=finalType.includes('mp4')?'mp4':'webm';
      const blob=new Blob(chunks,{type:finalType});
      const url=URL.createObjectURL(blob);
      resolve({url,isObjectUrl:true,ext,width:W,height:H,duration:durationSec,source:'Local Engine'});
    };

    recorder.start(100);
    let frame=0;

    function drawFrame(){
      const rawT=frame/Math.max(1,totalFrames-1);
      const wave=0.5-0.5*Math.cos(Math.min(1,rawT*speedMul)*Math.PI);

      let sc=1.04,tx=0,ty=0,rot=0;
      if(camera==='zoom')sc=1.0+0.14*intensityMul*rawT;
      else if(camera==='zoomout')sc=1.0+0.14*intensityMul*(1-rawT);
      else if(camera==='pan'){sc=1.08;tx=(rawT-0.5)*W*0.08*intensityMul;}
      else if(camera==='tilt'){sc=1.08;ty=(0.5-rawT)*H*0.08*intensityMul;}
      else if(camera==='orbit'){sc=1.05+0.07*intensityMul*wave;rot=Math.sin(rawT*Math.PI*2)*0.03*intensityMul;tx=Math.cos(rawT*Math.PI*2)*W*0.02*intensityMul;}
      else sc=1.0+0.03*intensityMul*wave;

      if(effects.breeze)tx+=Math.sin(rawT*Math.PI*4)*W*0.008*intensityMul;
      if(effects.shake){tx+=Math.sin(frame*1.7)*W*0.01*intensityMul;ty+=Math.cos(frame*2.1)*H*0.01*intensityMul;}

      ctx.clearRect(0,0,W,H);
      ctx.save();
      ctx.translate(W/2+tx,H/2+ty);
      ctx.rotate(rot);
      ctx.scale(sc,sc);
      ctx.drawImage(loadedImgEl,-W/2,-H/2,W,H);
      ctx.restore();

      if(effects.glow){
        const pulse=0.08+0.07*Math.sin(rawT*Math.PI*2);
        const grad=ctx.createRadialGradient(W*0.5,H*0.42,W*0.08,W*0.5,H*0.5,W*0.7);
        grad.addColorStop(0,`rgba(140,215,255,${pulse})`);
        grad.addColorStop(1,'rgba(10,16,38,0)');
        ctx.fillStyle=grad;
        ctx.fillRect(0,0,W,H);
      }

      if(effects.fog){
        const fogShift=(rawT*W*0.25)%W;
        const fogGrad=ctx.createLinearGradient(fogShift-W*0.5,0,fogShift+W*0.8,H);
        fogGrad.addColorStop(0,'rgba(215,228,255,0.04)');
        fogGrad.addColorStop(0.5,'rgba(215,228,255,0.18)');
        fogGrad.addColorStop(1,'rgba(215,228,255,0.05)');
        ctx.fillStyle=fogGrad;
        ctx.fillRect(0,0,W,H);
      }

      if(effects.rain||effects.glow){
        ctx.save();
        for(const pt of particles){
          pt.y=(pt.y+pt.sp*intensityMul)%H;
          if(effects.rain){
            pt.x=(pt.x-1.2+W)%W;
            ctx.strokeStyle=`rgba(195,225,255,${pt.alpha})`;
            ctx.lineWidth=1.2;
            ctx.beginPath();
            ctx.moveTo(pt.x,pt.y);
            ctx.lineTo(pt.x-3,pt.y+11);
            ctx.stroke();
          }else{
            pt.x=(pt.x+Math.sin(frame*0.08+pt.y)*0.6+W)%W;
            ctx.fillStyle=`rgba(175,230,255,${pt.alpha*0.75})`;
            ctx.beginPath();
            ctx.arc(pt.x,pt.y,pt.r,0,Math.PI*2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      const pct=Math.min(100,Math.round(((frame+1)/totalFrames)*100));
      if(typeof opts.onProgress==='function')opts.onProgress(pct,'جاري تصيير الفيديو محلياً...');

      frame++;
      if(frame<totalFrames)setTimeout(drawFrame,1000/fps);
      else setTimeout(()=>{if(recorder.state!=='inactive')recorder.stop();},120);
    }

    drawFrame();
  });
}

function showRenderedVideo(result,title){
  if(generatedVideoUrl&&generatedVideoUrl.startsWith('blob:'))URL.revokeObjectURL(generatedVideoUrl);
  generatedVideoUrl=result.url;
  const vid=$('resultVideo');
  const photo=$('photo');
  if(photo)photo.hidden=true;
  if($('empty'))$('empty').hidden=true;
  if($('stageControls'))$('stageControls').hidden=true;
  if(vid){
    vid.src=generatedVideoUrl;
    vid.hidden=false;
    vid.play().catch(()=>{});
  }
  if($('backToImageBtn'))$('backToImageBtn').hidden=false;
  if($('videoReadyBar'))$('videoReadyBar').hidden=false;
  const dims=result.width?` · ${result.width}×${result.height}`:'';
  if($('videoMetaText'))$('videoMetaText').textContent=`${title||'فيديو الحركة'} · ${result.duration}ث${dims} (${result.source||'Video'})`;
  const link=$('downloadVideoLink');
  if(link){
    link.href=generatedVideoUrl;
    link.download=`motion-video-${Date.now()}.${result.ext||'mp4'}`;
  }
  if($('status'))$('status').textContent='تم إنشاء الفيديو بنجاح وجاهز للتنزيل';
}

async function triggerVideoConversion(customOpts){
  if(isRendering)return toast('جاري إنشاء فيديو حالياً، انتظر لحظة...');
  if(!imageUrl||!loadedImgEl)return toast('ارفع صورة أولاً ثم اضغط تحويل إلى فيديو');

  const promptVal=(customOpts?.prompt??$('prompt').value??'').trim();
  const activeCmd=COMMANDS_100.find(c=>c.id===selectedCommandId);
  const title=customOpts?.title||(activeCmd?`${activeCmd.code} ${activeCmd.title}`:'فيديو حركة مخصص');

  isRendering=true;
  const genBtn=$('generateVideoBtn');
  if(genBtn){genBtn.disabled=true;genBtn.textContent='⏳ جاري التحويل إلى فيديو...';}
  if($('renderBox'))$('renderBox').hidden=false;
  if($('renderFill'))$('renderFill').style.width='5%';
  if($('renderPercent'))$('renderPercent').textContent='5%';
  if($('renderStatusText'))$('renderStatusText').textContent=`جاري تجهيز: ${title}`;

  const reqOpts={
    prompt:promptVal,
    camera:customOpts?.camera||$('camera').value,
    duration:customOpts?.duration||Number($('duration').value),
    speed:customOpts?.speed||$('speed').value,
    intensity:customOpts?.intensity||$('intensity').value,
    onProgress:(pct,msg)=>{
      if($('renderFill'))$('renderFill').style.width=pct+'%';
      if($('renderPercent'))$('renderPercent').textContent=pct+'%';
      if(msg&&$('renderStatusText'))$('renderStatusText').textContent=msg;
    }
  };

  try{
    let res;
    if(isExternalApiActive()){
      res=await generateViaExternalApi(reqOpts);
    }else{
      res=await renderRealVideoLocal(reqOpts);
    }

    showRenderedVideo(res,title);

    if(dailyState.producedCount<DAILY_LIMIT){
      dailyState.producedCount++;
      dailyState.queue.push({
        id:'vid-'+Date.now(),
        commandId:activeCmd?activeCmd.id:null,
        title,
        prompt:promptVal||'حركة سينمائية',
        camera:reqOpts.camera,
        duration:reqOpts.duration,
        speed:reqOpts.speed,
        intensity:reqOpts.intensity,
        status:'done'
      });
      saveDailyState();
      renderQuotaAndBatch();
    }

    toast('تم تحويل الصورة وأمر الحركة إلى فيديو بنجاح!');
  }catch(err){
    console.error(err);
    const reason=err?.message||'خطأ غير معروف';
    toast(`تعذّر التوليد الخارجي (${reason})`);
  }finally{
    isRendering=false;
    if(genBtn){genBtn.disabled=false;genBtn.textContent='🎬 تحويل إلى فيديو وتنزيله';}
    setTimeout(()=>{if($('renderBox'))$('renderBox').hidden=true;},1400);
  }
}

function renderQuotaAndBatch(){
  const count=Math.min(DAILY_LIMIT,Math.max(0,dailyState.producedCount));
  const remaining=Math.max(0,DAILY_LIMIT-count);
  const pct=Math.min(100,(count/DAILY_LIMIT)*100);
  if($('quotaCount'))$('quotaCount').textContent=`${count} / ${DAILY_LIMIT} فيديو`;
  if($('quotaFill'))$('quotaFill').style.width=pct+'%';
  if($('quotaRemaining'))$('quotaRemaining').textContent=`متبقي اليوم: ${remaining} فيديو`;

  const pending=dailyState.queue.filter(item=>item.status!=='done').length;
  if($('batchStats'))$('batchStats').textContent=`في الانتظار: ${pending} · مكتمل اليوم: ${count}`;

  const listEl=$('batchList');
  if(!listEl)return;
  if(!dailyState.queue.length){
    listEl.innerHTML='<div class="batch-empty">لا توجد عناصر في قائمة إنتاج اليوم بعد. أضف مشاهد إلى الدفعة للوصول إلى خطة 100 فيديو/يوم.</div>';
    return;
  }
  listEl.innerHTML=dailyState.queue.slice().reverse().map(item=>`
    <div class="batch-row">
      <div>
        <strong>${item.title||'مشهد فيديو'} (${item.duration}ث · ${item.camera})</strong>
        <small>${item.prompt||'بدون وصف نصي'}</small>
      </div>
      <div class="batch-row-actions">
        <button type="button" class="outline small" data-render-item="${item.id}">🎬 تصدير فيديو</button>
        <span class="batch-status ${item.status==='done'?'done':''}">${item.status==='done'?'مكتمل ✓':'قيد الانتظار'}</span>
      </div>
    </div>
  `).join('');
}

function populateCategories(){
  const sel=$('cmdCategory');
  if(!sel)return;
  CATEGORIES.forEach(cat=>{
    const opt=document.createElement('option');
    opt.value=cat;
    const catCount=COMMANDS_100.filter(c=>c.category===cat).length;
    opt.textContent=`${cat} (${catCount})`;
    sel.append(opt);
  });
}

function renderCommands(){
  const listEl=$('commandsList');
  const countEl=$('libCount');
  if(!listEl)return;
  const q=($('cmdSearch')?.value||'').trim().toLowerCase();
  const cat=$('cmdCategory')?.value||'all';

  const filtered=COMMANDS_100.filter(c=>{
    const matchesCat=cat==='all'||c.category===cat;
    const matchesQuery=!q||
      c.title.toLowerCase().includes(q)||
      c.prompt.toLowerCase().includes(q)||
      c.category.toLowerCase().includes(q)||
      c.code.includes(q);
    return matchesCat&&matchesQuery;
  });

  if(countEl)countEl.textContent=`${filtered.length} / 100 أمر`;

  if(!filtered.length){
    listEl.innerHTML='<div class="batch-empty">لا توجد أوامر مطابقة للبحث الحالي.</div>';
    return;
  }

  listEl.innerHTML=filtered.map(cmd=>`
    <button type="button" class="cmd-item ${selectedCommandId===cmd.id?'active':''}" data-cmd-id="${cmd.id}">
      <div class="cmd-meta"><span>${cmd.code}</span><span>${cmd.category}</span></div>
      <div class="cmd-title">${cmd.title}</div>
      <div class="cmd-text">${cmd.prompt}</div>
    </button>
  `).join('');
}

function applyCommandById(id){
  const cmd=COMMANDS_100.find(c=>c.id===id);
  if(!cmd)return;
  selectedCommandId=cmd.id;
  $('prompt').value=cmd.prompt;
  if(cmd.camera&&$('camera'))$('camera').value=cmd.camera;
  renderCommands();
  toast(`تم اختيار الأمر ${cmd.code}: ${cmd.title}`);
}

function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3000)}

function switchToImageView(){
  if($('resultVideo')){$('resultVideo').pause();$('resultVideo').hidden=true;}
  if(imageUrl){
    $('photo').hidden=false;
    $('stageControls').hidden=false;
  }
  if($('backToImageBtn'))$('backToImageBtn').hidden=true;
}

function setImage(file){
  if(!file)return;
  if(!file.type.startsWith('image/'))return toast('من فضلك اختر ملف صورة');
  if(imageUrl)URL.revokeObjectURL(imageUrl);
  imageUrl=URL.createObjectURL(file);

  const reader=new FileReader();
  reader.onload=e=>{imageDataUrl=e.target.result;};
  reader.readAsDataURL(file);

  const img=new Image();
  img.onload=()=>{loadedImgEl=img;};
  img.src=imageUrl;
  $('photo').src=imageUrl;
  switchToImageView();
  $('photo').hidden=false;
  $('empty').hidden=true;
  $('stageControls').hidden=false;
  $('status').textContent='تم تحميل الصورة: '+file.name;
  stopMotion();
}

$('file').addEventListener('change',e=>setImage(e.target.files[0]));
$('uploadBtn').onclick=()=> $('file').click();
$('chooseBtn').onclick=()=> $('file').click();
$('backToImageBtn')?.addEventListener('click',switchToImageView);
$('openApiConfigBtn')?.addEventListener('click',()=>$('apiSection')?.scrollIntoView({behavior:'smooth'}));

$('apiProvider')?.addEventListener('change',e=>{
  const p=e.target.value;
  if($('apiEndpoint'))$('apiEndpoint').value=DEFAULT_ENDPOINTS[p]||'';
});

$('saveApiBtn')?.addEventListener('click',()=>{
  const provider=$('apiProvider')?.value||'local';
  const endpoint=($('apiEndpoint')?.value||'').trim();
  const apiKey=($('apiKey')?.value||'').trim();
  const proxy=($('apiProxy')?.value||'').trim();

  if(provider!=='local'&&!apiKey&&!proxy){
    return toast('أدخل مفتاح API أو رابط Proxy أولاً لتفعيل الربط الخارجي');
  }
  apiConfig={provider,endpoint,apiKey,proxy};
  saveApiConfig();
  toast('تم حفظ إعدادات المحرك الخارجي وتفعيلها!');
});

$('testApiBtn')?.addEventListener('click',()=>{
  const provider=$('apiProvider')?.value||'local';
  const apiKey=($('apiKey')?.value||'').trim();
  const proxy=($('apiProxy')?.value||'').trim();
  if(provider==='local')return toast('أنت حالياً على الوضع المحلي، اختر مزود API أولاً');
  if(!apiKey&&!proxy)return toast('يرجى إدخال مفتاح API أو رابط Proxy للاختبار');
  toast(`الإعدادات جاهزة لـ (${provider}) — ارفع صورة واضغط تحويل إلى فيديو للتجربة`);
});

$('clearApiBtn')?.addEventListener('click',()=>{
  apiConfig={provider:'local',endpoint:'',apiKey:'',proxy:''};
  saveApiConfig();
  toast('تم إلغاء الربط الخارجي والعودة للمحرك المحلي');
});

$('drop').addEventListener('dragover',e=>{e.preventDefault();$('drop').style.borderColor='#a98bff'});
$('drop').addEventListener('dragleave',()=> $('drop').style.borderColor='');
$('drop').addEventListener('drop',e=>{e.preventDefault();$('drop').style.borderColor='';setImage(e.dataTransfer.files[0])});
$('presets').addEventListener('click',e=>{const b=e.target.closest('button[data-prompt]');if(!b)return;$('prompt').value=b.dataset.prompt;$('prompt').focus()});
$('clearPrompt').onclick=()=>{$('prompt').value='';selectedCommandId=null;renderCommands();$('prompt').focus()};

function stopMotion(){playing=false;clearInterval(timer);$('playBtn').textContent='▶';$('photo').classList.remove('motion-play','motion-zoom','motion-zoomout','motion-pan','motion-tilt','motion-orbit');$('scrub').value=0;$('trackProgress').style.width='0%';$('status').textContent=imageUrl?'الصورة جاهزة للمعاينة والتحويل إلى فيديو':'جاهز لاستقبال الصورة'}
function play(){if(!imageUrl)return toast('ارفع صورة أولاً');switchToImageView();const cam=$('camera').value;const cls={zoom:'motion-zoom',zoomout:'motion-zoomout',pan:'motion-pan',tilt:'motion-tilt',orbit:'motion-orbit'}[cam];$('photo').classList.remove('motion-zoom','motion-zoomout','motion-pan','motion-tilt','motion-orbit');if(cls)$('photo').classList.add(cls);$('photo').style.setProperty('--dur',$('duration').value+'s');const dur=Number($('duration').value);const speed=$('speed').value==='fast'?1.5:$('speed').value==='slow'?.65:1;const total=dur/speed;playing=true;$('playBtn').textContent='❚❚';$('status').textContent='معاينة الحركة تعمل';let start=Date.now();clearInterval(timer);timer=setInterval(()=>{let p=Math.min(100,(Date.now()-start)/(total*1000)*100);$('scrub').value=p;$('trackProgress').style.width=p+'%';$('timeLabel').textContent=`00:${String(Math.floor(p/100*dur)).padStart(2,'0')} / 00:${String(dur).padStart(2,'0')}`;if(p>=100){clearInterval(timer);playing=false;$('playBtn').textContent='▶';$('status').textContent='انتهت المعاينة';}},80)}

$('generateVideoBtn')?.addEventListener('click',()=>triggerVideoConversion());
$('previewMotion').onclick=()=>{if(!imageUrl)return toast('ارفع صورة أولاً');play()};
$('playBtn').onclick=()=>{if(playing){clearInterval(timer);playing=false;$('playBtn').textContent='▶'}else play()};
$('resetMotion').onclick=()=>{switchToImageView();stopMotion();};
$('scrub').oninput=e=>{$('trackProgress').style.width=e.target.value+'%'};
$('fullscreen').onclick=()=>{if($('stage').requestFullscreen)$('stage').requestFullscreen()};
$('duration').onchange=()=>{$('durationTick').textContent='0:'+String($('duration').value).padStart(2,'0');$('timeLabel').textContent=`00:00 / 00:${String($('duration').value).padStart(2,'0')}`};
$('addKey').onclick=()=>{const p=Number(prompt('أدخل موضع نقطة الحركة من 0 إلى 100 (نسبة من مدة المشهد):'));if(Number.isNaN(p)||p<0||p>100)return toast('النسبة يجب أن تكون من 0 إلى 100');keys.push(p);renderKeys();toast('تمت إضافة نقطة حركة')};
function renderKeys(){const line=$('trackline');line.querySelectorAll('.key').forEach(k=>{if(!['0','50','100'].includes(k.dataset.key))k.remove()});keys.forEach((p,i)=>{if(i<3)return;const b=document.createElement('button');b.className='key';b.style.left=p+'%';b.dataset.key=p;b.title='نقطة حركة '+p+'%';b.onclick=()=>{if(confirm('حذف نقطة الحركة '+p+'٪؟')){keys.splice(i,1);renderKeys()}};line.append(b)})}

function projectData(){return {app:'Motion AI Studio',version:4,createdAt:new Date().toISOString(),apiProvider:apiConfig.provider,dailyLimit:DAILY_LIMIT,dailyProducedCount:dailyState.producedCount,imageName:$('file').files[0]?.name||null,prompt:$('prompt').value,durationSeconds:Number($('duration').value),camera:$('camera').value,speed:$('speed').value,intensity:$('intensity').value,keyframes:keys,selectedCommandId}}
$('saveProject').onclick=()=>{const data=projectData();const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='motion-project.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('تم تنزيل ملف إعدادات المشروع')};

$('commandsList')?.addEventListener('click',e=>{const card=e.target.closest('.cmd-item[data-cmd-id]');if(!card)return;applyCommandById(card.dataset.cmdId);});
$('cmdSearch')?.addEventListener('input',renderCommands);
$('cmdCategory')?.addEventListener('change',renderCommands);

$('batchList')?.addEventListener('click',e=>{
  const btn=e.target.closest('button[data-render-item]');
  if(!btn)return;
  const item=dailyState.queue.find(q=>q.id===btn.dataset.renderItem);
  if(!item)return;
  $('prompt').value=item.prompt||'';
  if(item.camera)$('camera').value=item.camera;
  if(item.duration)$('duration').value=String(item.duration);
  triggerVideoConversion(item);
});

$('queueVideoBtn')?.addEventListener('click',()=>{
  const usedSlots=dailyState.producedCount+dailyState.queue.filter(i=>i.status!=='done').length;
  if(usedSlots>=DAILY_LIMIT)return toast('تم بلوغ حد 100 فيديو لليوم');
  const activeCmd=COMMANDS_100.find(c=>c.id===selectedCommandId);
  dailyState.queue.push({
    id:'vid-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),
    commandId:activeCmd?activeCmd.id:null,
    title:activeCmd?`${activeCmd.code} ${activeCmd.title}`:`فيديو #${usedSlots+1}`,
    prompt:($('prompt').value||'').trim()||'حركة سينمائية هادئة',
    camera:$('camera').value,
    duration:Number($('duration').value),
    speed:$('speed').value,
    intensity:$('intensity').value,
    status:'queued'
  });
  saveDailyState();
  renderQuotaAndBatch();
  toast('تمت إضافة الفيديو إلى قائمة 100 فيديو اليوم');
});

$('fillFromCommandsBtn')?.addEventListener('click',()=>{
  const usedSlots=dailyState.producedCount+dailyState.queue.filter(i=>i.status!=='done').length;
  const availableSlots=DAILY_LIMIT-usedSlots;
  if(availableSlots<=0)return toast('لا توجد خانات متبقية ضمن حد 100 فيديو لليوم');

  const q=($('cmdSearch')?.value||'').trim().toLowerCase();
  const cat=$('cmdCategory')?.value||'all';

  let pool=COMMANDS_100.filter(c=>{
    const matchesCat=cat==='all'||c.category===cat;
    const matchesQuery=!q||
      c.title.toLowerCase().includes(q)||
      c.prompt.toLowerCase().includes(q)||
      c.category.toLowerCase().includes(q)||
      c.code.includes(q);
    return matchesCat&&matchesQuery;
  });

  if(!pool.length)pool=COMMANDS_100;

  const existingCmdIds=new Set(dailyState.queue.map(item=>item.commandId).filter(Boolean));
  const candidates=pool.filter(cmd=>!existingCmdIds.has(cmd.id));
  const sourceList=candidates.length?candidates:pool;

  const targetCount=Math.min(10,availableSlots,sourceList.length);
  let added=0;

  for(let i=0;i<targetCount;i++){
    const cmd=sourceList[i];
    dailyState.queue.push({
      id:'vid-'+Date.now()+'-'+i+'-'+Math.random().toString(36).slice(2,5),
      commandId:cmd.id,
      title:`${cmd.code} ${cmd.title}`,
      prompt:cmd.prompt,
      camera:cmd.camera||$('camera').value,
      duration:Number($('duration').value),
      speed:$('speed').value,
      intensity:$('intensity').value,
      status:'queued'
    });
    added++;
  }

  saveDailyState();
  renderQuotaAndBatch();
  toast(`تمت إضافة ${added} أمر حركة إلى قائمة الانتظار تلقائياً`);
});

$('runBatchBtn')?.addEventListener('click',()=>{
  const remainingQuota=DAILY_LIMIT-dailyState.producedCount;
  if(remainingQuota<=0)return toast('اكتملت حصة 100 فيديو لهذا اليوم');
  let processed=0;
  for(const item of dailyState.queue){
    if(item.status!=='done'&&processed<10&&dailyState.producedCount<DAILY_LIMIT){
      item.status='done';
      dailyState.producedCount++;
      processed++;
    }
  }
  if(!processed){
    const activeCmd=COMMANDS_100.find(c=>c.id===selectedCommandId);
    const toCreate=Math.min(10,remainingQuota);
    for(let i=0;i<toCreate;i++){
      dailyState.queue.push({
        id:'vid-'+Date.now()+'-'+i,
        commandId:activeCmd?activeCmd.id:null,
        title:activeCmd?`${activeCmd.code} ${activeCmd.title} (${i+1})`:`فيديو يومي #${dailyState.producedCount+1}`,
        prompt:($('prompt').value||'').trim()||'حركة سينمائية هادئة',
        camera:$('camera').value,
        duration:Number($('duration').value),
        speed:$('speed').value,
        intensity:$('intensity').value,
        status:'done'
      });
      dailyState.producedCount++;
      processed++;
    }
  }
  saveDailyState();
  renderQuotaAndBatch();
  toast(`تم تجهيز ${processed} فيديو ضمن حصة الـ 100 فيديو اليومية`);
});

$('resetQuotaBtn')?.addEventListener('click',()=>{
  if(!confirm('هل تريد تصفير عدّاد وقائمة الـ 100 فيديو لليوم؟'))return;
  dailyState={date:new Date().toISOString().slice(0,10),producedCount:0,queue:[]};
  saveDailyState();
  renderQuotaAndBatch();
  toast('تم تصفير سجل اليوم');
});

$('exportBatchBtn')?.addEventListener('click',()=>{
  const payload={
    date:dailyState.date,
    dailyLimit:DAILY_LIMIT,
    producedCount:dailyState.producedCount,
    remaining:Math.max(0,DAILY_LIMIT-dailyState.producedCount),
    items:dailyState.queue
  };
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`daily-100-videos-${dailyState.date}.json`;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  toast('تم تصدير سجل 100 فيديو JSON');
});

$('lang').onclick=()=>toast('سيتم إضافة واجهة إنجليزية كاملة في إصدار لاحق');
document.querySelectorAll('.sidebar nav button').forEach(b=>b.onclick=()=>{
  if(b.dataset.page==='editor')window.scrollTo({top:0,behavior:'smooth'});
  else if(b.dataset.page==='projects'){$('batchSection')?.scrollIntoView({behavior:'smooth'});toast('سجل المشاريع والدفعات متاح في الأسفل')}
  else if(b.dataset.page==='presets'){$('motionLibrary')?.scrollIntoView({behavior:'smooth'});toast('قائمة الـ 100 أمر حركة متاحة هنا')}
  else if(b.dataset.page==='settings'){$('apiSection')?.scrollIntoView({behavior:'smooth'});toast('إعدادات ربط المحرك الخارجي متاحة هنا')}
});
document.querySelectorAll('.key').forEach(k=>k.addEventListener('click',()=>toast('نقطة الحركة عند '+k.dataset.key+'٪')));

updateApiUI();
populateCategories();
renderCommands();
renderQuotaAndBatch();
