import { IJwtService } from 'src/application/services/ijwt.service';

export const JwtServiceMock: IJwtService = {
  sign: jest.fn().mockReturnValue('fake-token'),
};
