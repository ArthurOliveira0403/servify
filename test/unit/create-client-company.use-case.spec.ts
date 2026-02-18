/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ConflictException } from '@nestjs/common';
import { CreateClientCompanyDTO } from 'src/application/dtos/create-client-company.dto';
import { CreateClientCompanyUseCase } from 'src/application/use-cases/create-client-company.use-case';
import { Client } from 'src/domain/entities/client';
import { ClientCompany } from 'src/domain/entities/client-company';
import { Feature } from 'src/domain/entities/subscription';
import { ClientCompanyRepository } from 'src/domain/repositories/client-company.repository';
import { ClientRepository } from 'src/domain/repositories/client.repository';
import { InMemoryClientCompanyRepository } from 'test/utils/in-memory/in-memory.client-company.repository';
import { InMemoryClientRepository } from 'test/utils/in-memory/in-memory.client-repository';
import { dateTransformMock } from 'test/utils/mocks/date-transform.mock';
import { SubscriptionPolicyServiceMock } from 'test/utils/mocks/subscription-policy-service.mock';

describe('CreateClientCompanyUseCase', () => {
  let useCase: CreateClientCompanyUseCase;
  let clientCompanyRepository: ClientCompanyRepository;
  let clientRepository: ClientRepository;
  let spies: any;

  const data: CreateClientCompanyDTO = {
    companyId: 'company-123',
    internationalId: '123456',
    fullName: 'JohnDoe',
    email: 'client@example.com',
    phone: '123-456-7890',
  };

  beforeEach(() => {
    clientCompanyRepository = new InMemoryClientCompanyRepository();
    clientRepository = new InMemoryClientRepository();
    const dateTransformService = dateTransformMock;
    const subscriptionPolicyService = SubscriptionPolicyServiceMock;
    useCase = new CreateClientCompanyUseCase(
      clientRepository,
      clientCompanyRepository,
      dateTransformService,
      subscriptionPolicyService,
    );

    spies = {
      subscriptionPolicyService: {
        handle: jest.spyOn(subscriptionPolicyService, 'handle'),
      },
      clientRepository: {
        findByInternationalId: jest.spyOn(
          clientRepository,
          'findByInternationalId',
        ),
        save: jest.spyOn(clientRepository, 'save'),
      },
      clientCompanyRepository: {
        save: jest.spyOn(clientCompanyRepository, 'save'),
        findRelation: jest.spyOn(clientCompanyRepository, 'findRelation'),
      },
      dateTransformService: {
        nowUTC: jest.spyOn(dateTransformService, 'nowUTC'),
      },
    };
  });

  it('should create a new client-company relationship when the Client does not exists', async () => {
    const response = await useCase.handle(data);

    expect(spies.subscriptionPolicyService.handle).toHaveBeenCalledWith(
      data.companyId,
      Feature.CLIENT_COMPANY,
    );

    expect(spies.clientRepository.findByInternationalId).toHaveBeenCalledWith(
      data.internationalId,
    );

    expect(spies.clientRepository.save).toHaveBeenCalledWith(
      expect.any(Client),
    );

    const client = await clientRepository.findByInternationalId(
      data.internationalId,
    );

    expect(spies.clientCompanyRepository.findRelation).toHaveBeenCalledWith(
      data.companyId,
      client!.id,
    );

    expect(spies.dateTransformService.nowUTC).toHaveBeenCalled();

    expect(spies.clientCompanyRepository.save).toHaveBeenCalled();

    const clientCompanyId = (
      await clientCompanyRepository.findManyByCompany(data.companyId)
    )[0].id;

    expect(response.clientCompanyId).toBe(clientCompanyId);
  });

  it('should create a new client-company relationship when the Client exists', async () => {
    const clientMock = new Client({
      fullName: 'Fulano',
      internationalId: '1234567890334567890',
    });

    await clientRepository.save(clientMock);

    const response = await useCase.handle({
      companyId: data.companyId,
      fullName: clientMock.fullName,
      internationalId: clientMock.internationalId,
      email: data.email,
      phone: data.phone,
    });

    expect(spies.subscriptionPolicyService.handle).toHaveBeenCalledWith(
      data.companyId,
      Feature.CLIENT_COMPANY,
    );

    expect(spies.clientRepository.findByInternationalId).toHaveBeenCalledWith(
      clientMock.internationalId,
    );

    expect(spies.clientCompanyRepository.findRelation).toHaveBeenCalledWith(
      data.companyId,
      clientMock.id,
    );

    expect(spies.dateTransformService.nowUTC).toHaveBeenCalled();

    expect(spies.clientCompanyRepository.save).toHaveBeenCalled();

    const clientCompanyId = (await clientCompanyRepository.findRelation(
      data.companyId,
      clientMock.id,
    ))!.id;

    expect(response.clientCompanyId).toBe(clientCompanyId);
  });

  it('should throw ConflictException if relationship already exists', async () => {
    const clientMock = new Client({
      id: '1',
      internationalId: '123',
      fullName: 'Client Name',
    });

    const clientCompanyMock = new ClientCompany({
      clientId: clientMock.id,
      companyId: data.companyId,
      email: data.email,
      phone: data.phone,
    });

    await clientRepository.save(clientMock);
    await clientCompanyRepository.save(clientCompanyMock);

    await expect(
      useCase.handle({ ...data, internationalId: clientMock.internationalId }),
    ).rejects.toThrow(ConflictException);

    expect(spies.subscriptionPolicyService.handle).toHaveBeenCalledWith(
      data.companyId,
      Feature.CLIENT_COMPANY,
    );

    expect(spies.clientRepository.findByInternationalId).toHaveBeenCalledWith(
      clientMock.internationalId,
    );
    expect(spies.clientCompanyRepository.findRelation).toHaveBeenCalledWith(
      data.companyId,
      clientMock.id,
    );
  });
});
