/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { SignInAdminDTO } from 'src/application/dtos/sign-in-admin.dto';
import { ForbiddenException } from 'src/application/exceptions/forbidden.exception';
import { SignInAdminUseCase } from 'src/application/use-cases/sign-in-admin.use-case';
import { AdminRepository } from 'src/domain/repositories/admin.repository';
import { InMemoryAdminRepository } from 'test/utils/in-memory/in-memory.admin-repository';
import { HasherServiceMock } from 'test/utils/mocks/hasher-service.mock';
import { JwtServiceMock } from 'test/utils/mocks/jwt-service.mock';

describe('SignInAdminUseCase', () => {
  let useCase: SignInAdminUseCase;
  let adminRepository: AdminRepository;
  let spies: any;

  // Ao chamar o método "findByEmail", é implementado uma seed no banco de dados em memória. Verificar!
  const data: SignInAdminDTO = {
    email: 'admin@email.com',
    password: '123456',
  };

  beforeEach(() => {
    adminRepository = new InMemoryAdminRepository();
    const hasherService = HasherServiceMock;
    const jwtService = JwtServiceMock;
    useCase = new SignInAdminUseCase(
      adminRepository,
      hasherService,
      jwtService,
    );

    spies = {
      adminRepository: {
        findByEmail: jest.spyOn(adminRepository, 'findByEmail'),
      },
      hasherService: {
        compare: jest.spyOn(hasherService, 'compare'),
      },
      jwtService: {
        sign: jest.spyOn(jwtService, 'sign'),
      },
    };
  });

  it('should login admin', async () => {
    const { accessToken } = await useCase.handle(data);

    const admin = await adminRepository.findByEmail(data.email);

    expect(spies.adminRepository.findByEmail).toHaveBeenCalledWith(data.email);
    expect(spies.hasherService.compare).toHaveBeenCalledWith(
      data.password,
      admin!.password,
    );
    expect(spies.jwtService.sign).toHaveBeenCalledWith({
      sub: admin!.id,
      email: admin!.email,
      role: admin?.role,
    });

    expect(accessToken).toBe('fake-token');
  });

  it('should throw ForbiddenException when exist not admin with the sended email', async () => {
    const fakeEmail = 'email@email.com';

    await expect(useCase.handle({ ...data, email: fakeEmail })).rejects.toThrow(
      ForbiddenException,
    );

    expect(spies.adminRepository.findByEmail).toHaveBeenCalledWith(fakeEmail);
  });

  it('should throw ForbiddenException when match not password', async () => {
    const fakePassword = 'fakePassword';

    await expect(
      useCase.handle({ ...data, password: fakePassword }),
    ).rejects.toThrow(ForbiddenException);

    const admin = await adminRepository.findByEmail(data.email);

    expect(spies.adminRepository.findByEmail).toHaveBeenCalledWith(data.email);
    expect(spies.hasherService.compare).toHaveBeenCalledWith(
      fakePassword,
      admin!.password,
    );
  });
});
