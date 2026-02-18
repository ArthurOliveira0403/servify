import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SignInAdminUseCase } from 'src/application/use-cases/sign-in-admin.use-case';
import { Public } from 'src/infra/decorators/public.decorator';
import { Zod } from 'src/infra/decorators/zod.decorator';
import {
  type SignInAdminBodyDTO,
  signInAdminBodySchema,
} from 'src/infra/schemas/sign-in-admin.schemas';

@Public()
@Controller('s_admin')
export class AdminAuthController {
  constructor(private signInAdminUseCase: SignInAdminUseCase) {}

  @Post('auth')
  @HttpCode(200)
  async signUp(@Body(Zod(signInAdminBodySchema)) data: SignInAdminBodyDTO) {
    const { accessToken } = await this.signInAdminUseCase.handle(data);
    return { accessToken };
  }
}
