const ZHIPU_API_URL = process.env.ZHIPU_API_URL || "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY!;

// Interface para respuestas de Zhipu
interface ZhipuResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Queue para manejar peticiones concurrentes
class ZhipuQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private maxConcurrent = 3;
  private currentConcurrent = 0;

  async add<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          this.currentConcurrent++;
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.currentConcurrent--;
          this.processNext();
        }
      });

      if (!this.processing) {
        this.processNext();
      }
    });
  }

  private processNext() {
    if (this.queue.length === 0 || this.currentConcurrent >= this.maxConcurrent) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const operation = this.queue.shift();
    if (operation) {
      operation();
    }
  }
}

const zhipuQueue = new ZhipuQueue();

// Función auxiliar para reintentos con backoff exponencial
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.warn(`Zhipu AI: Intento ${attempt} falló, reintentando en ${delay}ms...`, {
        error: error.message
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Función principal optimizada con reintentos y timeout
export async function interpretWithZhipu(
  systemPrompt: string, 
  userPrompt: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
    retries?: number;
  } = {}
): Promise<string> {
  if (!ZHIPU_API_KEY) {
    throw new Error('ZHIPU_API_KEY is not configured');
  }

  const {
    model = "glm-4-plus",
    temperature = 0.7,
    maxTokens = 1000,
    timeout = 30000,
    retries = 3
  } = options;

  return zhipuQueue.add(async () => {
    return await executeWithRetry(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const body = JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature,
          max_tokens: maxTokens,
          stream: false
        });

        const response = await fetch(ZHIPU_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${ZHIPU_API_KEY}`
          },
          body,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Zhipu API error: ${response.status} - ${errorText}`);
        }

        const data: ZhipuResponse = await response.json();
        const content = data.choices[0]?.message?.content;
        
        if (!content) {
          throw new Error('Respuesta vacía de Zhipu API');
        }

        return content;
      } catch (error: any) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          throw new Error(`Timeout en petición a Zhipu AI (${timeout}ms)`);
        }
        
        throw error;
      }
    }, retries);
  });
}