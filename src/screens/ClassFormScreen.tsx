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
import {
  createAgendaClass,
  CreateAgendaClassPayload,
} from '../services/agendaService';

type Props = NativeStackScreenProps<RootStackParamList, 'ClassForm'>;

export function ClassFormScreen({ navigation }: Props) {
  const [trainingName, setTrainingName] = React.useState('');
  const [className, setClassName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [date, setDate] = React.useState('');
  const [startTime, setStartTime] = React.useState('');
  const [endTime, setEndTime] = React.useState('');
  const [location, setLocation] = React.useState('');

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const dismissKeyboardSafely = React.useCallback(async (delay = 120) => {
    Keyboard.dismiss();

    await new Promise<void>(resolve => {
      setTimeout(() => resolve(), delay);
    });
  }, []);

  const handleCreateClass = async () => {
    const payload: CreateAgendaClassPayload = {
      trainingName,
      className,
      description,
      date,
      startTime,
      endTime,
      location,
      status: 'Agendado',
    };

    try {
      await dismissKeyboardSafely();

      setLoading(true);
      setError('');

      await createAgendaClass(payload);

      await dismissKeyboardSafely();

      navigation.goBack();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível cadastrar a aula.';
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
                  Cadastro de Aula
                </Text>

                <Text style={styles.subtitle}>
                  Preencha as informações da aula para disponibilizá-la na agenda.
                </Text>

                <TextInput
                  label="Nome do treinamento"
                  mode="outlined"
                  value={trainingName}
                  onChangeText={setTrainingName}
                  style={styles.input}
                  disabled={loading}
                />

                <TextInput
                  label="Turma"
                  mode="outlined"
                  value={className}
                  onChangeText={setClassName}
                  style={styles.input}
                  disabled={loading}
                />

                <TextInput
                  label="Descrição (opcional)"
                  mode="outlined"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  style={styles.input}
                  disabled={loading}
                />

                <TextInput
                  label="Data da aula (AAAA-MM-DD)"
                  mode="outlined"
                  value={date}
                  onChangeText={setDate}
                  style={styles.input}
                  disabled={loading}
                />

                <TextInput
                  label="Horário inicial (HH:mm)"
                  mode="outlined"
                  value={startTime}
                  onChangeText={setStartTime}
                  style={styles.input}
                  disabled={loading}
                />

                <TextInput
                  label="Horário final (HH:mm)"
                  mode="outlined"
                  value={endTime}
                  onChangeText={setEndTime}
                  style={styles.input}
                  disabled={loading}
                />

                <TextInput
                  label="Local"
                  mode="outlined"
                  value={location}
                  onChangeText={setLocation}
                  style={styles.input}
                  disabled={loading}
                  returnKeyType="done"
                  onSubmitEditing={handleCreateClass}
                />

                {error ? <HelperText type="error">{error}</HelperText> : null}

                <View style={styles.actions}>
                  <Button
                    mode="outlined"
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>

                  <Button
                    mode="contained"
                    onPress={handleCreateClass}
                    loading={loading}
                    disabled={loading}
                  >
                    Salvar aula
                  </Button>
                </View>
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
    maxWidth: 620,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    color: '#1F2A37',
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#667482',
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  actions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
});