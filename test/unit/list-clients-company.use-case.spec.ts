/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ListAllClientsCompanyDTO,
  ListOneClientCompanyDTO,
} from 'src/application/dtos/list-clients-company.dto';
import { EntityNotFoundException } from 'src/application/exceptions/entity-not-found.exception';
import { NonBelongingException } from 'src/application/exceptions/non-belonging.exception';
import { ListClientsCompanyUseCase } from 'src/application/use-cases/list-clients-company.use-case';
import { Client } from 'src/domain/entities/client';
import { ClientCompany } from 'src/domain/entities/client-company';
import { ClientCompanyRepository } from 'src/domain/repositories/client-company.repository';
import { ClientRepository } from 'src/domain/repositories/client.repository';
import { InMemoryClientCompanyRepository } from 'test/utils/in-memory/in-memory.client-company.repository';
import { InMemoryClientRepository } from 'test/utils/in-memory/in-memory.client-repository';

const companyId = '123';

const clientMock1 = new Client({
  id: 'client-1',
  fullName: 'JohnDoe',
  internationalId: '12345',
  createdAt: new Date(),
});

const clientCompany1 = new ClientCompany({
  id: 'client-company-1',
  clientId: clientMock1.id,
  companyId: companyId,
  email: 'email@email.com',
  phone: '1234567890',
  createdAt: new Date(),
  updatedAt: new Date(),
});

const clientMock2 = new Client({
  id: 'client-2',
  fullName: 'JohnDoe',
  internationalId: '12345',
  createdAt: new Date(),
});

const clientCompany2 = new ClientCompany({
  id: 'client-company-2',
  clientId: clientMock2.id,
  companyId: companyId,
  email: 'email2@email.com',
  phone: '0987654321',
  createdAt: new Date(),
  updatedAt: new Date(),
});

const clientMock3 = new Client({
  id: 'client-3',
  fullName: 'JohnDoe',
  internationalId: '12345',
  createdAt: new Date(),
});

const clientCompany3 = new ClientCompany({
  id: 'client-company-3',
  clientId: clientMock3.id,
  companyId: companyId,
  email: 'newEmail@email.com',
  phone: '123456',
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('ListClientsCompanyUseCase', () => {
  let useCase: ListClientsCompanyUseCase;
  let clientCompanyRepository: ClientCompanyRepository;
  let clientRepository: ClientRepository;
  let spies: any;

  const dataAll: ListAllClientsCompanyDTO = {
    companyId,
  };

  const dataOne: ListOneClientCompanyDTO = {
    companyId,
    clientCompanyId: clientCompany3.id,
  };

  beforeEach(() => {
    clientCompanyRepository = new InMemoryClientCompanyRepository();
    clientRepository = new InMemoryClientRepository();
    useCase = new ListClientsCompanyUseCase(
      clientCompanyRepository,
      clientRepository,
    );

    spies = {
      clientCompanyRepository: {
        findManyByCompany: jest.spyOn(
          clientCompanyRepository,
          'findManyByCompany',
        ),
        findBydId: jest.spyOn(clientCompanyRepository, 'findById'),
      },
      clientRepository: {
        findById: jest.spyOn(clientRepository, 'findById'),
      },
    };
  });

  // ==================== All method ====================
  it('should list ALL clients company', async () => {
    await clientRepository.save(clientMock1);
    await clientRepository.save(clientMock2);
    await clientRepository.save(clientMock3);

    await clientCompanyRepository.save(clientCompany1);
    await clientCompanyRepository.save(clientCompany2);
    await clientCompanyRepository.save(clientCompany3);

    const returnUseCase = [
      { clientCompany: clientCompany1, client: clientMock1 },
      { clientCompany: clientCompany2, client: clientMock2 },
      { clientCompany: clientCompany3, client: clientMock3 },
    ];

    const response = await useCase.all(dataAll);

    expect(
      spies.clientCompanyRepository.findManyByCompany,
    ).toHaveBeenCalledWith(dataAll.companyId);
    expect(spies.clientRepository.findById).toHaveBeenCalled();
    expect(response).toEqual(returnUseCase);
  });

  it('should throw EntityNotFoundException when the Client of ClientCompany not exists', async () => {
    await clientRepository.save(clientMock1);
    await clientRepository.save(clientMock2);

    await clientCompanyRepository.save(clientCompany1);
    await clientCompanyRepository.save(clientCompany2);
    await clientCompanyRepository.save(clientCompany3);

    await expect(useCase.all(dataAll)).rejects.toThrow(EntityNotFoundException);

    expect(
      spies.clientCompanyRepository.findManyByCompany,
    ).toHaveBeenCalledWith(dataAll.companyId);
    expect(spies.clientRepository.findById).toHaveBeenCalled();
  });

  it('shoudl return [] when the Company does not have ClientsCompany', async () => {
    const response = await useCase.all(dataAll);

    expect(
      spies.clientCompanyRepository.findManyByCompany,
    ).toHaveBeenCalledWith(dataAll.companyId);
    expect(response).toEqual([]);
  });

  // ==================== One method ====================
  it('should return ONE ClientCompany', async () => {
    await clientRepository.save(clientMock1);
    await clientRepository.save(clientMock2);
    await clientRepository.save(clientMock3);

    await clientCompanyRepository.save(clientCompany1);
    await clientCompanyRepository.save(clientCompany2);
    await clientCompanyRepository.save(clientCompany3);

    const response = await useCase.one(dataOne);

    expect(spies.clientCompanyRepository.findBydId).toHaveBeenCalledWith(
      dataOne.clientCompanyId,
    );
    expect(spies.clientRepository.findById).toHaveBeenCalled();
    expect(response).toEqual({
      clientCompany: clientCompany3,
      client: clientMock3,
    });
  });

  it('should throw EntityNotFoundException when the ClientCompany not exists', async () => {
    await clientRepository.save(clientMock1);
    await clientRepository.save(clientMock2);

    await clientCompanyRepository.save(clientCompany1);
    await clientCompanyRepository.save(clientCompany2);

    await expect(useCase.one(dataOne)).rejects.toThrow(EntityNotFoundException);

    expect(spies.clientCompanyRepository.findBydId).toHaveBeenCalledWith(
      dataOne.clientCompanyId,
    );
  });

  it('should throw NonBelongingException when the ClientCompany does belong to the Company not exists', async () => {
    await clientRepository.save(clientMock1);
    await clientRepository.save(clientMock2);
    await clientRepository.save(clientMock3);

    await clientCompanyRepository.save(clientCompany1);
    await clientCompanyRepository.save(clientCompany2);
    await clientCompanyRepository.save(clientCompany3);

    await expect(
      useCase.one({ companyId: '1', clientCompanyId: dataOne.clientCompanyId }),
    ).rejects.toThrow(NonBelongingException);

    expect(spies.clientCompanyRepository.findBydId).toHaveBeenCalledWith(
      dataOne.clientCompanyId,
    );
  });

  it('should throw NonBelongingException when the Client of ClientCompany does not exists', async () => {
    await clientRepository.save(clientMock1);
    await clientRepository.save(clientMock2);

    await clientCompanyRepository.save(clientCompany1);
    await clientCompanyRepository.save(clientCompany2);
    await clientCompanyRepository.save(clientCompany3);

    await expect(useCase.one(dataOne)).rejects.toThrow(EntityNotFoundException);

    expect(spies.clientCompanyRepository.findBydId).toHaveBeenCalledWith(
      dataOne.clientCompanyId,
    );
    expect(spies.clientRepository.findById).toHaveBeenCalled();
  });
});
