import { Module } from '@nestjs/common';
import { HASHER_SERVICE } from 'src/application/services/password-hasher.service';
import { BcryptService } from '../services/bcrypt/bcrypt.service';

@Module({
  providers: [{ provide: HASHER_SERVICE, useClass: BcryptService }],
  exports: [HASHER_SERVICE],
})
export class HasherModule {}
