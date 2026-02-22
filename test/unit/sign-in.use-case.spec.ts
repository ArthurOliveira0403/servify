/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HasherService } from 'src/application/services/password-hasher.service';
import { SignInUseCase } from 'src/application/use-cases/sign-in.use-case';
import { CompanyRepository } from 'src/domain/repositories/company.repository';
import { IJwtService } from 'src/application/services/ijwt.service';
import { InMemoryCompanyRepository } from 'test/utils/in-memory/in-memory.company-repository';
import { HasherServiceMock } from 'test/utils/mocks/hasher-service.mock';
import { JwtServiceMock } from 'test/utils/mocks/jwt-service.mock';
import { Company } from 'src/domain/entities/company';
import { SignUpDTO } from 'src/application/dtos/sign-up.dto';
import { EntityNotFoundException } from 'src/application/exceptions/entity-not-found.exception';
import { InvalidCredentialsException } from 'src/application/exceptions/invalid-credentials.exception';

describe('SignInUseCase', () => {
  let useCase: SignInUseCase;
  let repository: CompanyRepository;
  let hasher: HasherService;
  let jwtService: IJwtService;
  let spies: any;
  let companyMock: Company;
  let hashPassword: string;

  const data: SignUpDTO = {
    name: 'Luminnus',
    cnpj: '1234567',
    email: 'luminnus@email.com',
    password: '123456',
  };

  beforeEach(async () => {
    repository = new InMemoryCompanyRepository();
    hasher = HasherServiceMock;
    jwtService = JwtServiceMock;
    useCase = new SignInUseCase(repository, hasher, jwtService);

    spies = {
      findByEmail: jest.spyOn(repository, 'findByEmail'),
      compare: jest.spyOn(hasher, 'compare'),
      sign: jest.spyOn(jwtService, 'sign'),
    };

    hashPassword = await hasher.hash(data.password);

    companyMock = new Company({
      ...data,
      password: hashPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await repository.save(companyMock);
  });

  it('should log in to the company and return a token', async () => {
    const response = await useCase.handle(data);

    expect(spies.findByEmail).toHaveBeenCalledWith(data.email);
    expect(spies.compare).toHaveBeenCalledWith(data.password, hashPassword);
    expect(spies.sign).toHaveBeenCalledWith({
      sub: companyMock.id,
      email: companyMock.email,
      role: companyMock.role,
    });

    expect(response).toBe('fake-token');
  });

  it('should throw a EntityNotFoundException when the email is invalid', async () => {
    await expect(
      useCase.handle({ ...data, email: 'lumin@email.com' }),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw InvalidCredentiasException when the password is invalid', async () => {
    await expect(
      useCase.handle({ ...data, password: '333333' }),
    ).rejects.toThrow(InvalidCredentialsException);
  });
});
