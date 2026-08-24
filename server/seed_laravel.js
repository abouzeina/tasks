const db = require('./database');
const crypto = require('crypto');

function seedLaravelPlan() {
  console.log('Seeding 30-Day Laravel Bootcamp Plan...');

  // 1. Ensure Laravel Track exists
  const trackId = 'laravel-bootcamp';
  db.prepare(`
    INSERT OR REPLACE INTO categories (id, name_ar, name_en, color, icon)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    trackId,
    'مسار تعلم واحتراف لارافيل (Bootcamp 30 يوم)',
    'Laravel 30-Day Bootcamp',
    '#f43f5e',
    'Code'
  );

  // 2. Prepare 30-day task definitions
  const days = [
    {
      dayNum: 1,
      title: 'اليوم 1 — Requirements والتفكير قبل الكود (فيديوهات 77–80)',
      description: 'المرحلة الأولى — مشروع الكورس بعمق. هدف اليوم: تتعلم تبدأ مشروع من Requirement، مش من php artisan. ممنوع اليوم: تبدأ Database أو تنسخ تصميم المنتور.',
      priority: 'high',
      subtasks: [
        'مراجعة سريعة للـLaravel request lifecycle: Route → Middleware → Controller → Model → DB → Response (30د)',
        'مشاهدة وتدوين ملاحظات فيديوهات 77–79 (40د)',
        'مشاهدة فيديو 80 وفهم الـ Requirements (50د)',
        'كتابة الـActors والـFeatures والـEntities المتوقعة للمشروع قبل رؤية التصميم (40د)',
        'تحويل الـFeatures إلى Models مبدئية (40د)',
        'تدريب: لكل Model اكتب البيانات المتوقعة والعلاقات (40د)',
        'شرح فكرة المشروع ومعماريته بنفسك من دماغك (20د)'
      ]
    },
    {
      dayNum: 2,
      title: 'اليوم 2 — System Design + Database Design (فيديوهات 81–84)',
      description: 'تصميم الـ ERD والـ Workflow وفهم أسباب الـ Foreign Keys وعلاقات الـ One-to-Many وغيرها.',
      priority: 'high',
      subtasks: [
        'محاولة رسم ERD بنفسك قبل فيديو 82 (30د)',
        'مشاهدة فيديو 81 ومقارنة تصميمك بتصميم المنتور (35د)',
        'مشاهدة فيديو 82 ERD وتطبيقه (50د)',
        'مشاهدة فيديو 83 Workflow وفهم تدفق البيانات (20د)',
        'مشاهدة فيديو 84 Architecture وفهم الهيكلية (35د)',
        'إعادة رسم الـERD بدون الفيديو للتأكد من الفهم (50د)',
        'كتابة العلاقات بصيغة Laravel: hasMany, belongsTo, إلخ (40د)',
        'Challenge: إجابة أسئلة أسباب اختيار الـ FKs ونوع العلاقات (20د)'
      ]
    },
    {
      dayNum: 3,
      title: 'اليوم 3 — Models + Migrations (فيديوهات 85–87)',
      description: 'يوم Database ثقيل ومهم جداً لربط الـ ERD بالـ Migrations وقيود الجداول.',
      priority: 'urgent',
      subtasks: [
        'مراجعة Model, Migration, $fillable, timestamps (20د)',
        'مشاهدة وتطبيق فيديوهات 85–86 (45د)',
        'محاولة كتابة migrations بنفسك من الـERD قبل فيديو 87 (50د)',
        'مشاهدة فيديو 87 ومقارنة الكود (40د)',
        'تشغيل migrate:fresh وتجارب تعديل migrations (45د)',
        'تدريب على Foreign Keys والـ Constraints (40د)',
        'فتح Tinker وإنشاء وقراءة Models يدويًا (40د)'
      ]
    },
    {
      dayNum: 4,
      title: 'اليوم 4 — Seeders + Authentication (فيديوهات 88–89)',
      description: 'فهم الـ Seeders والـ Factories وعملية الـ Login والـ Session Authentication.',
      priority: 'high',
      subtasks: [
        'مراجعة الفرق بين Factory vs Seeder واستخدام Faker (30د)',
        'مشاهدة 88 وتطبيق الـ Seeders (40د)',
        'مشاهدة 89 Login (30د)',
        'إعادة كتابة Seeder بدون الفيديو (40د)',
        'مراجعة Session Authentication عملياً (attempt, check, user, id, logout) (50د)',
        'تجربة تسجيل الدخول: صحيح / خاطئ / Guest (30د)',
        'Task التحدي في الـ Authentication وفهم الـ Sessions (40د)'
      ]
    },
    {
      dayNum: 5,
      title: 'اليوم 5 — Blade + Layout + Routing (فيديوهات 90–92)',
      description: 'الهدف: أن تصبح حلقة Blade + Controller + Route + Data واضحة وبديهية.',
      priority: 'medium',
      subtasks: [
        'مراجعة Blade Components والـ Layouts (30د)',
        'مشاهدة وتطبيق فيديوهات 90–91 (45د)',
        'مشاهدة فيديو 92 (30د)',
        'قفل الفيديو وبناء صفحة List مشابهة من الصفر (45د)',
        'مراجعة Route names + route() + Resource Routes (40د)',
        'تمرين عملي على Route Model Binding (30د)',
        'تعديل الـUI بلمسة مخصصة من عندك (40د)'
      ]
    },
    {
      dayNum: 6,
      title: 'اليوم 6 — أول CRUD كامل: Category (فيديوهات 93–95)',
      description: 'يوم حاسم لإتقان CRUD lifecycle بالكامل (index, create, store, edit, update, destroy/archive) بدون حفظ أعمى.',
      priority: 'urgent',
      subtasks: [
        'تطبيق Create مع المنتور (45د)',
        'تطبيق Update (25د)',
        'تطبيق Soft Delete (25د)',
        'مراجعة CRUD lifecycle نظرياً وعملياً (20د)',
        'مسح التغييرات وإعادة كتابة Category CRUD كامل بنفسك بدون فيديو (90د)',
        'تطبيق Form Validation + old() + رسائل الأخطاء errors (35د)',
        'شرح ومراجعة تدفق Create / Update / Delete (20د)'
      ]
    },
    {
      dayNum: 7,
      title: 'اليوم 7 — CRUD بدون مسك الإيد: Company (فيديوهات 96–100)',
      description: 'تقليل الاعتماد على الفيديوهات: حاول بنفسك في Show و Create و Update قبل مشاهدة الحل.',
      priority: 'high',
      subtasks: [
        'مشاهدة List فقط من فيديو 96 (20د)',
        'قفل الكورس وبناء Show + Create بنفسك (60د)',
        'مشاهدة 97–98 ومقارنة الكود (20د)',
        'محاولة بناء Update + Archive بنفسك (45د)',
        'مشاهدة 99–100 وإصلاح الاختلافات (45د)',
        'إضافة Validation مخصص من عندك (40د)',
        'Challenge: إضافة حقل جديد للشركة من Migration حتى View (30د)'
      ]
    },
    {
      dayNum: 8,
      title: 'اليوم 8 — Relationships + Vacancy CRUD (فيديوهات 101–105)',
      description: 'تثبيت مفاهيم belongsTo و hasMany وتطبيق Eager Loading لتفادي مشكلة N+1.',
      priority: 'high',
      subtasks: [
        'مراجعة العلاقات المرتبطة بالـ Vacancy (20د)',
        'مشاهدة فيديوهات 101–102 (20د)',
        'محاولة بناء Create بنفسك قبل فيديو 103 (60د)',
        'مشاهدة 103 ومقارنة الكود (20د)',
        'محاولة بناء Update + Archive بنفسك (40د)',
        'مشاهدة 104–105 وتدقيق الكود (20د)',
        'مراجعة تطبيقية للـ Eager Loading وتجنب N+1 Query Problem (40د)',
        'تجارب Tinker على العلاقات والتحقق منها (40د)'
      ]
    },
    {
      dayNum: 9,
      title: 'اليوم 9 — Applications + Users (فيديوهات 106–110)',
      description: 'فهم الـ Application كـ Resource وإدارة المستخدمين والـ Soft Deletes.',
      priority: 'medium',
      subtasks: [
        'فهم Application كـ Resource وعلاقاته (30د)',
        'مشاهدة وتطبيق 106–109 (50د)',
        'مشاهدة 110 (20د)',
        'إعادة بناء List/Show/Update للتطبيق الوظيفي بدون الفيديو (50د)',
        'تطبيق Route Model Binding المتقدم (40د)',
        'تطبيق Soft Deletes واسترجاع/عرض البيانات المؤرشفة (40د)',
        'إنجاز Challenge إدارة المستخدمين (30د)'
      ]
    },
    {
      dayNum: 10,
      title: 'اليوم 10 — Analytics + Authorization (فيديوهات 111–115)',
      description: 'يوم أساسي: التفريق الحاسم بين Authentication / Role / Ownership / Authorization.',
      priority: 'urgent',
      subtasks: [
        'تصميم 3 إحصائيات للمشروع بنفسك قبل الفيديو (20د)',
        'مشاهدة وتطبيق 111–112 (50د)',
        'مشاهدة وتطبيق 113 Role Middleware (20د)',
        'مشاهدة وتطبيق 114 Ownership Policy (45د)',
        'مشاهدة 115 (20د)',
        'بناء مصفوفة الصلاحيات (Admin, Company Owner, User, Guest) (45د)',
        'تجربة الروابط يدويًا بحسابات وأدوار مختلفة (40د)',
        'تطبيق Challenge إضافة صلاحية جديدة واختبارها (40د)'
      ]
    },
    {
      dayNum: 11,
      title: 'اليوم 11 — User App + Authentication (فيديوهات 116–120)',
      description: 'بناء واجهة المستخدم وتجربة التسجيل ولوحة التحكم وعزل البيانات.',
      priority: 'medium',
      subtasks: [
        'مشاهدة 116–117 وفهم إعادة استخدام Models (30د)',
        'مشاهدة وتطبيق 118 (35د)',
        'مشاهدة 119 Login/Signup وتطبيقه (30د)',
        'مشاهدة 120 Dashboard وتطبيقه (30د)',
        'إعادة بناء جزء Auth بنفسك من الصفر (45د)',
        'اختبار الـ Validation وتجربة الحالات الفاشلة (40د)',
        'إنشاء حسابين واختبار عزل البيانات لكل واحد (40د)',
        'مراجعة Sessions / Cookies / Middleware (30د)'
      ]
    },
    {
      dayNum: 12,
      title: 'اليوم 12 — Search + Filter + Application Flow (فيديوهات 121–123)',
      description: 'يوم Coding مكثف: بناء البحث والفلترة وتدفق التقديم الكامل ومعالجة الحالات الحدية.',
      priority: 'high',
      subtasks: [
        'مشاهدة فيديو 121 (35د)',
        'بناء فلتر بحث إضافي بنفسك (60د)',
        'مشاهدة وتطبيق 122 (30د)',
        'مشاهدة وتطبيق 123 (35د)',
        'إعادة بناء Apply Flow بدون الفيديو (50د)',
        'معالجة Validation وتفادي التقديم المكرر (Duplicate Application) (40د)',
        'تطبيق Pagination والحفاظ على Query Parameters (30د)',
        'اختبار يدوي شامل لكل حالات التقديم (20د)'
      ]
    },
    {
      dayNum: 13,
      title: 'اليوم 13 — Files + AI Integration (فيديوهات 124–130)',
      description: 'رفع ومعالجة الملفات في Laravel والتكامل مع الـ AI Architecture.',
      priority: 'high',
      subtasks: [
        'مشاهدة وتطبيق 124–125 (50د)',
        'مشاهدة وتطبيق 126–127 (65د)',
        'مشاهدة وتطبيق 128–130 (65د)',
        'مراجعة دورة File Upload كاملة: Validation → Storage → Path → DB (40د)',
        'التعامل مع حالات فشل رفع الملفات وأخطاء الشبكة (30د)',
        'فهم وشرح معمارية الـ AI Integration (30د)'
      ]
    },
    {
      dayNum: 14,
      title: 'اليوم 14 — إنهاء User App + Testing (فيديوهات 131–136)',
      description: 'كتابة الاختبارات الآلية باستخدام Pest وفحص التطبيق واكتشاف الثغرات.',
      priority: 'urgent',
      subtasks: [
        'مشاهدة وتطبيق 131–133 (25د)',
        'مراجعة شاملة لجميع الـ Roles والصلاحيات (30د)',
        'مشاهدة 134 (20د)',
        'مشاهدة وتطبيق 135 Pest Testing (35د)',
        'مشاهدة 136 (10د)',
        'كتابة Tests بنفسك لعمليات المشروع (60د)',
        'اختبار Validation و Auth و Authorization آلياً (40د)',
        'كسر التطبيق عمداً للتأكد من فشل Test ثم إصلاحه (40د)',
        'تدوين قائمة بالنقاط الضعيفة لمعالجتها (20د)'
      ]
    },
    {
      dayNum: 15,
      title: 'اليوم 15 — Deployment + امتحان مشروع الكورس (فيديوهات 137–142)',
      description: 'نشر المشروع الأول وفهم إعدادات السيرفر، وإنهاء الكورس بامتحان شامل.',
      priority: 'urgent',
      subtasks: [
        'مشاهدة 137–139 وتطبيق خطوات النشر (60د)',
        'فهم فيديوهات 140–142 (50د)',
        'مراجعة .env و Production Config وقاعدة البيانات و Git (30د)',
        'مراجعة المشروع كاملاً بدون فيديوهات (60د)',
        'أداء الامتحان الشامل لمشروع الكورس (60د)',
        'إصلاح أي نقاط ضعف كشفها الامتحان (40د)'
      ]
    },
    {
      dayNum: 16,
      title: 'اليوم 16 — مشروع 1 مستقل: Requirements + ERD',
      description: 'المرحلة الثانية: انطلاق مشروعك الأول المستقل بدون فيديوهات (Project/Task Management System).',
      priority: 'high',
      subtasks: [
        'كتابة المتطلبات والـ Actors والـ Features بالتفصيل (60د)',
        'رسم ERD كامل لقاعدة البيانات وتحديد الجداول والـ FKs (90د)',
        'مراجعة وتدقيق معمارية المشروع والعلاقات (50د)',
        'إعداد مستودع Git للمشروع الجديد (40د)'
      ]
    },
    {
      dayNum: 17,
      title: 'اليوم 17 — مشروع 1 مستقل: Setup + DB Migrations',
      description: 'تجهيز المشروع الجديد والـ Migrations والـ Models والـ Factories والـ Seeders.',
      priority: 'high',
      subtasks: [
        'إنشاء مشروع Laravel جديد وضبط الإعدادات (45د)',
        'كتابة جميع الـ Migrations والقيود والعلاقات (90د)',
        'كتابة الـ Models وعلاقات Eloquent (60د)',
        'تجهيز Factories و Seeders ببيانات وهمية للتجربة (45د)'
      ]
    },
    {
      dayNum: 18,
      title: 'اليوم 18 — مشروع 1 مستقل: Authentication + Roles',
      description: 'بناء نظام تسجيل الدخول وتوزيع الصلاحيات وعزل البيانات للمستخدمين.',
      priority: 'high',
      subtasks: [
        'بناء واجهات ومنطق التسجيل وتسجيل الدخول (60د)',
        'بناء Role Middleware وتخصيص صلاحيات الأدوار (75د)',
        'اختبار تسجيل حسابات متعددة وعزل الجلسات (45د)',
        'إعداد Layouts و Blade Components الأساسية (60د)'
      ]
    },
    {
      dayNum: 19,
      title: 'اليوم 19 — مشروع 1 مستقل: Core CRUD #1 (Projects & Teams)',
      description: 'بناء إدارة المشاريع والفرق بالكامل بدون كورس مع تدقيق الـ Validation.',
      priority: 'high',
      subtasks: [
        'بناء Projects Controller بجميع الـ Actions (90د)',
        'كتابة Form Requests وقواعد Validation متينة (50د)',
        'تصميم شاشات الـ Blade لإدارة المشاريع (60د)',
        'اختبار شامل للـ CRUD والتأكد من استقرار العمليات (40د)'
      ]
    },
    {
      dayNum: 20,
      title: 'اليوم 20 — مشروع 1 مستقل: Core CRUD #2 (Tasks & Subtasks)',
      description: 'بناء نظام المهام والمهام الفرعية وتغيير الحالات مع الـ Soft Deletes.',
      priority: 'high',
      subtasks: [
        'بناء Tasks Controller وإدارة الـ Subtasks (90د)',
        'إضافة منطق تغيير الحالة وتحديث الأولويات (60د)',
        'تصميم واجهات عرض وتعديل المهام (50د)',
        'تطبيق Soft Deletes والتعامل مع البيانات المؤرشفة (40د)'
      ]
    },
    {
      dayNum: 21,
      title: 'اليوم 21 — مشروع 1 مستقل: Relationships & Eloquent Mastery',
      description: 'ربط الجداول بعلاقات عميقة وتطبيق Eager Loading و Scopes باحترافية.',
      priority: 'high',
      subtasks: [
        'ربط المهام بالمشاريع والمستخدمين (60د)',
        'كتابة Eloquent Scopes للمهام والمشاريع (60د)',
        'تطبيق Eager Loading وتجنب مشكلة N+1 (60د)',
        'تجارب Tinker للتأكد من كفاءة الاستعلامات (60د)'
      ]
    },
    {
      dayNum: 22,
      title: 'اليوم 22 — مشروع 1 مستقل: Authorization & Policies',
      description: 'تأمين المشروع كاملاً بسياسات الحماية (Policies) وقفل الوصول غير المصرح به.',
      priority: 'urgent',
      subtasks: [
        'إنشاء ProjectPolicy و TaskPolicy (75د)',
        'منع تعديل أو حذف البيانات إلا لأصحابها أو الأدمن (60د)',
        'إخفاء الأزرار والإجراءات غير المصرح بها في Blade (45د)',
        'محاولات اختراق واختبار ثغرات الروابط يدوياً (60د)'
      ]
    },
    {
      dayNum: 23,
      title: 'اليوم 23 — مشروع 1 مستقل: Search, Filter, Files & Dashboard',
      description: 'بناء البحث والفلترة ومرفقات الملفات ولوحة الإحصائيات الشاملة.',
      priority: 'medium',
      subtasks: [
        'بناء محرك البحث والفلترة عبر الـ Query Strings (75د)',
        'ميزة رفع المرفقات والملفات للمهام (60د)',
        'بناء Dashboard بإحصائيات حية ونسب إنجاز (60د)',
        'تطبيق Pagination لجميع القوائم (45د)'
      ]
    },
    {
      dayNum: 24,
      title: 'اليوم 24 — مشروع 1 مستقل: Automated Testing & Refactoring',
      description: 'كتابة اختبارات Pest الشاملة وإعادة هيكلة الكود (Clean Code).',
      priority: 'high',
      subtasks: [
        'كتابة Tests لعمليات الـ Auth والـ Permissions (75د)',
        'كتابة Tests للـ CRUD والـ Validation (75د)',
        'Refactoring وتحسين بنية الكود وتطبيق Clean Code (60د)',
        'تشغيل الاختبارات والتأكد من نجاحها بالكامل (30د)'
      ]
    },
    {
      dayNum: 25,
      title: 'اليوم 25 — مشروع 1 مستقل: Bug Fixing, Optimization & Deployment',
      description: 'فحص نهائي ومعالجة الأخطاء ونشر أول مشروع مستقل بالكامل! 🎉',
      priority: 'urgent',
      subtasks: [
        'فحص Edge Cases وإصلاح أي Bugs (60د)',
        'تحسين الأداء وضبط الـ Caching (45د)',
        'نشر المشروع (Deployment) وتجهيز ملف README جذاب (90د)',
        'مراجعة إنجاز المشروع المستقل والاحتفال! 🎉 (45د)'
      ]
    },
    {
      dayNum: 26,
      title: 'اليوم 26 — مشروع 2 سريع: Requirements + Database Setup',
      description: 'المرحلة الثالثة: مشروع ثانٍ سريع ومكثف (Booking / Courses System) لتثبيت الثقة والسرعة.',
      priority: 'high',
      subtasks: [
        'تفريغ متطلبات المشروع الثاني في 30 دقيقة (30د)',
        'رسم ERD سريع وإنشاء Migrations و Models (90د)',
        'إعداد Seeders وتوليد بيانات واقعية (60د)',
        'إعداد الـ Routes والـ Layouts الأساسية (60د)'
      ]
    },
    {
      dayNum: 27,
      title: 'اليوم 27 — مشروع 2 سريع: Core Logic & Relationships',
      description: 'بناء المنطق الأساسي والعلاقات وإدارة العمليات بسرعة واحتراف.',
      priority: 'high',
      subtasks: [
        'بناء الـ Controllers الرئيسية والـ Requests (90د)',
        'برمجة منطق الحجز/التسجيل والتحقق من التوفر (75د)',
        'تصميم واجهات سريعة وأنيقة للمستخدم (45د)',
        'تجربة وتدقيق التدفق الأساسي للعمليات (30د)'
      ]
    },
    {
      dayNum: 28,
      title: 'اليوم 28 — مشروع 2 سريع: Auth, Policies & Advanced Features',
      description: 'إضافة الصلاحيات والـ Policies والميزات التكميلية ومعالجة الأخطاء.',
      priority: 'high',
      subtasks: [
        'تطبيق Authentication و Policies الصلاحيات (75د)',
        'إضافة ميزات الفلترة، الإشعارات، والملفات (75د)',
        'اختبار كل سيناريوهات المستخدمين والصلاحيات (50د)',
        'مراجعة الـ Errors والـ Logs (40د)'
      ]
    },
    {
      dayNum: 29,
      title: 'اليوم 29 — مشروع 2 سريع: Testing & Code Quality',
      description: 'كتابة الاختبارات السريعة ومراجعة جودة وأمان الكود.',
      priority: 'high',
      subtasks: [
        'كتابة Feature Tests للعمليات الحساسة (90د)',
        'تدقيق الأمان والـ Injection / XSS (60د)',
        'تنظيف وتحسين الكود وإعادة التسمية (60د)',
        'تشغيل كافة الاختبارات والتأكد من اجتيازها (30د)'
      ]
    },
    {
      dayNum: 30,
      title: 'اليوم 30 — Deployment + Final Mastery Review & Career Prep',
      description: 'نشر المشروع الثاني، مراجعة شهر الـ Bootcamp كاملاً، والجاهزية لسوق العمل و Advanced Laravel! 🚀',
      priority: 'urgent',
      subtasks: [
        'نشر المشروع الثاني وتجهيز روابط الـ Portfolio على GitHub (60د)',
        'مراجعة شاملة لجميع المفاهيم والمعارف المكتسبة في الـ 30 يوم (60د)',
        'وضع خطة مواضيع Advanced Laravel (Queues, Events, APIs, Cache, Docker) (60د)',
        'تجهيز السيرة الذاتية والاستعداد لمقابلات العمل والانطلاق بقوة! 🚀 (60د)'
      ]
    }
  ];

  // Insert all 30 days starting from today
  const baseDate = new Date(); // today
  const insertTask = db.prepare(`
    INSERT INTO tasks (id, title, description, category_id, priority, due_date, completed, order_index)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
  `);

  const insertSubtask = db.prepare(`
    INSERT INTO subtasks (id, task_id, title, completed)
    VALUES (?, ?, ?, 0)
  `);

  const insertHabit = db.prepare(`
    INSERT OR IGNORE INTO habits (id, name_ar, name_en, category_id, color, icon)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Add Laravel daily commitment habit
  insertHabit.run(
    'habit-laravel-4hours',
    'جلسة كود لارافيل اليومية (4 ساعات)',
    '4 Hours Daily Laravel Coding',
    trackId,
    '#f43f5e',
    'Code'
  );

  const transaction = db.transaction(() => {
    // Delete existing laravel tasks if any
    db.prepare('DELETE FROM tasks WHERE category_id = ?').run(trackId);

    days.forEach((day, index) => {
      const taskId = `task-laravel-day-${day.dayNum}`;
      
      const dueDateObj = new Date(baseDate);
      dueDateObj.setDate(baseDate.getDate() + index);
      const dueDateStr = dueDateObj.toISOString().split('T')[0];

      insertTask.run(
        taskId,
        day.title,
        day.description,
        trackId,
        day.priority,
        dueDateStr,
        day.dayNum
      );

      day.subtasks.forEach((subTitle) => {
        const subId = 'sub-' + crypto.randomUUID();
        insertSubtask.run(subId, taskId, subTitle);
      });
    });
  });

  transaction();
  console.log('✅ Successfully seeded 30 days of Laravel Bootcamp tasks with full subtasks and track!');
}

seedLaravelPlan();
