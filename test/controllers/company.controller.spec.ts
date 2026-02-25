/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { DATE_TRANSFORM_SERVICE } from 'src/application/services/date-transform.service';
import { UpdateCompanyUseCase } from 'src/application/use-cases/update-company.use-case';
import { AuthUser } from 'src/application/common/auth-user.interface';
import { Address } from 'src/domain/entities/address';
import { Company } from 'src/domain/entities/company';
import { CompanyController } from 'src/infra/http/controllers/company.controller';
import { UpdateCompanyBodyDTO } from 'src/infra/schemas/update-company.schemas';
import { dateTransformServiceMock } from 'test/utils/mocks/date-transform-service.mock';

const updateCompanyUseCaseMock = {
  provide: UpdateCompanyUseCase,
  useValue: {
    handle: jest.fn(),
  },
};

describe('companyController', () => {
  let companyController: CompanyController;
  let spies: any;

  const companyMock = new Company({
    name: 'Luminnus',
    cnpj: '12213421421',
    email: 'luminnus@email.com',
    password: '123456',
    phoneNumber: '084 9 9999-9999',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const data: UpdateCompanyBodyDTO = {
    name: 'Lumin',
    phoneNumber: '084 9 9999-9999',
    address: {
      country: 'Germany',
      state: 'Munique',
    },
  };

  const user: AuthUser = {
    id: companyMock.id,
    email: companyMock.email,
    role: companyMock.role,
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        updateCompanyUseCaseMock,
        {
          provide: DATE_TRANSFORM_SERVICE,
          useValue: dateTransformServiceMock,
        },
      ],
      controllers: [CompanyController],
    }).compile();

    companyController = moduleRef.get<CompanyController>(CompanyController);
    const updateCompanyUseCase =
      moduleRef.get<UpdateCompanyUseCase>(UpdateCompanyUseCase);

    spies = {
      updateCompanyUseCase: {
        handle: jest.spyOn(updateCompanyUseCase, 'handle'),
      },
    };
  });

  it('should update a company', async () => {
    const companyUpdated = new Company({
      id: companyMock.id,
      name: data.name!,
      cnpj: companyMock.cnpj,
      email: companyMock.email,
      password: companyMock.password,
      address: new Address({
        company_id: companyMock.id,
        country: data.address?.country,
        state: data.address?.state,
      }),
      phoneNumber: data.phoneNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    spies.updateCompanyUseCase.handle.mockResolvedValue({
      company: companyUpdated,
    });

    const response = await companyController.update(user, data);

    expect(spies.updateCompanyUseCase.handle).toHaveBeenCalledWith({
      ...data,
      companyId: companyMock.id,
    });

    expect(response.message).toEqual('Company successfully updated');
    expect(response.company).toMatchObject({
      id: companyMock.id,
      name: data.name,
      phoneNumber: data.phoneNumber,
      address: { ...data.address },
    });
  });
});
