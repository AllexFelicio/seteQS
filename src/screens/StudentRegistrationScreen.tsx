import React from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Card, HelperText, Text, TextInput } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/AppNavigator';
import { getAgendaClassById, formatAgendaClassTime} from '../services/agendaService';
import { registerStudentForClass } from '../services/studentService';

type Props = NativeStackScreenProps<RootStackParamList, 'StudentRegistration'>;

export function StudentRegistrationScreen({ navigation, route }: Props) {
  const { classId } = route.params;

  const [classTitle, setClassTitle] = React.useState('');
  const [classSubtitle, setClassSubtitle] = React.useState('');

  const [name, setName] = React.useState('');
  const [document, setDocument] = React.useState('');
  const [registration, setRegistration] = React.useState('');

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const dismissKeyboardSafely = React.useCallback(async (delay = 120) => {
    Keyboard.dismiss();

    await new Promise<void>(resolve => {
      setTimeout(() => resolve(), delay);
    });
  }, []);

  React.useEffect(() => {
    async function loadContext() {
      const agendaClass = await getAgendaClassById(classId);

      if (agendaClass) {
        setClassTitle(agendaClass.trainingName);
        setClassSubtitle(
          `${agendaClass.className} • ${formatAgendaClassTime(agendaClass)} • ${agendaClass.location}`,
        );
      }
    }

    loadContext();
  }, [classId]);

  const handleRegisterStudent = async () => {
    if (!name.trim()) {
      setError('Informe pelo menos o nome do aluno.');
      return;
    }

    try {
      await dismissKeyboardSafely();

      setLoading(true);
      setError('');

      const registrationData = await registerStudentForClass({
        classId,
        name,
        document,
        registration,
      });

      await dismissKeyboardSafely();

      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'StudentMaterials',
            params: {
              classId,
              studentRegistrationId: registrationData.id,
            },
          },
        ],
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível registrar o aluno.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboardRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          bounces={false}
        >
          <View style={styles.contentWrap}>
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="headlineMedium" style={styles.title}>
                  Cadastro do aluno
                </Text>

                <Text style={styles.classTitle}>
                  {classTitle || 'Carregando aula...'}
                </Text>

                {classSubtitle ? (
                  <Text style={styles.classSubtitle}>{classSubtitle}</Text>
                ) : null}

                <Text style={styles.sectionTitle}>
                  Registre o aluno que utilizará este tablet nesta aula.
                </Text>

                <TextInput
                  label="Nome do aluno"
                  mode="outlined"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  disabled={loading}
                />

                <TextInput
                  label="Documento"
                  mode="outlined"
                  value={document}
                  onChangeText={setDocument}
                  style={styles.input}
                  disabled={loading}
                />

                <TextInput
                  label="Matrícula"
                  mode="outlined"
                  value={registration}
                  onChangeText={setRegistration}
                  style={styles.input}
                  disabled={loading}
                  returnKeyType="done"
                  onSubmitEditing={handleRegisterStudent}
                />

                {error ? <HelperText type="error">{error}</HelperText> : null}

                <Button
                  mode="contained"
                  onPress={handleRegisterStudent}
                  loading={loading}
                  disabled={loading}
                  style={styles.primaryButton}
                >
                  Registrar aluno e continuar
                </Button>
              </Card.Content>
            </Card>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  contentWrap: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 560,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    color: '#1F2A37',
    fontWeight: '800',
    marginBottom: 16,
  },
  classTitle: {
    color: '#0F4C81',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 6,
  },
  classSubtitle: {
    color: '#667482',
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#1F2A37',
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 22,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  primaryButton: {
    marginTop: 8,
  },
});