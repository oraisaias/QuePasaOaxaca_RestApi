import { Controller, Post, UseGuards } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GptResponseDto } from './dto/gpt-response.dto';

@Controller('openai')
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  @Post('gpt-response')
  @UseGuards(JwtAuthGuard)
  async getGptResponse(): Promise<GptResponseDto> {
    const response = await this.openaiService.getGptResponse();
    return {
      message: response,
      timestamp: new Date().toISOString(),
    };
  }
}
