export const SUPPORTED_EMAIL_LANGS = ["es", "en", "zh", "hi", "ar"] as const;
export type EmailLang = (typeof SUPPORTED_EMAIL_LANGS)[number];

export const DEFAULT_EMAIL_LANG: EmailLang = "es";

export function isEmailLang(value: unknown): value is EmailLang {
  return (
    typeof value === "string" &&
    (SUPPORTED_EMAIL_LANGS as readonly string[]).includes(value)
  );
}

interface WelcomeWithSubscriptionStrings {
  subject: string;
  greeting: (name: string) => string;
  body: (planLabel: string, expiryDate?: string) => string;
  passwordLine: (password: string) => string;
  buttonText: string;
}

interface SubscriptionChangeStrings {
  greeting: (name: string) => string;
  intro: string;
  buttonText: string;
  planFreeFallback: string;
  planAdminAssigned: string;
  defaultSubject: string;
  subjectByStatus: Record<string, string>;
  statusMessage: (status: string, renewalDate?: string) => string;
}

const WELCOME_WITH_SUBSCRIPTION: Record<EmailLang, WelcomeWithSubscriptionStrings> = {
  es: {
    subject: "¡Bienvenido a Bisbi!",
    greeting: (name) => `Hola ${name},`,
    body: (planLabel, expiryDate) =>
      `Se creó una cuenta para vos en Bisbi con el plan ${planLabel}${expiryDate ? `, válida hasta ${expiryDate}` : ""}.`,
    passwordLine: (password) =>
      `Tu contraseña es ${password}. También podés iniciar sesión con Google usando este mismo email.`,
    buttonText: "Acceder a tu cuenta",
  },
  en: {
    subject: "Welcome to Bisbi!",
    greeting: (name) => `Hi ${name},`,
    body: (planLabel, expiryDate) =>
      `An account has been created for you on Bisbi with the ${planLabel} plan${expiryDate ? `, valid until ${expiryDate}` : ""}.`,
    passwordLine: (password) =>
      `Your password is ${password}. You can also sign in with Google using this same email.`,
    buttonText: "Access your account",
  },
  zh: {
    subject: "欢迎来到 Bisbi！",
    greeting: (name) => `你好 ${name}，`,
    body: (planLabel, expiryDate) =>
      `已经为你在 Bisbi 创建了账户，订阅计划为 ${planLabel}${expiryDate ? `，有效期至 ${expiryDate}` : ""}。`,
    passwordLine: (password) =>
      `你的密码是 ${password}。你也可以使用相同的邮箱通过 Google 登录。`,
    buttonText: "进入你的账户",
  },
  hi: {
    subject: "Bisbi में आपका स्वागत है!",
    greeting: (name) => `नमस्ते ${name},`,
    body: (planLabel, expiryDate) =>
      `Bisbi पर आपके लिए ${planLabel} प्लान के साथ एक खाता बनाया गया है${expiryDate ? `, जो ${expiryDate} तक मान्य है` : ""}।`,
    passwordLine: (password) =>
      `आपका पासवर्ड ${password} है। आप इसी ईमेल से Google के ज़रिए भी साइन इन कर सकते हैं।`,
    buttonText: "अपने खाते में जाएं",
  },
  ar: {
    subject: "مرحباً بك في Bisbi!",
    greeting: (name) => `مرحباً ${name}،`,
    body: (planLabel, expiryDate) =>
      `تم إنشاء حساب لك في Bisbi بخطة ${planLabel}${expiryDate ? `، صالحة حتى ${expiryDate}` : ""}.`,
    passwordLine: (password) =>
      `كلمة المرور الخاصة بك هي ${password}. يمكنك أيضاً تسجيل الدخول عبر Google باستخدام نفس البريد الإلكتروني.`,
    buttonText: "الوصول إلى حسابك",
  },
};

