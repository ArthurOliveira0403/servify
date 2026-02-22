/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { InvalidCredentialsException } from 'src/application/exceptions/invalid-credentials.exception';
import { SignInAdminUseCase } from 'src/application/use-cases/sign-in-admin.use-case';
import { AdminAuthController } from 'src/infra/http/controllers/admin-auth.controller';
import { SignInAdminBodyDTO } from 'src/infra/schemas/sign-in-admin.schemas';

const singInAdminUseCaseMock = {
  provide: SignInAdminUseCase,
  useValue: {
    handle: jest.fn(),
  },
};

describe('AdminAuthController', () => {
  let controller: AdminAuthController;
  let spies: any;

  const data: SignInAdminBodyDTO = {
    email: 'admin@email.com',
    password: '12345',
  };

  const accessToken = 'access-token';

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AdminAuthController],
      providers: [singInAdminUseCaseMock],
    }).compile();

    controller = moduleRef.get(AdminAuthController);

    const singInAdminUseCase = moduleRef.get(SignInAdminUseCase);

    spies = {
      singInAdminUseCase: {
        handle: jest.spyOn(singInAdminUseCase, 'handle'),
      },
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login admin', async () => {
    spies.singInAdminUseCase.handle.mockResolvedValue({ accessToken });

    const response = await controller.signUp(data);

    expect(spies.singInAdminUseCase.handle).toHaveBeenCalledWith(data);
    expect(response.accessToken).toBe(accessToken);
  });

  it('should throw a InvalidCredentialsException when the email is invalid', async () => {
    spies.singInAdminUseCase.handle.mockRejectedValue(
      new InvalidCredentialsException('', '', ''),
    );

    const fakeEmail = 'fakeEmail';

    await expect(
      controller.signUp({ ...data, email: fakeEmail }),
    ).rejects.toThrow(InvalidCredentialsException);
    expect(spies.singInAdminUseCase.handle).toHaveBeenCalledWith({
      ...data,
      email: fakeEmail,
    });
  });

  it('should throw a InvalidCredentialsException when the password is invalid', async () => {
    spies.singInAdminUseCase.handle.mockRejectedValue(
      new InvalidCredentialsException('', '', ''),
    );

    const fakePassword = 'fakePassword';

    await expect(
      controller.signUp({ ...data, password: fakePassword }),
    ).rejects.toThrow(InvalidCredentialsException);
    expect(spies.singInAdminUseCase.handle).toHaveBeenCalledWith({
      ...data,
      password: fakePassword,
    });
  });
});
