import { Module } from '@nestjs/common';
import { VALIDATE_USER_SERVICE } from 'src/application/services/ivalidate-user.service';
import { ValidateUserService } from '../services/validate-user/validate-user.service';
import { DatabaseModule } from './database.module';

@Module({
  imports: [DatabaseModule],
  providers: [
    { provide: VALIDATE_USER_SERVICE, useClass: ValidateUserService },
  ],
  exports: [VALIDATE_USER_SERVICE],
})
export class ValidateUserModule {}
