import AsyncStorage from '@react-native-async-storage/async-storage';

const INSTRUCTORS_STORAGE_KEY = '@tabletkioskapp:instructors';

export type Instructor = {
  id: string;
  name: string;
  email: string;
  password: string;
  registration?: string;
  active: boolean;
};

type CreateInstructorPayload = {
  name: string;
  email: string;
  password: string;
  registration?: string;
};

function generateId(): string {
  return `instr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

export async function getInstructors(): Promise<Instructor[]> {
  const data = await AsyncStorage.getItem(INSTRUCTORS_STORAGE_KEY);

  if (!data) {
    return [];
  }

  return JSON.parse(data) as Instructor[];
}

export async function getInstructorById(id: string): Promise<Instructor | null> {
  const instructors = await getInstructors();
  return instructors.find(item => item.id === id) ?? null;
}

export async function getInstructorByEmail(email: string): Promise<Instructor | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const instructors = await getInstructors();

  return (
    instructors.find(item => item.email.trim().toLowerCase() === normalizedEmail) ?? null
  );
}

export async function createInstructor(
  payload: CreateInstructorPayload,
): Promise<Instructor> {
  const instructors = await getInstructors();

  const emailAlreadyExists = instructors.some(
    item => item.email.trim().toLowerCase() === payload.email.trim().toLowerCase(),
  );

  if (emailAlreadyExists) {
    throw new Error('Já existe um professor cadastrado com este e-mail.');
  }

  const newInstructor: Instructor = {
    id: generateId(),
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    registration: payload.registration?.trim() || undefined,
    active: true,
  };

  const updated = [...instructors, newInstructor];

  await AsyncStorage.setItem(INSTRUCTORS_STORAGE_KEY, JSON.stringify(updated));

  return newInstructor;
}