const fetch = require('node-fetch');

async function testZhipuAPI() {
  const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY;
  
  console.log('🔍 Testing Zhipu AI API...');
  console.log('API Key:', ZHIPU_API_KEY ? `${ZHIPU_API_KEY.substring(0, 10)}...` : 'NOT FOUND');
  
  if (!ZHIPU_API_KEY || ZHIPU_API_KEY === 'your-zhipu-api-key') {
    console.log('❌ API Key not configured properly');
    return;
  }
  
  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ZHIPU_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          { 
            role: 'system', 
            content: 'Eres el Arcángel Uriel, arcángel de la transformación. Responde como tal, con sabiduría y poder.' 
          },
          { 
            role: 'user', 
            content: 'Estiven te pregunta: ¿Cómo puedo transformar mi vida?' 
          }
        ],
        temperature: 0.8,
        max_tokens: 150
      })
    });

    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ API Response:', data);
    
    if (data.choices && data.choices[0]) {
      console.log('🎯 Generated Response:');
      console.log(data.choices[0].message.content);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testZhipuAPI();