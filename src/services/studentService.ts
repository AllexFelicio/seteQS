import AsyncStorage from '@react-native-async-storage/async-storage';

const STUDENT_REGISTRATIONS_STORAGE_KEY = '@tabletkioskapp:student_registrations';

export type StudentRegistration = {
  id: string;
  classId: string;
  name: string;
  document?: string;
  registration?: string;
  createdAt: string;
};

type RegisterStudentPayload = {
  classId: string;
  name: string;
  document?: string;
  registration?: string;
};

function generateId(): string {
  return `student_reg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

export async function getStudentRegistrations(): Promise<StudentRegistration[]> {
  const data = await AsyncStorage.getItem(STUDENT_REGISTRATIONS_STORAGE_KEY);

  if (!data) {
    return [];
  }

  return JSON.parse(data) as StudentRegistration[];
}

export async function getStudentRegistrationsByClassId(
  classId: string,
): Promise<StudentRegistration[]> {
  const registrations = await getStudentRegistrations();
  return registrations.filter(item => item.classId === classId);
}

export async function getStudentRegistrationById(
  id: string,
): Promise<StudentRegistration | null> {
  const registrations = await getStudentRegistrations();
  return registrations.find(item => item.id === id) ?? null;
}

export async function registerStudentForClass(
  payload: RegisterStudentPayload,
): Promise<StudentRegistration> {
  const registrations = await getStudentRegistrations();

  const newRegistration: StudentRegistration = {
    id: generateId(),
    classId: payload.classId,
    name: payload.name.trim(),
    document: payload.document?.trim() || undefined,
    registration: payload.registration?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  const updated = [...registrations, newRegistration];

  await AsyncStorage.setItem(
    STUDENT_REGISTRATIONS_STORAGE_KEY,
    JSON.stringify(updated),
  );

  return newRegistration;
}