/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { CreateClientCompanyUseCase } from 'src/application/use-cases/create-client-company.use-case';
import { UpdateClientCompanyUseCase } from 'src/application/use-cases/update-client-company.use-case';
import { ClientCompany } from 'src/domain/entities/client-company';
import { ClientCompanyController } from 'src/infra/http/controllers/client-company.controller';
import { ClientCompanyResponseMapper } from 'src/infra/http/mappers/client-company-response.mapper';
import { CreateClientCompanyBodyDTO } from 'src/infra/schemas/create-client-company.schemas';
import { UpdateClientCompanyBodyDTO } from 'src/infra/schemas/update-client-company.schemas';
import { Client } from 'src/domain/entities/client';
import { ListClientsCompanyUseCase } from 'src/application/use-cases/list-clients-company.use-case';
import { ClientCompanyWithClientDTO } from 'src/application/dtos/shared/client-company-with-client.dto';
import { SubscriptionModule } from 'src/infra/modules/subscription.module';
import { DateTrasnformModule } from 'src/infra/modules/date-transform.module';
import { AuthUser } from 'src/application/common/auth-user.interface';
import { AlreadyExistException } from 'src/application/exceptions/already-exist.exception';
import { EntityNotFoundException } from 'src/application/exceptions/entity-not-found.exception';
import { NonBelongingException } from 'src/application/exceptions/non-belonging.exception';

const createClientCompanyUseCaseMock = {
  provide: CreateClientCompanyUseCase,
  useValue: {
    handle: jest.fn(),
  },
};

const listClientsCompanyUseCaseMock = {
  provide: ListClientsCompanyUseCase,
  useValue: {
    all: jest.fn(),
    one: jest.fn(),
  },
};

const updateClientCompanyUseCaseMock = {
  provide: UpdateClientCompanyUseCase,
  useValue: {
    handle: jest.fn(),
  },
};

const clientMock1 = new Client({
  id: 'client-1',
  fullName: 'JohnDoe',
  internationalId: '12345',
  createdAt: new Date(),
});

