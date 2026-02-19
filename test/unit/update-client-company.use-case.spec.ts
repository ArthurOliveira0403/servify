/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateClientCompanyDTO } from 'src/application/dtos/update-client-company.dto';
import { DateTransformService } from 'src/application/services/date-transform.service';
import { UpdateClientCompanyUseCase } from 'src/application/use-cases/update-client-company.use-case';
import { Client } from 'src/domain/entities/client';
import { ClientCompany } from 'src/domain/entities/client-company';
import { ClientCompanyRepository } from 'src/domain/repositories/client-company.repository';
import { ClientRepository } from 'src/domain/repositories/client.repository';
import { InMemoryClientCompanyRepository } from 'test/utils/in-memory/in-memory.client-company.repository';
import { InMemoryClientRepository } from 'test/utils/in-memory/in-memory.client-repository';
import { dateTransformMock } from 'test/utils/mocks/date-transform.mock';

describe('UpdateClientCompanyUseCase', () => {
  let useCase: UpdateClientCompanyUseCase;
  let repository: ClientCompanyRepository;
  let dateTransformService: DateTransformService;
  let clientRepository: ClientRepository;
  let spies: any;

  const clientMock = new Client({
    id: 'client-1',
    fullName: 'john Doe',
    internationalId: '12324',
    createdAt: new Date(),
  });

  const clientCompanyMock = new ClientCompany({
    id: '1',
    clientId: clientMock.id,
    companyId: 'company-1',
    email: 'john@example.com',
    phone: '1234567890',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const data: UpdateClientCompanyDTO = {
    clientCompanyId: clientCompanyMock.id,
    companyId: clientCompanyMock.companyId,
    email: 'jane@example.com',
    phone: '0987654321',
  };

  const fakeNowUTC = new Date();

  beforeEach(() => {
    jest.clearAllMocks();

    repository = new InMemoryClientCompanyRepository();
    dateTransformService = dateTransformMock;
    clientRepository = new InMemoryClientRepository();
    useCase = new UpdateClientCompanyUseCase(
      repository,
      dateTransformService,
      clientRepository,
    );

    spies = {
      clientCompanyRepository: {
        findById: jest.spyOn(repository, 'findById'),
        update: jest.spyOn(repository, 'update'),
      },
      clientCompany: {
        updateDetails: jest.spyOn(clientCompanyMock, 'updateDetails'),
      },
      dateTransformService: {
        nowUTC: jest.spyOn(dateTransformService, 'nowUTC'),
      },
      clientRepository: {
        findById: jest.spyOn(clientRepository, 'findById'),
      },
    };

    spies.dateTransformService.nowUTC.mockReturnValue(fakeNowUTC);
  });

  it('should update a client-company relation', async () => {
    await repository.save(clientCompanyMock);
    await clientRepository.save(clientMock);

    const response = await useCase.handle(data);

    expect(spies.clientCompanyRepository.findById).toHaveBeenCalledWith(
      data.clientCompanyId,
    );
    expect(spies.clientCompany.updateDetails).toHaveBeenCalledWith({
      email: data.email,
      phone: data.phone,
      now: fakeNowUTC,
    });
    expect(spies.dateTransformService.nowUTC).toHaveBeenCalled();
    expect(spies.clientCompanyRepository.update).toHaveBeenCalled();

    const clientCompany = await repository.findById(data.clientCompanyId);

    expect(spies.clientRepository.findById).toHaveBeenCalledWith(
      clientCompany!.clientId,
    );

    expect(response.clientCompany.email).toBe(data.email);
    expect(response.clientCompany.phone).toBe(data.phone);
    expect(response.clientCompany.updatedAt).toBe(fakeNowUTC);
  });

  it('should throw NotFoundException if client-company relation does not exist', async () => {
    await expect(useCase.handle(data)).rejects.toThrow(NotFoundException);

    expect(spies.clientCompanyRepository.findById).toHaveBeenCalledWith(
      data.clientCompanyId,
    );
    expect(spies.clientCompanyRepository.update).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if companyId does not match', async () => {
    const invalidData = { ...data, companyId: 'invalid-company-id' };
    await repository.save(clientCompanyMock);

    await expect(useCase.handle(invalidData)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(spies.clientCompanyRepository.findById).toHaveBeenCalledWith(
      data.clientCompanyId,
    );
    expect(spies.clientCompanyRepository.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when the Client of ClientCompany does not exists', async () => {
    await repository.save(clientCompanyMock);

    await expect(useCase.handle(data)).rejects.toThrow(NotFoundException);

    expect(spies.clientCompanyRepository.findById).toHaveBeenCalledWith(
      data.clientCompanyId,
    );
    expect(spies.clientCompany.updateDetails).toHaveBeenCalledWith({
      email: data.email,
      phone: data.phone,
      now: fakeNowUTC,
    });
    expect(spies.dateTransformService.nowUTC).toHaveBeenCalled();
    expect(spies.clientCompanyRepository.update).toHaveBeenCalled();

    const clientCompany = await repository.findById(data.clientCompanyId);

    expect(spies.clientRepository.findById).toHaveBeenCalledWith(
      clientCompany!.clientId,
    );
  });
});
