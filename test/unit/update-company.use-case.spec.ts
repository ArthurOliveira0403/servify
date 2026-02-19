/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { NotFoundException } from '@nestjs/common';
import { UpdateCompanyDTO } from 'src/application/dtos/update-company.dto';
import { DateTransformService } from 'src/application/services/date-transform.service';
import { UpdateCompanyUseCase } from 'src/application/use-cases/update-company.use-case';
import { Address } from 'src/domain/entities/address';
import { Company } from 'src/domain/entities/company';
import { CompanyRepository } from 'src/domain/repositories/company.repository';
import { InMemoryCompanyRepository } from 'test/utils/in-memory/in-memory.company-repository';
import { dateTransformMock } from 'test/utils/mocks/date-transform.mock';

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
    cnpj: '1234567',
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

  const data: UpdateCompanyDTO = {
    address: {
      city: 'São Paulo',
      country: 'Brazil',
      number: '781',
    },
    phoneNumber: '084 9 9999-9999',
  };

  const fakeNowUTC = new Date();

  beforeEach(() => {
    jest.clearAllMocks();

    companyRepository = new InMemoryCompanyRepository();
    dateTransformService = dateTransformMock;
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
        nowUTC: jest.spyOn(dateTransformService, 'nowUTC'),
      },
    };

    spies.dateTransformService.nowUTC.mockReturnValue(fakeNowUTC);
  });

  it('should update a company that already has an address', async () => {
    await companyRepository.save(companyMockWithAddress);

    const response = await useCase.handle(companyMockWithAddress.id, data);

    expect(spies.repository.findById).toHaveBeenCalledWith(
      companyMockWithAddress.id,
    );

    expect(spies.dateTransformService.nowUTC).toHaveBeenCalled();
    expect(spies.companyWithAddress.update).toHaveBeenCalledWith({
      ...data,
      now: fakeNowUTC,
    });
    expect(spies.repository.update).toHaveBeenCalledWith(expect.any(Company));

    expect(response.company.address).toMatchObject({
      city: 'São Paulo',
      country: 'Brazil',
      number: '781',
    });
    expect(response.company.phoneNumber).toBe(data.phoneNumber);
    expect(response.company.updatedAt).toBe(fakeNowUTC);
  });

  it('should create a address when company does not have one', async () => {
    await companyRepository.save(companyMock);

    const response = await useCase.handle(companyMock.id, data);

    expect(spies.repository.findById).toHaveBeenCalledWith(companyMock.id);
    expect(spies.dateTransformService.nowUTC).toHaveBeenCalled();
    expect(spies.company.update).toHaveBeenCalledWith({
      ...data,
      now: fakeNowUTC,
    });
    expect(spies.repository.update).toHaveBeenCalledWith(expect.any(Company));

    expect(response.company.address).toMatchObject({
      city: 'São Paulo',
      country: 'Brazil',
      number: '781',
    });
    expect(response.company.phoneNumber).toBe(data.phoneNumber);
    expect(response.company.updatedAt).toBe(fakeNowUTC);
  });

  it('should not update for not found company', async () => {
    await expect(useCase.handle(companyMock.id, data)).rejects.toThrow(
      NotFoundException,
    );

    expect(spies.repository.findById).toHaveBeenCalledWith(companyMock.id);
  });
});
