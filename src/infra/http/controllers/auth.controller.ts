import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SignUpUseCase } from '../../../application/use-cases/sign-up.use-case';
import { SignInUseCase } from '../../../application/use-cases/sign-in.use-case';
import {
  signUpBodySchema,
  type SignUpBodyDTO,
} from 'src/infra/schemas/sign-up.schemas';
import { Zod } from 'src/infra/decorators/zod.decorator';
import {
  signInBodySchema,
  type SignInBodyDTO,
} from 'src/infra/schemas/sign-in.schemas';
import { Public } from 'src/infra/decorators/public.decorator';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private signInUseCase: SignInUseCase,
    private signUpUseCase: SignUpUseCase,
  ) {}

  @Post('signup')
  async signUp(@Body(Zod(signUpBodySchema)) data: SignUpBodyDTO) {
    await this.signUpUseCase.handle(data);
    return {
      message: 'The company successfully register',
    };
  }

  @Post('signin')
  @HttpCode(200)
  async signIn(@Body(Zod(signInBodySchema)) data: SignInBodyDTO) {
    const accessToken = await this.signInUseCase.handle(data);
    return {
      accessToken,
    };
  }
}
