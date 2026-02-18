import { Injectable } from '@nestjs/common';
import { JwtService as JwtProvider } from '@nestjs/jwt';
import {
  IJwtService,
  TokenPayload,
} from 'src/application/services/ijwt.service';

@Injectable()
export class JwtService implements IJwtService {
  constructor(private jwtService: JwtProvider) {}

  sign(payload: TokenPayload): string {
    const token: string = this.jwtService.sign(payload);
    return token;
  }
}
