import React from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  Card,
  HelperText,
  RadioButton,
  Text,
  TextInput,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/AppNavigator';
import {
  AgendaClass,
  assignInstructorToClass,
  formatAgendaClassTime,
  getAgendaClassById,
} from '../services/agendaService';
import {
  createInstructor,
  getInstructors,
  Instructor,
} from '../services/instructorService';

type Props = NativeStackScreenProps<RootStackParamList, 'AssignInstructor'>;

export function AssignInstructorScreen({ navigation, route }: Props) {
  const { classId } = route.params;

  const [agendaClass, setAgendaClass] = React.useState<AgendaClass | null>(null);
  const [instructors, setInstructors] = React.useState<Instructor[]>([]);
  const [selectedInstructorId, setSelectedInstructorId] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [registration, setRegistration] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');

  const dismissKeyboardSafely = React.useCallback(async (delay = 120) => {
    Keyboard.dismiss();

    await new Promise<void>(resolve => {
      setTimeout(() => resolve(), delay);
    });
  }, []);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [classData, instructorData] = await Promise.all([
        getAgendaClassById(classId),
        getInstructors(),
      ]);

      setAgendaClass(classData);
      setInstructors(instructorData);

      if (classData?.instructorId) {
        setSelectedInstructorId(classData.instructorId);
      } else {
        setSelectedInstructorId('');
      }
    } catch {
      setError('Não foi possível carregar os dados da aula.');
    } finally {
      setLoading(false);
    }
  }, [classId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssignExistingInstructor = async () => {
    if (!selectedInstructorId) {
      setError('Selecione um instrutor para vincular.');
      return;
    }

    try {
      await dismissKeyboardSafely();

      setSaving(true);
      setError('');

      await assignInstructorToClass(classId, selectedInstructorId);

      Alert.alert('Sucesso', 'Instrutor vinculado à aula com sucesso.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível vincular o instrutor.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAndAssignInstructor = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Preencha nome, e-mail e senha do instrutor.');
      return;
    }

    try {
      await dismissKeyboardSafely();

      setSaving(true);
      setError('');

      const newInstructor = await createInstructor({
        name,
        email,
        password,
        registration,
      });

      await assignInstructorToClass(classId, newInstructor.id);

      Alert.alert('Sucesso', 'Instrutor cadastrado e vinculado à aula com sucesso.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível cadastrar o instrutor.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Carregando dados da aula...</Text>
      </View>
    );
  }

  if (!agendaClass) {
    return (
      <View style={styles.centered}>
        <Text>Aula não encontrada.</Text>
        <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.backButton}>
          Voltar
        </Button>
      </View>
    );
  }

  const linkedInstructor =
    instructors.find(item => item.id === agendaClass.instructorId) ?? null;

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboardRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          bounces={false}
        >
          <Text variant="headlineMedium" style={styles.title}>
            Vínculo de Instrutor
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Cadastre ou selecione um instrutor para esta aula.
          </Text>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Dados da aula</Text>
              <Text style={styles.infoText}>Treinamento: {agendaClass.trainingName}</Text>
              <Text style={styles.infoText}>Turma: {agendaClass.className}</Text>
              <Text style={styles.infoText}>Data: {agendaClass.date}</Text>
              <Text style={styles.infoText}>
                Horário: {formatAgendaClassTime(agendaClass)}
              </Text>
              <Text style={styles.infoText}>Local: {agendaClass.location}</Text>
              <Text style={styles.infoText}>Status: {agendaClass.status}</Text>

              {agendaClass.description ? (
                <Text style={styles.infoText}>Descrição: {agendaClass.description}</Text>
              ) : null}

              <Text style={styles.currentInstructor}>
                Instrutor atual:{' '}
                {linkedInstructor ? linkedInstructor.name : 'Nenhum instrutor vinculado'}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Selecionar instrutor existente</Text>

              {instructors.length === 0 ? (
                <Text style={styles.emptyText}>
                  Nenhum instrutor cadastrado ainda. Use o formulário abaixo para criar o primeiro.
                </Text>
              ) : (
                <RadioButton.Group
                  onValueChange={value => setSelectedInstructorId(value)}
                  value={selectedInstructorId}
                >
                  {instructors
                    .filter(item => item.active)
                    .map(item => (
                      <View key={item.id} style={styles.radioRow}>
                        <RadioButton value={item.id} />
                        <View style={styles.radioContent}>
                          <Text style={styles.radioTitle}>{item.name}</Text>
                          <Text style={styles.radioSubtitle}>{item.email}</Text>
                          {item.registration ? (
                            <Text style={styles.radioSubtitle}>
                              Matrícula: {item.registration}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    ))}
                </RadioButton.Group>
              )}

              <Button
                mode="contained"
                onPress={handleAssignExistingInstructor}
                disabled={saving || instructors.length === 0}
                loading={saving}
                style={styles.primaryButton}
              >
                Vincular instrutor selecionado
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Cadastrar novo instrutor</Text>

              <TextInput
                label="Nome do instrutor"
                mode="outlined"
                value={name}
                onChangeText={setName}
                style={styles.input}
                disabled={saving}
              />

              <TextInput
                label="E-mail / login"
                mode="outlined"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                disabled={saving}
              />

              <TextInput
                label="Senha"
                mode="outlined"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                disabled={saving}
              />

              <View style={styles.passwordActionRow}>
                <Button
                  mode="text"
                  compact
                  onPress={() => setShowPassword(prev => !prev)}
                  disabled={saving}
                  contentStyle={styles.passwordActionContent}
                  labelStyle={styles.passwordActionLabel}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </Button>
              </View>

              <TextInput
                label="Matrícula (opcional)"
                mode="outlined"
                value={registration}
                onChangeText={setRegistration}
                style={styles.input}
                disabled={saving}
              />

              {error ? <HelperText type="error">{error}</HelperText> : null}

              <Button
                mode="contained"
                onPress={handleCreateAndAssignInstructor}
                disabled={saving}
                loading={saving}
                style={styles.primaryButton}
              >
                Cadastrar e vincular instrutor
              </Button>
            </Card.Content>
          </Card>

          <View style={styles.footer}>
            <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.backButton}>
              Voltar
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F7FA',
  },
  keyboardRoot: {
    flex: 1,
  },
  container: {
    padding: 24,
    backgroundColor: '#F4F7FA',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F4F7FA',
    gap: 16,
  },
  title: {
    color: '#1F2A37',
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#667482',
    marginBottom: 24,
  },
  card: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2A37',
    marginBottom: 16,
  },
  infoText: {
    color: '#667482',
    marginBottom: 6,
  },
  currentInstructor: {
    color: '#0F4C81',
    fontWeight: '700',
    marginTop: 12,
  },
  emptyText: {
    color: '#667482',
    marginBottom: 12,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  radioContent: {
    flex: 1,
    paddingTop: 6,
  },
  radioTitle: {
    color: '#1F2A37',
    fontWeight: '700',
  },
  radioSubtitle: {
    color: '#667482',
    marginTop: 2,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  passwordActionRow: {
    alignItems: 'flex-end',
    marginTop: -4,
    marginBottom: 8,
  },
  passwordActionContent: {
    justifyContent: 'flex-end',
  },
  passwordActionLabel: {
    color: '#0F4C81',
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 8,
  },
  footer: {
    marginTop: 8,
    alignItems: 'center',
  },
  backButton: {
    minWidth: 180,
    borderColor: '#0F4C81',
  },
});