const SUBSCRIPTION_CHANGE: Record<EmailLang, SubscriptionChangeStrings> = {
  es: {
    greeting: (name) => `Hola ${name},`,
    intro: "Te avisamos sobre un cambio en tu suscripción de Bisbi.",
    buttonText: "Ver detalles en tu cuenta",
    planFreeFallback: "Gratis",
    planAdminAssigned: "Asignado por administrador",
    defaultSubject: "Actualización de tu suscripción",
    subjectByStatus: {
      active: "Tu suscripción de Bisbi está activa",
      trialing: "Empezó tu prueba de Bisbi",
      canceled: "Tu suscripción de Bisbi fue cancelada",
      canceling: "Se programó la cancelación de tu suscripción de Bisbi",
      plan_changed: "Tu plan de Bisbi se cambió",
      unpaid: "Hubo un problema con el pago de tu suscripción de Bisbi",
      expired: "Tu suscripción de Bisbi expiró",
    },
    statusMessage: (status, renewalDate) => {
      switch (status) {
        case "active":
          return "Tu suscripción está activa y funcionando correctamente.";
        case "canceled":
          return "Tu suscripción fue cancelada. Podés volver a suscribirte cuando quieras desde tu panel.";
        case "canceling":
          return `Se programó la cancelación de tu suscripción. Vas a seguir teniendo acceso hasta ${renewalDate || "el final de tu período de facturación"}. Después de esa fecha, tu suscripción se va a cancelar.`;
        case "plan_changed":
          return "Tu plan se cambió correctamente. Tu nuevo plan ya está activo.";
        case "trialing":
          return "Estás en un período de prueba.";
        case "unpaid":
          return "Hubo un problema con el pago de tu suscripción. Por favor, actualizá tu método de pago.";
        case "past_due":
          return "El pago de tu suscripción está vencido. Por favor, actualizá tu método de pago.";
        case "incomplete":
          return "La configuración de tu suscripción está incompleta. Por favor, completá el proceso de pago.";
        case "incomplete_expired":
          return "La configuración de tu suscripción expiró. Por favor, reiniciá el proceso de suscripción.";
        case "expired":
          return "Tu suscripción expiró. Volvé a suscribirte desde tu panel para recuperar el acceso.";
        default:
          return `El estado actual de tu suscripción es: ${status}`;
      }
    },
  },
  en: {
    greeting: (name) => `Hi ${name},`,
    intro: "We're informing you about a change in your Bisbi subscription.",
    buttonText: "View details in your account",
    planFreeFallback: "Free",
    planAdminAssigned: "Admin Assigned",
    defaultSubject: "Subscription update",
    subjectByStatus: {
      active: "Your Bisbi subscription is active",
      trialing: "Your Bisbi trial has started",
      canceled: "Your Bisbi subscription has been canceled",
      canceling: "Your Bisbi subscription cancellation has been scheduled",
      plan_changed: "Your Bisbi plan has been changed",
      unpaid: "There was a payment issue with your Bisbi subscription",
      expired: "Your Bisbi subscription has expired",
    },
    statusMessage: (status, renewalDate) => {
      switch (status) {
        case "active":
          return "Your subscription is active and working properly.";
        case "canceled":
          return "Your subscription has been canceled. You can resubscribe at any time from your dashboard.";
        case "canceling":
          return `Your subscription cancellation has been scheduled. You will continue to have access until ${renewalDate || "the end of your billing period"}. After that, your subscription will be canceled.`;
        case "plan_changed":
          return "Your plan has been successfully changed. Your new plan is now active.";
        case "trialing":
          return "You are currently in a trial period.";
        case "unpaid":
          return "There was a payment issue with your subscription. Please update your payment method.";
        case "past_due":
          return "Your subscription payment is past due. Please update your payment method.";
        case "incomplete":
          return "Your subscription setup is incomplete. Please complete the payment process.";
        case "incomplete_expired":
          return "Your subscription setup has expired. Please restart the subscription process.";
        case "expired":
          return "Your subscription has expired. Resubscribe from your dashboard to regain access.";
        default:
          return `Your current subscription status is: ${status}`;
      }
    },
  },
  zh: {
    greeting: (name) => `你好 ${name}，`,
    intro: "我们想通知你 Bisbi 订阅的变更。",
    buttonText: "在你的账户中查看详情",
    planFreeFallback: "免费",
    planAdminAssigned: "管理员分配",
    defaultSubject: "订阅更新",
    subjectByStatus: {
      active: "你的 Bisbi 订阅已激活",
      trialing: "你的 Bisbi 试用已开始",
      canceled: "你的 Bisbi 订阅已取消",
      canceling: "你的 Bisbi 订阅取消已安排",
      plan_changed: "你的 Bisbi 计划已更改",
      unpaid: "你的 Bisbi 订阅付款出现问题",
      expired: "你的 Bisbi 订阅已过期",
    },
    statusMessage: (status, renewalDate) => {
      switch (status) {
        case "active":
          return "你的订阅已激活并正常运行。";
        case "canceled":
          return "你的订阅已取消。你可以随时从控制台重新订阅。";
        case "canceling":
          return `你的订阅取消已安排。你将继续访问，直到 ${renewalDate || "计费周期结束"}。之后你的订阅将被取消。`;
        case "plan_changed":
          return "你的计划已成功更改。新计划现已激活。";
        case "trialing":
          return "你目前处于试用期。";
        case "unpaid":
          return "你的订阅付款出现问题。请更新你的付款方式。";
        case "past_due":
          return "你的订阅付款已逾期。请更新你的付款方式。";
        case "incomplete":
          return "你的订阅设置不完整。请完成付款流程。";
        case "incomplete_expired":
          return "你的订阅设置已过期。请重新开始订阅流程。";
        case "expired":
          return "你的订阅已过期。从控制台重新订阅以恢复访问。";
        default:
          return `你当前的订阅状态是：${status}`;
      }
    },
  },
  hi: {
    greeting: (name) => `नमस्ते ${name},`,
    intro: "हम आपको आपकी Bisbi सदस्यता में बदलाव के बारे में सूचित कर रहे हैं।",
    buttonText: "अपने खाते में विवरण देखें",
    planFreeFallback: "फ्री",
    planAdminAssigned: "एडमिन द्वारा असाइन किया गया",
    defaultSubject: "सदस्यता अपडेट",
    subjectByStatus: {
      active: "आपकी Bisbi सदस्यता सक्रिय है",
      trialing: "आपका Bisbi ट्रायल शुरू हो गया है",
      canceled: "आपकी Bisbi सदस्यता रद्द कर दी गई है",
      canceling: "आपकी Bisbi सदस्यता रद्द करना शेड्यूल किया गया है",
      plan_changed: "आपका Bisbi प्लान बदल दिया गया है",
      unpaid: "आपकी Bisbi सदस्यता के भुगतान में समस्या थी",
      expired: "आपकी Bisbi सदस्यता समाप्त हो गई है",
    },
    statusMessage: (status, renewalDate) => {
      switch (status) {
        case "active":
          return "आपकी सदस्यता सक्रिय है और सही तरीके से काम कर रही है।";
        case "canceled":
          return "आपकी सदस्यता रद्द कर दी गई है। आप कभी भी अपने डैशबोर्ड से फिर से सदस्यता ले सकते हैं।";
        case "canceling":
          return `आपकी सदस्यता रद्द करना शेड्यूल किया गया है। आपको ${renewalDate || "अपने बिलिंग अवधि के अंत"} तक एक्सेस मिलता रहेगा। उसके बाद आपकी सदस्यता रद्द कर दी जाएगी।`;
        case "plan_changed":
          return "आपका प्लान सफलतापूर्वक बदल दिया गया है। आपका नया प्लान अब सक्रिय है।";
        case "trialing":
          return "आप अभी ट्रायल अवधि में हैं।";
        case "unpaid":
          return "आपकी सदस्यता के भुगतान में समस्या थी। कृपया अपना भुगतान तरीका अपडेट करें।";
        case "past_due":
          return "आपकी सदस्यता का भुगतान देय है। कृपया अपना भुगतान तरीका अपडेट करें।";
        case "incomplete":
          return "आपकी सदस्यता सेटअप अधूरा है। कृपया भुगतान प्रक्रिया पूरी करें।";
        case "incomplete_expired":
          return "आपकी सदस्यता सेटअप समाप्त हो गया है। कृपया सदस्यता प्रक्रिया फिर से शुरू करें।";
        case "expired":
          return "आपकी सदस्यता समाप्त हो गई है। एक्सेस फिर से पाने के लिए अपने डैशबोर्ड से फिर से सदस्यता लें।";
        default:
          return `आपकी वर्तमान सदस्यता स्थिति है: ${status}`;
      }
    },
  },
  ar: {
    greeting: (name) => `مرحباً ${name}،`,
    intro: "نُعلمك بتغيير في اشتراكك في Bisbi.",
    buttonText: "عرض التفاصيل في حسابك",
    planFreeFallback: "مجاني",
    planAdminAssigned: "مُعيَّن من المسؤول",
    defaultSubject: "تحديث الاشتراك",
    subjectByStatus: {
      active: "اشتراكك في Bisbi فعّال",
      trialing: "بدأت تجربتك في Bisbi",
      canceled: "تم إلغاء اشتراكك في Bisbi",
      canceling: "تمت جدولة إلغاء اشتراكك في Bisbi",
      plan_changed: "تم تغيير خطتك في Bisbi",
      unpaid: "كانت هناك مشكلة في الدفع لاشتراكك في Bisbi",
      expired: "انتهى اشتراكك في Bisbi",
    },
    statusMessage: (status, renewalDate) => {
      switch (status) {
        case "active":
          return "اشتراكك فعّال ويعمل بشكل صحيح.";
        case "canceled":
          return "تم إلغاء اشتراكك. يمكنك إعادة الاشتراك في أي وقت من لوحة التحكم.";
        case "canceling":
          return `تمت جدولة إلغاء اشتراكك. ستستمر في الوصول حتى ${renewalDate || "نهاية فترة الفوترة الخاصة بك"}. بعد ذلك سيتم إلغاء اشتراكك.`;
        case "plan_changed":
          return "تم تغيير خطتك بنجاح. خطتك الجديدة نشطة الآن.";
        case "trialing":
          return "أنت حالياً في فترة تجريبية.";
        case "unpaid":
          return "كانت هناك مشكلة في الدفع لاشتراكك. يرجى تحديث طريقة الدفع.";
        case "past_due":
          return "دفعة اشتراكك متأخرة. يرجى تحديث طريقة الدفع.";
        case "incomplete":
          return "إعداد اشتراكك غير مكتمل. يرجى إكمال عملية الدفع.";
        case "incomplete_expired":
          return "انتهت صلاحية إعداد اشتراكك. يرجى إعادة بدء عملية الاشتراك.";
        case "expired":
          return "انتهى اشتراكك. أعد الاشتراك من لوحة التحكم لاستعادة الوصول.";
        default:
          return `حالة اشتراكك الحالية هي: ${status}`;
      }
    },
  },
};

export function welcomeWithSubscriptionStrings(lang: EmailLang) {
  return WELCOME_WITH_SUBSCRIPTION[lang];
}

export function subscriptionChangeStrings(lang: EmailLang) {
  return SUBSCRIPTION_CHANGE[lang];
}