const clientCompany1 = new ClientCompany({
  id: 'client-company-1',
  clientId: clientMock1.id,
  companyId: 'company-123',
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
  companyId: 'company-123',
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
  companyId: 'company-123',
  email: 'newEmail@email.com',
  phone: '123456',
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('ClientCompanyController', () => {
  let controller: ClientCompanyController;
  let spies: any;

  const user: AuthUser = {
    id: 'user-id-123',
    email: 'company@email.com',
    role: 'COMPANY',
  };

  // Create
  const dataToCreate: CreateClientCompanyBodyDTO = {
    fullName: 'John Doe',
    internationalId: '1234567890',
    email: 'email@example.com',
    phone: '+1234567890',
  };

  // List
  const response1: ClientCompanyWithClientDTO = {
    clientCompany: clientCompany1,
    client: clientMock1,
  };

  const response2: ClientCompanyWithClientDTO = {
    clientCompany: clientCompany2,
    client: clientMock2,
  };

  const response3: ClientCompanyWithClientDTO = {
    clientCompany: clientCompany3,
    client: clientMock3,
  };

  // Update
  const clientCompanyId = 'client-company-id-123';

  const dataToUpdate: UpdateClientCompanyBodyDTO = {
    email: 'email@example.com',
    phone: '+1234567890',
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [SubscriptionModule, DateTrasnformModule],
      controllers: [ClientCompanyController],
      providers: [
        createClientCompanyUseCaseMock,
        listClientsCompanyUseCaseMock,
        updateClientCompanyUseCaseMock,
      ],
    }).compile();

    controller = moduleRef.get<ClientCompanyController>(
      ClientCompanyController,
    );
    const createClientCompanyUseCase =
      moduleRef.get<CreateClientCompanyUseCase>(CreateClientCompanyUseCase);
    const listClientsCompanyUseCase = moduleRef.get<ListClientsCompanyUseCase>(
      ListClientsCompanyUseCase,
    );
    const updateClientCompanyUseCase =
      moduleRef.get<UpdateClientCompanyUseCase>(UpdateClientCompanyUseCase);

    spies = {
      createClientCompanyUseCase: {
        handle: jest.spyOn(createClientCompanyUseCase, 'handle'),
      },
      listClientsCompanyUseCase: {
        all: jest.spyOn(listClientsCompanyUseCase, 'all'),
        one: jest.spyOn(listClientsCompanyUseCase, 'one'),
      },
      updateClientCompanyUseCase: {
        handle: jest.spyOn(updateClientCompanyUseCase, 'handle'),
      },
      mapper: {
        handle: jest.spyOn(ClientCompanyResponseMapper, 'handle'),
      },
    };
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  // ================== Create method ===================
  it('should create a client company', async () => {
    const responseUseCase = { clientCompanyId: '12345' };

    spies.createClientCompanyUseCase.handle.mockResolvedValue(responseUseCase);

    const response = await controller.create(user, dataToCreate);

    expect(spies.createClientCompanyUseCase.handle).toHaveBeenCalledWith({
      ...dataToCreate,
      companyId: user.id,
    });
    expect(response.message).toBe('Client Company successfully created');
    expect(response.clientCompanyId).toBe(responseUseCase.clientCompanyId);
  });

  it('should throw AlreadyExistException when creating a client company with existing relation', async () => {
    spies.createClientCompanyUseCase.handle.mockRejectedValue(
      new AlreadyExistException('', '', ''),
    );
    await expect(controller.create(user, dataToCreate)).rejects.toThrow(
      AlreadyExistException,
    );
  });

  // ================= FindAll method =================

  it('should find "ALL" client companies for a company', async () => {
    const responseUseCase = [response1, response2, response3];

    spies.listClientsCompanyUseCase.all.mockResolvedValue(responseUseCase);

    const returnController = await controller.findAll(user);

    expect(spies.listClientsCompanyUseCase.all).toHaveBeenCalledWith({
      companyId: user.id,
    });

    expect(spies.mapper.handle).toHaveBeenCalled();

    expect(returnController).toEqual(
      responseUseCase.map((r) =>
        ClientCompanyResponseMapper.handle(r.clientCompany, r.client),
      ),
    );
  });

  // ================= FindOne method ===================
  it('should find "ONE" client companies for a company', async () => {
    spies.listClientsCompanyUseCase.one.mockResolvedValue(response1);

    const returnController = await controller.findOne(
      response1.clientCompany.id,
      user,
    );

    expect(spies.listClientsCompanyUseCase.one).toHaveBeenCalledWith({
      companyId: user.id,
      clientCompanyId: response1.clientCompany.id,
    });

    expect(spies.mapper.handle).toHaveBeenCalled();

    expect(returnController).toEqual(
      ClientCompanyResponseMapper.handle(
        response1.clientCompany,
        response1.client,
      ),
    );
  });

  // ================= Update method ===================
  it('should update a client company', async () => {
    const client = new Client({
      id: 'client-0',
      fullName: 'John Doe',
      internationalId: '123456',
      createdAt: new Date(),
    });

    const clientCompanyUpdated = new ClientCompany({
      id: clientCompanyId,
      clientId: client.id,
      companyId: user.id,
      email: dataToUpdate.email,
      phone: dataToUpdate.phone,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    spies.updateClientCompanyUseCase.handle.mockResolvedValue({
      clientCompany: clientCompanyUpdated,
      client: client,
    });

    const response = await controller.update(
      user,
      clientCompanyId,
      dataToUpdate,
    );

    expect(spies.updateClientCompanyUseCase.handle).toHaveBeenCalledWith({
      ...dataToUpdate,
      companyId: user.id,
      clientCompanyId: clientCompanyId,
    });

    expect(spies.mapper.handle).toHaveBeenCalled();

    expect(response.message).toBe('Client Company successfully updated');
    expect(response.clientCompany).toEqual(
      ClientCompanyResponseMapper.handle(clientCompanyUpdated, client),
    );
  });

  it('should throw EntityNotFoundException when updating a non-existing client company', async () => {
    spies.updateClientCompanyUseCase.handle.mockRejectedValue(
      new EntityNotFoundException('', '', ''),
    );

    await expect(
      controller.update(user, clientCompanyId, dataToUpdate),
    ).rejects.toThrow(EntityNotFoundException);

    expect(spies.updateClientCompanyUseCase.handle).toHaveBeenCalledWith({
      ...dataToUpdate,
      companyId: user.id,
      clientCompanyId: clientCompanyId,
    });
  });

  it('should throw NonBelongingException when updating a client company not belonging to the company', async () => {
    spies.updateClientCompanyUseCase.handle.mockRejectedValue(
      new NonBelongingException('', '', ''),
    );

    await expect(
      controller.update(user, clientCompanyId, dataToUpdate),
    ).rejects.toThrow(NonBelongingException);

    expect(spies.updateClientCompanyUseCase.handle).toHaveBeenCalledWith({
      ...dataToUpdate,
      companyId: user.id,
      clientCompanyId: clientCompanyId,
    });
  });
});
