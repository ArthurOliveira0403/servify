/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { EntityNotFoundException } from 'src/application/exceptions/entity-not-found.exception';
import { DateTransformService } from 'src/application/services/date-transform.service';
import { UpdateCompanyUseCase } from 'src/application/use-cases/update-company.use-case';
import { Address } from 'src/domain/entities/address';
import { Company } from 'src/domain/entities/company';
import { CompanyRepository } from 'src/domain/repositories/company.repository';
import { InMemoryCompanyRepository } from 'test/utils/in-memory/in-memory.company-repository';
import { dateTransformServiceMock } from 'test/utils/mocks/date-transform-service.mock';

describe('UpdateCompanyUseCase', () => {
  let useCase: UpdateCompanyUseCase;
  let companyRepository: CompanyRepository;
  let dateTransformService: DateTransformService;
  let spies: any;

  const companyMock = new Company({
    id: '1',
    name: 'Luminnus',
    cnpj: '1234567',
    email: 'luminnus@email.com',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const companyMockWithAddress = new Company({
    id: '2',
    name: 'Luminnus',
    cnpj: '1234567098767890',
    email: 'luminnus@email.com',
    password: 'hashedPassword',
    address: new Address({
      company_id: '2',
      country: 'Brazil',
      state: 'Rio de janeiro',
      number: '12',
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const data = {
    address: {
      city: 'São Paulo',
      country: 'Brazil',
      number: '781',
    },
    phoneNumber: '084 9 9999-9999',
  };

  const now = new Date();

  beforeEach(() => {
    jest.clearAllMocks();

    companyRepository = new InMemoryCompanyRepository();
    dateTransformService = dateTransformServiceMock;
    useCase = new UpdateCompanyUseCase(companyRepository, dateTransformService);

    spies = {
      repository: {
        findById: jest.spyOn(companyRepository, 'findById'),
        update: jest.spyOn(companyRepository, 'update'),
      },
      companyWithAddress: {
        update: jest.spyOn(companyMockWithAddress, 'update'),
      },
      company: {
        update: jest.spyOn(companyMock, 'update'),
      },
      dateTransformService: {
        nowUTC: jest.spyOn(dateTransformService, 'nowUTC').mockReturnValue(now),
      },
    };
  });

  it('should update a company that already has an address', async () => {
    await companyRepository.save(companyMockWithAddress);

    const response = await useCase.handle({
      companyId: companyMockWithAddress.id,
      ...data,
    });

    expect(spies.repository.findById).toHaveBeenCalledWith(
      companyMockWithAddress.id,
    );

    expect(spies.dateTransformService.nowUTC).toHaveBeenCalled();
    expect(spies.companyWithAddress.update).toHaveBeenCalledWith({
      address: {
        city: data.address.city,
        country: data.address.country,
        number: data.address.number,
      },
      phoneNumber: data.phoneNumber,
      now,
    });
    expect(spies.repository.update).toHaveBeenCalledWith(expect.any(Company));

    expect(response.company.address).toMatchObject({
      city: data.address.city,
      country: data.address.country,
      number: data.address.number,
    });
    expect(response.company.phoneNumber).toBe(data.phoneNumber);
    expect(response.company.updatedAt).toBe(now);
  });

  it('should create a address when company does not have one', async () => {
    await companyRepository.save(companyMock);

    const response = await useCase.handle({
      companyId: companyMock.id,
      ...data,
    });

    expect(spies.repository.findById).toHaveBeenCalledWith(companyMock.id);
    expect(spies.dateTransformService.nowUTC).toHaveBeenCalled();
    expect(spies.company.update).toHaveBeenCalledWith({
      address: {
        city: data.address.city,
        country: data.address.country,
        number: data.address.number,
      },
      phoneNumber: data.phoneNumber,
      now,
    });
    expect(spies.repository.update).toHaveBeenCalledWith(expect.any(Company));

    expect(response.company.address).toMatchObject({
      city: data.address.city,
      country: data.address.country,
      number: data.address.number,
    });
    expect(response.company.phoneNumber).toBe(data.phoneNumber);
    expect(response.company.updatedAt).toBe(now);
  });

  it('should throw EntityNotFoundException when company not found', async () => {
    await expect(
      useCase.handle({ companyId: companyMock.id, ...data }),
    ).rejects.toThrow(EntityNotFoundException);

    expect(spies.repository.findById).toHaveBeenCalledWith(companyMock.id);
  });
});
