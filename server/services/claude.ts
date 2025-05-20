import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface SecurityResult {
  status: string;
  details: string;
}

/**
 * Analyze the security of a transaction using Claude
 * @param address The recipient Bitcoin address
 * @param amount The amount of sBTC to send
 * @returns Security assessment result
 */
export async function analyzeTransactionSecurity(
  address: string,
  amount: number
): Promise<SecurityResult> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log("No Anthropic API key found, using mock security check");
      return getMockSecurityResult(address, amount);
    }
    
    const systemPrompt = `You are a Bitcoin transaction security expert. 
    Analyze the provided transaction details and determine if it appears suspicious.
    Consider factors like the recipient address pattern, transaction amount, and known scam patterns.
    Rate the transaction as:
    - "high" for safe transactions
    - "medium" for potentially suspicious transactions
    - "low" for likely fraudulent transactions
    
    Respond in JSON format with:
    {
      "status": "high|medium|low",
      "details": "Detailed explanation of your assessment"
    }`;
    
    const userMessage = `Please analyze this Bitcoin transaction:
    Recipient address: ${address}
    Amount: ${amount} sBTC`;
    
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });
    
    // Parse the response to JSON
    const content = response.content[0].text.trim();
    const result = JSON.parse(content);
    
    return {
      status: result.status,
      details: result.details
    };
  } catch (error) {
    console.error("Error analyzing transaction:", error);
    return {
      status: "medium",
      details: "Could not perform security analysis. Please review transaction details carefully."
    };
  }
}

/**
 * Process a natural language command using Claude
 * @param text The user's text message
 * @returns Structured command data
 */
export async function processNaturalLanguageCommand(text: string): Promise<any> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      // Return simple command extraction without AI
      const amountMatch = text.match(/(\d+\.?\d*)\s*sbtc/i);
      const recipientMatch = text.match(/to\s+(@\w+|bc\w+)/i);
      
      return {
        command: text.toLowerCase().includes('send') ? 'send' : 
                 text.toLowerCase().includes('balance') ? 'balance' :
                 text.toLowerCase().includes('receive') ? 'receive' :
                 text.toLowerCase().includes('history') ? 'history' : 'unknown',
        amount: amountMatch ? parseFloat(amountMatch[1]) : null,
        recipient: recipientMatch ? recipientMatch[1] : null
      };
    }
    
    const systemPrompt = `You are a Bitcoin wallet assistant. 
    Extract commands from natural language text.
    Supported commands: balance, send, receive, history
    Return a JSON object with the following structure:
    {
      "command": "balance|send|receive|history|unknown",
      "amount": number or null,
      "recipient": string or null
    }`;
    
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: text }],
    });
    
    // Parse the response to JSON
    const content = response.content[0].text.trim();
    return JSON.parse(content);
  } catch (error) {
    console.error("Error processing natural language command:", error);
    return {
      command: "unknown",
      amount: null, 
      recipient: null
    };
  }
}

/**
 * Process a voice command using Claude (after speech-to-text)
 * @param transcription The transcribed voice message
 * @returns Structured command data
 */
export async function processVoiceCommand(transcription: string): Promise<any> {
  // Voice commands use the same processing as text commands
  return processNaturalLanguageCommand(transcription);
}

/**
 * Mock security check for testing without an API key
 */
function getMockSecurityResult(address: string, amount: number): SecurityResult {
  // Determine security level based on address pattern and amount
  if (address.startsWith('bc1qxr4fjk') || address.includes('1BitcoinEater')) {
    return {
      status: "low",
      details: "High risk address detected. This address matches patterns commonly associated with scams."
    };
  } else if (amount > 1.0) {
    return {
      status: "medium",
      details: "Caution: This is a high-value transaction. Please verify the recipient address carefully."
    };
  } else {
    return {
      status: "high", 
      details: "This transaction appears legitimate. No suspicious patterns detected."
    };
  }
}