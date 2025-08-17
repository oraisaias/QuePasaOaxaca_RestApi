import { Injectable, BadRequestException } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY no está configurada en las variables de entorno');
    }
    
    this.openai = new OpenAI({
      apiKey,
    });
  }

  async getGptResponse(): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Hola',
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      return (
        completion.choices[0]?.message?.content ||
        'No se pudo obtener respuesta'
      );
    } catch (error) {
      console.error('Error al conectar con OpenAI:', error);
      
      if (error instanceof Error) {
        throw new BadRequestException(`Error de OpenAI: ${error.message}`);
      }
      
      throw new BadRequestException('Error al conectar con OpenAI');
    }
  }
}
