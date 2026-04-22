import AsyncStorage from '@react-native-async-storage/async-storage';

const AGENDA_STORAGE_KEY = '@tabletkioskapp:agenda_classes';

export type AgendaStatus = 'Agendado' | 'Em andamento' | 'Concluído';

export type AgendaClass = {
  id: string;
  trainingName: string;
  className: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: AgendaStatus;
  instructorId?: string;
};

export type CreateAgendaClassPayload = {
  trainingName: string;
  className: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status?: AgendaStatus;
  instructorId?: string;
};

export type UpdateAgendaClassPayload = Partial<CreateAgendaClassPayload>;

const initialClasses: AgendaClass[] = [
  {
    id: '1',
    trainingName: 'NR-35 Trabalho em Altura',
    className: 'Turma A',
    description: 'Treinamento introdutório de segurança para trabalho em altura.',
    date: '2026-04-22',
    startTime: '08:00',
    endTime: '12:00',
    location: 'Sala 01',
    status: 'Agendado',
  },
  {
    id: '2',
    trainingName: 'Primeiros Socorros',
    className: 'Turma B',
    description: 'Capacitação básica para atendimento inicial de emergência.',
    date: '2026-04-22',
    startTime: '13:30',
    endTime: '17:30',
    location: 'Sala 03',
    status: 'Em andamento',
  },
];

function generateId(): string {
  return `class_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

async function ensureAgendaSeed(): Promise<void> {
  const existing = await AsyncStorage.getItem(AGENDA_STORAGE_KEY);

  if (!existing) {
    await AsyncStorage.setItem(AGENDA_STORAGE_KEY, JSON.stringify(initialClasses));
  }
}

function normalizeAgendaClass(item: any): AgendaClass {
  if (item.trainingName && item.className && item.date && item.startTime && item.endTime) {
    return item as AgendaClass;
  }

  return {
    id: String(item.id),
    trainingName: item.training ?? '',
    className: item.group ?? '',
    description: item.description ?? undefined,
    date: item.date ?? '',
    startTime: extractStartTime(item.time),
    endTime: extractEndTime(item.time),
    location: item.location ?? '',
    status: item.status ?? 'Agendado',
    instructorId: item.instructorId ?? undefined,
  };
}

function extractStartTime(time?: string): string {
  if (!time) {
    return '';
  }

  const parts = time.split(' às ');
  return parts[0]?.trim() ?? '';
}

function extractEndTime(time?: string): string {
  if (!time) {
    return '';
  }

  const parts = time.split(' às ');
  return parts[1]?.trim() ?? '';
}

function validateRequiredFields(payload: CreateAgendaClassPayload): void {
  if (!payload.trainingName.trim()) {
    throw new Error('Informe o nome do treinamento.');
  }

  if (!payload.className.trim()) {
    throw new Error('Informe o nome da turma.');
  }

  if (!payload.date.trim()) {
    throw new Error('Informe a data da aula.');
  }

  if (!payload.startTime.trim()) {
    throw new Error('Informe o horário inicial da aula.');
  }

  if (!payload.endTime.trim()) {
    throw new Error('Informe o horário final da aula.');
  }

  if (!payload.location.trim()) {
    throw new Error('Informe o local da aula.');
  }
}

export function formatAgendaClassTime(item: AgendaClass): string {
  return `${item.startTime} às ${item.endTime}`;
}

export async function getAgendaClasses(): Promise<AgendaClass[]> {
  await ensureAgendaSeed();

  const data = await AsyncStorage.getItem(AGENDA_STORAGE_KEY);

  if (!data) {
    return [];
  }

  const parsed = JSON.parse(data) as any[];

  return parsed.map(normalizeAgendaClass);
}

export async function getAgendaClassById(id: string): Promise<AgendaClass | null> {
  const classes = await getAgendaClasses();
  return classes.find(item => item.id === id) ?? null;
}

export async function saveAgendaClasses(classes: AgendaClass[]): Promise<void> {
  await AsyncStorage.setItem(AGENDA_STORAGE_KEY, JSON.stringify(classes));
}

export async function createAgendaClass(
  payload: CreateAgendaClassPayload,
): Promise<AgendaClass> {
  validateRequiredFields(payload);

  const classes = await getAgendaClasses();

  const newClass: AgendaClass = {
    id: generateId(),
    trainingName: payload.trainingName.trim(),
    className: payload.className.trim(),
    description: payload.description?.trim() || undefined,
    date: payload.date.trim(),
    startTime: payload.startTime.trim(),
    endTime: payload.endTime.trim(),
    location: payload.location.trim(),
    status: payload.status ?? 'Agendado',
    instructorId: payload.instructorId ?? undefined,
  };

  const updated = [...classes, newClass];

  await saveAgendaClasses(updated);

  return newClass;
}

export async function updateAgendaClass(
  classId: string,
  payload: UpdateAgendaClassPayload,
): Promise<AgendaClass> {
  const classes = await getAgendaClasses();
  const current = classes.find(item => item.id === classId);

  if (!current) {
    throw new Error('Aula não encontrada.');
  }

  const updatedClass: AgendaClass = {
    ...current,
    trainingName: payload.trainingName?.trim() ?? current.trainingName,
    className: payload.className?.trim() ?? current.className,
    description:
      payload.description !== undefined
        ? payload.description.trim() || undefined
        : current.description,
    date: payload.date?.trim() ?? current.date,
    startTime: payload.startTime?.trim() ?? current.startTime,
    endTime: payload.endTime?.trim() ?? current.endTime,
    location: payload.location?.trim() ?? current.location,
    status: payload.status ?? current.status,
    instructorId:
      payload.instructorId !== undefined ? payload.instructorId : current.instructorId,
  };

  validateRequiredFields({
    trainingName: updatedClass.trainingName,
    className: updatedClass.className,
    description: updatedClass.description,
    date: updatedClass.date,
    startTime: updatedClass.startTime,
    endTime: updatedClass.endTime,
    location: updatedClass.location,
    status: updatedClass.status,
    instructorId: updatedClass.instructorId,
  });

  const updated = classes.map(item => (item.id === classId ? updatedClass : item));

  await saveAgendaClasses(updated);

  return updatedClass;
}

export async function deleteAgendaClass(classId: string): Promise<void> {
  const classes = await getAgendaClasses();
  const updated = classes.filter(item => item.id !== classId);

  await saveAgendaClasses(updated);
}

export async function assignInstructorToClass(
  classId: string,
  instructorId: string,
): Promise<void> {
  await updateAgendaClass(classId, { instructorId });
}

export async function removeInstructorFromClass(classId: string): Promise<void> {
  const classes = await getAgendaClasses();

  const updated = classes.map(item =>
    item.id === classId
      ? {
          ...item,
          instructorId: undefined,
        }
      : item,
  );

  await saveAgendaClasses(updated);
}