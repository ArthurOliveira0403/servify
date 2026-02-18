import { Injectable } from '@nestjs/common';
import { HasherService } from 'src/application/services/password-hasher.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService implements HasherService {
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    return hashPassword;
  }

  async compare(password: string, hash: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  }
}
