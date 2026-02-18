import { Module } from '@nestjs/common';
import { JWT_SERVICE } from 'src/application/services/ijwt.service';
import { JwtService } from '../services/jwt/jwt.service';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../services/jwt/jwt-strategy';
import { ValidateUserModule } from './validate-user.module';

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) throw new Error('JWT_SECRET is not defined');

@Module({
  providers: [{ provide: JWT_SERVICE, useClass: JwtService }, JwtStrategy],
  imports: [
    ValidateUserModule,
    PassportModule,
    NestJwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  exports: [JWT_SERVICE, JwtStrategy],
})
export class JwtModule {}
