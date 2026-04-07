import { UserSession } from '../storage/authStorage';

type LoginPayload = {
  username: string;
  password: string;
};

export async function loginRequest({
  username,
  password,
}: LoginPayload): Promise<UserSession> {
  await new Promise<void>(resolve => {
    setTimeout(() => resolve(), 1200);
  });

  if (username === 'admin' && password === '123456') {
    return {
      token: 'fake-jwt-token-admin',
      user: {
        id: '1',
        name: 'Administrador',
        email: 'admin@seteqs.com.br',
        role: 'admin',
      },
    };
  }

  if (username === 'instrutor' && password === '123456') {
    return {
      token: 'fake-jwt-token-instrutor',
      user: {
        id: '2',
        name: 'Instrutor',
        email: 'instrutor@seteqs.com.br',
        role: 'instrutor',
      },
    };
  }

  throw new Error('Usuário ou senha inválidos.');
}