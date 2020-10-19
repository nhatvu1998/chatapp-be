import { Controller, Get } from '@nestjs/common';
import { Public } from '../../share/decorator/public.decorator';

@Controller()
export class AuthController {

  @Public()
  @Get('/')
  hello(): string {
    return 'This action returns all cats';
  }
}
