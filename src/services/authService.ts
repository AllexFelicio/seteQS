import { getAgendaClassById } from './agendaService';
import { getInstructorByEmail } from './instructorService';
import { UserSession } from '../storage/authStorage';

type AdminLoginPayload = {
  username: string;
  password: string;
};

type InstructorLessonLoginPayload = {
  email: string;
  password: string;
  classId: string;
};

function buildAdminSession(): UserSession {
  return {
    token: 'admin-local-token',
    user: {
      id: '1',
      name: 'Administrador Local',
      email: 'admin@local.app',
      role: 'admin',
    },
  };
}

export async function loginAdmin({
  username,
  password,
}: AdminLoginPayload): Promise<UserSession> {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 800));

  if (username === 'admin' && password === '123456') {
    return buildAdminSession();
  }

  throw new Error('Credenciais administrativas inválidas.');
}

export async function loginInstructorForClass({
  email,
  password,
  classId,
}: InstructorLessonLoginPayload): Promise<UserSession> {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 800));

  const agendaClass = await getAgendaClassById(classId);

  if (!agendaClass) {
    throw new Error('A aula informada não foi encontrada.');
  }

  if (!agendaClass.instructorId) {
    throw new Error('Esta aula não possui instructor vinculado.');
  }

  const instructor = await getInstructorByEmail(email);

  if (!instructor) {
    throw new Error('Instructor não encontrado.');
  }

  if (!instructor.active) {
    throw new Error('Este instructor está inativo.');
  }

  if (instructor.password !== password) {
    throw new Error('Senha inválida.');
  }

  if (instructor.id !== agendaClass.instructorId) {
    throw new Error('Este instructor não está vinculado a esta aula.');
  }

  return {
    token: `instructor-token-${instructor.id}`,
    user: {
      id: instructor.id,
      name: instructor.name,
      email: instructor.email,
      role: 'instrutor',
    },
  };
}