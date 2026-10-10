import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Enable JSON body parser
app.use(express.json());

// Initialize Gemini Client
let gemini = null;
try {
  gemini = new GoogleGenAI();
  console.log('✓ Google GenAI client initialized successfully');
} catch (err) {
  console.log('ℹ Gemini client notice:', err.message);
}

// Initialize Supabase Client
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

let supabase = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✓ Supabase client initialized successfully with URL:', SUPABASE_URL);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('ℹ Supabase environment variables not set yet. Running in offline/hybrid mode.');
}

// ==========================================
// SUPABASE PROXY API ROUTES
// ==========================================

// Check status of connection
app.get('/api/status', (req, res) => {
  res.json({
    connected: !!supabase,
    url: SUPABASE_URL ? SUPABASE_URL.replace(/^(https:\/\/[^.]+).*/, '$1***') : null,
    message: supabase
      ? 'متصل بقاعدة بيانات Supabase بنجاح'
      : 'قاعدة بيانات Supabase بانتظار تفعيل متغيرات البيئة SUPABASE_URL و SUPABASE_ANON_KEY'
  });
});

// Register user via Supabase
app.post('/api/auth/register', async (req, res) => {
  const { fullName, phone, address, email, password } = req.body;
  if (!fullName || !phone || !address || !password) {
    return res.status(400).json({ error: 'يرجى تعبئة جميع الحقول المطلوبة' });
  }

  if (!supabase) {
    return res.json({
      fallback: true,
      user: { full_name: fullName, name: fullName, phone, address, delivery_address: address, email },
      message: 'تم الحفظ محلياً (بانتظار ربط متغيرات Supabase)'
    });
  }

  try {
    // 1. Try calling the register_user RPC function
    const { data, error } = await supabase.rpc('register_user', {
      p_full_name: fullName,
      p_phone: phone,
      p_delivery_address: address,
      p_password: password,
      p_email: email || null
    });

    if (error) {
      console.warn('RPC register_user error, trying direct insert:', error.message);
      // 2. Direct insert fallback if RPC isn't created yet
      const { data: directData, error: directError } = await supabase
        .from('users')
        .insert({
          full_name: fullName,
          phone: phone,
          delivery_address: address,
          email: email || null,
          password_hash: password
        })
        .select('id, full_name, phone, delivery_address, email, created_at')
        .single();

      if (directError) {
        return res.status(400).json({ error: directError.message });
      }

      return res.json({ user: directData });
    }

    const user = Array.isArray(data) ? data[0] : data;
    return res.json({ user });
  } catch (err) {
    console.error('Registration exception:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Login user via Supabase
app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
  }

  if (!supabase) {
    return res.json({
      fallback: true,
      message: 'الخدمة تعمل محلياً (بانتظار ربط متغيرات Supabase)'
    });
  }

  try {
    // 1. Try login_user RPC
    const { data, error } = await supabase.rpc('login_user', {
      p_identifier: identifier,
      p_password: password
    });

    if (error) {
      console.warn('RPC login_user error, trying direct query:', error.message);
      // Fallback query if RPC isn't installed
      const { data: directData, error: directError } = await supabase
        .from('users')
        .select('id, full_name, phone, delivery_address, email, created_at')
        .or(`phone.eq.${identifier},email.eq.${identifier}`)
        .limit(1);

      if (directError || !directData || directData.length === 0) {
        return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
      }

      return res.json({ user: directData[0] });
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(401).json({ error: 'رقم الهاتف أو كلمة المرور غير صحيحة' });
    }

    const user = Array.isArray(data) ? data[0] : data;
    return res.json({ user });
  } catch (err) {
    console.error('Login exception:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Create Order via Supabase
app.post('/api/orders', async (req, res) => {
  const { orderId, userId, customerName, phone, address, dishName, quantity, unitPrice, totalPrice, notes } = req.body;

  if (!supabase) {
    return res.json({
      fallback: true,
      message: 'تم الحفظ محلياً'
    });
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        user_id: userId || null,
        customer_name: customerName,
        phone: phone,
        delivery_address: address,
        dish_name: dishName,
        quantity: quantity || 1,
        unit_price: unitPrice,
        total_price: totalPrice,
        kitchen_notes: notes || null
      })
      .select()
      .single();

    if (error) {
      console.error('Order creation error in Supabase:', error.message);
      return res.status(400).json({ error: error.message });
    }

    return res.json({ order: data });
  } catch (err) {
    console.error('Order exception:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Fetch Orders for user
app.get('/api/orders', async (req, res) => {
  const { userId, phone } = req.query;

  if (!supabase) {
    return res.json({ orders: [] });
  }

  try {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (phone) {
      query = query.eq('phone', phone);
    }

    const { data, error } = await query;
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ orders: data || [] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// AI RESTAURANT ASSISTANT (Gemini API)
// ==========================================
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'الرسالة مطلوبة' });
  }

  const systemInstruction = `أنت 'مساعد بيتنا الفلسطيني الذكي' 🌿🍲، خبير الضيافة والمطبخ الفلسطيني التراثي في مطعم 'بيتنا الفلسطيني' (دمشق، مخيم اليرموك).
طبيعتك: ودود جداً، كريم، لهجتك عربية مرحبة ودافئة بالطريقة الفلسطينية الأصيلة.
قائمة الأطعمة والحلويات وأسعارها:
- الأكلات الرئيسية:
  * المقلوبة الفلسطينية (25 ₪): دجاج طازج، أرز مبهر ببهارات فلسطينية سبعة، باذنجان مقلي، زهرة، ولوز وصنوبر محمص.
  * المفتول الفلسطيني (28 ₪): برغل مفتول يدوياً بزيت الزيتون مع الحمص وقطع الدجاج والمرق العطري الغني.
  * المسخن الفلسطيني (30 ₪): خبز طابون بلدي مغطى بالبصل المكرمل بزيت الزيتون البكر وسماق جنيني بلدي ودجاج محمر وصنوبر.
- الحلويات التراثية:
  * الكنافة النابلسية (15 ₪): جبنة عكاوية ونابلسية مع عجينة كنافة مقرمشة وقطر بلدي وفستق حلبي.
  * المطبق الفلسطيني (12 ₪): رقائق عجين مقرمشة محشوة بالجبنة البلدية أو الجوز ومحلاة بالقطر.
  * القزحة الفلسطينية (10 ₪): حلاوة حبة البركة التراثية الأصيلة والصحية.
- موقع المطعم: دمشق، مخيم اليرموك، شارع فلسطين.
- التوصيل: متوفر وسريع لكافة مناطق دمشق ومخيم اليرموك مع الدفع نقداً عند الاستلام.
- بإمكان الزبون طلب أي طبق مباشرة بالضغط على زر 'اطلب الآن' في الصفحة، أو تسجيل الدخول لحفظ عنوانه ومتابعة الطلب.
أجب باختصار مفيد، ودفء، ومساعدة حقيقية!`;

  try {
    if (gemini && process.env.GEMINI_API_KEY) {
      const contents = [];
      if (Array.isArray(history) && history.length > 0) {
        history.slice(-6).forEach(h => {
          if (h.role && h.text) {
            contents.push({
              role: h.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: h.text }]
            });
          }
        });
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await gemini.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
          maxOutputTokens: 600
        }
      });

      const replyText = response.text || 'أهلاً وسهلاً بك في بيتنا الفلسطيني! 🌿 نسعد دائماً بخدمتك.';
      return res.json({ reply: replyText });
    }
  } catch (err) {
    console.error('Gemini generateContent error:', err.message);
  }

  // Smart conversational fallback
  const lower = message.toLowerCase();
  let reply = '';
  if (lower.includes('مقلوبة')) {
    reply = 'المقلوبة الفلسطينية هي تاج سفرتنا! 🍲 نحضرها بالدجاج الطازج، الباذنجان المقلي، الزهرة، والأرز المتبل ببهاراتنا الخاصة مع الصنوبر واللوز المحمص (25 ₪). يمكنك طلبها فوراً بالضغط على "اطلب الآن"!';
  } else if (lower.includes('مسخن')) {
    reply = 'المسخن الفلسطيني الأصيل! 🫓 يحضر بخبز الطابون الطازج، بزيت الزيتون الفلسطيني الصافي، بصل بلدي مكرمل، وسماق أصلي مع الدجاج المحمر والصنوبر (30 ₪). نكهة تأخذك لقلب فلسطين!';
  } else if (lower.includes('مفتول')) {
    reply = 'المفتول الفلسطيني التراثي! 🍲 يُفتل يدوياً بالدقيق والبرغل وزيت الزيتون، ويقدم مع مرق الدجاج الغني بالحمص والبصل والكمون (28 ₪). وجبة دافئة ومميزة جداً!';
  } else if (lower.includes('حلو') || lower.includes('كنافة') || lower.includes('نابلسية') || lower.includes('مطبق') || lower.includes('قزحة')) {
    reply = 'حلوياتنا الفلسطينية تأخذك إلى نابلس والقدس! 🍯 لدينا الكنافة النابلسية بالجبنة البلدية (15 ₪)، والمطبق الفلسطيني المقرمش (12 ₪)، والقزحة بحبة البركة (10 ₪). أي منها ترغب في تذوقه اليوم؟';
  } else if (lower.includes('طلب') || lower.includes('توصيل') || lower.includes('عنوان') || lower.includes('سعر')) {
    reply = 'خدمة التوصيل السريع متاحة في دمشق ومخيم اليرموك! 🛵 يمكنك اختيار أي طبق من القائمة والضغط على "اطلب الآن"، أو تسجيل الدخول لحفظ عنوانك ومتابعة الطلب مباشرة.';
  } else {
    reply = 'أهلاً وسهلاً بك في بيتنا الفلسطيني! 🌿 أنا هنا لمساعدتك في استكشاف أشهى الأطباق التراثية كالمقلوبة والمسخن والمفتول والحلويات النابلسية، أو توضيح تفاصيل التوصيل. تفضل، كيف يمكنني مساعدتك اليوم؟';
  }

  return res.json({ reply });
});

// Serve /Images case-insensitively or mapped to /images
app.use('/Images', express.static(path.join(__dirname, 'images')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Serve root static files
app.use(express.static(__dirname));

// Route for login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
