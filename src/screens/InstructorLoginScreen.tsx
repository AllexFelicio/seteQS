import React from 'react';
import {
  BackHandler,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Card, HelperText, Text, TextInput } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import { RootStackParamList } from '../navigation/AppNavigator';
import { getAgendaClassById, formatAgendaClassTime} from '../services/agendaService';
import { getInstructorById } from '../services/instructorService';
import { loginAdmin, loginInstructorForClass } from '../services/authService';
import { saveUserSession } from '../storage/authStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'InstructorLogin'>;

export function InstructorLoginScreen({ navigation, route }: Props) {
  const { classId } = route.params;

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [classTitle, setClassTitle] = React.useState('');
  const [classSubtitle, setClassSubtitle] = React.useState('');
  const [expectedInstructor, setExpectedInstructor] = React.useState('');

  const [showAdminReturnModal, setShowAdminReturnModal] = React.useState(false);
  const [adminUsername, setAdminUsername] = React.useState('');
  const [adminPassword, setAdminPassword] = React.useState('');
  const [showAdminPassword, setShowAdminPassword] = React.useState(false);
  const [adminReturnLoading, setAdminReturnLoading] = React.useState(false);
  const [adminReturnError, setAdminReturnError] = React.useState('');

  const dismissKeyboardSafely = React.useCallback(async (delay = 120) => {
    Keyboard.dismiss();

    await new Promise<void>(resolve => {
      setTimeout(() => resolve(), delay);
    });
  }, []);

  const resetAdminModalState = React.useCallback(() => {
    setAdminUsername('');
    setAdminPassword('');
    setShowAdminPassword(false);
    setAdminReturnError('');
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => true;
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, []),
  );

  React.useEffect(() => {
    async function loadContext() {
      try {
        setError('');

        const agendaClass = await getAgendaClassById(classId);

        if (!agendaClass) {
          setError('Aula não encontrada.');
          return;
        }

        setClassTitle(agendaClass.trainingName);
        setClassSubtitle(
          `${agendaClass.className} • ${formatAgendaClassTime(agendaClass)} • ${agendaClass.location}`,
        );

        if (agendaClass.instructorId) {
          const instructor = await getInstructorById(agendaClass.instructorId);
          setExpectedInstructor(instructor?.name ?? 'Instructor não encontrado');
        } else {
          setExpectedInstructor('Nenhum instructor vinculado');
        }
      } catch {
        setError('Não foi possível carregar os dados da aula.');
      }
    }

    loadContext();
  }, [classId]);

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', async () => {
      await dismissKeyboardSafely(160);

      if (showAdminReturnModal) {
        setShowAdminReturnModal(false);
        resetAdminModalState();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [dismissKeyboardSafely, resetAdminModalState, showAdminReturnModal]);

  const handleInstructorLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Preencha e-mail e senha.');
      return;
    }

    try {
      await dismissKeyboardSafely();

      setLoading(true);
      setError('');

      const session = await loginInstructorForClass({
        email: email.trim(),
        password,
        classId,
      });

      await saveUserSession(session);

      setError('');

      await dismissKeyboardSafely();

      navigation.reset({
        index: 0,
        routes: [{ name: 'StudentRegistration', params: { classId } }],
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível validar o instructor.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const openAdminReturnModal = async () => {
    await dismissKeyboardSafely();

    resetAdminModalState();
    setShowAdminReturnModal(true);
  };

  const closeAdminReturnModal = async () => {
    if (adminReturnLoading) {
      return;
    }

    await dismissKeyboardSafely();

    setShowAdminReturnModal(false);
    resetAdminModalState();
  };

  const handleBackToAdministrative = async () => {
    if (!adminUsername.trim() || !adminPassword.trim()) {
      setAdminReturnError('Preencha usuário e senha do administrativo.');
      return;
    }

    try {
      await dismissKeyboardSafely();

      setAdminReturnLoading(true);
      setAdminReturnError('');

      const adminSession = await loginAdmin({
        username: adminUsername.trim(),
        password: adminPassword,
      });

      await saveUserSession(adminSession);

      setShowAdminReturnModal(false);
      resetAdminModalState();

      await dismissKeyboardSafely();

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível retornar ao administrativo.';
      setAdminReturnError(message);
    } finally {
      setAdminReturnLoading(false);
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
                  Login do Instrutor
                </Text>

                <Text style={styles.classTitle}>
                  {classTitle || 'Carregando aula...'}
                </Text>

                {classSubtitle ? (
                  <Text style={styles.classSubtitle}>{classSubtitle}</Text>
                ) : null}

                {expectedInstructor ? (
                  <Text style={styles.expectedInstructor}>
                    Instrutor vinculado: {expectedInstructor}
                  </Text>
                ) : null}

                <TextInput
                  label="E-mail / login"
                  mode="outlined"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  style={styles.input}
                  disabled={loading}
                  returnKeyType="next"
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
                  disabled={loading}
                  returnKeyType="done"
                  onSubmitEditing={handleInstructorLogin}
                />

                <View style={styles.passwordActionRow}>
                  <Button
                    mode="text"
                    compact
                    onPress={() => setShowPassword(prev => !prev)}
                    disabled={loading}
                    contentStyle={styles.passwordActionContent}
                    labelStyle={styles.passwordActionLabel}
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </View>

                {error ? <HelperText type="error">{error}</HelperText> : null}

                <Button
                  mode="contained"
                  onPress={handleInstructorLogin}
                  loading={loading}
                  disabled={loading}
                  style={styles.primaryButton}
                >
                  Validar e iniciar aula
                </Button>

                <Button
                  mode="text"
                  onPress={openAdminReturnModal}
                  disabled={loading}
                  style={styles.secondaryButton}
                >
                  Voltar ao administrativo
                </Button>
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showAdminReturnModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        presentationStyle="overFullScreen"
        onRequestClose={closeAdminReturnModal}
      >
        <View style={styles.modalScreen}>
          <KeyboardAvoidingView
            style={styles.modalKeyboardRoot}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
          >
            <View style={styles.modalContentCenter}>
              <Card style={styles.modalFixedCard}>
                <Card.Content>
                  <Text variant="headlineSmall" style={styles.modalTitle}>
                    Retornar ao administrativo
                  </Text>

                  <Text style={styles.modalText}>
                    Informe as credenciais administrativas para voltar ao painel inicial.
                  </Text>

                  <TextInput
                    label="Usuário administrativo"
                    mode="outlined"
                    value={adminUsername}
                    onChangeText={setAdminUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    disabled={adminReturnLoading}
                    style={styles.input}
                    returnKeyType="next"
                  />

                  <TextInput
                    label="Senha administrativa"
                    mode="outlined"
                    value={adminPassword}
                    onChangeText={setAdminPassword}
                    secureTextEntry={!showAdminPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    disabled={adminReturnLoading}
                    style={styles.input}
                    returnKeyType="done"
                    onSubmitEditing={handleBackToAdministrative}
                  />

                  <View style={styles.passwordActionRow}>
                    <Button
                      mode="text"
                      compact
                      onPress={() => setShowAdminPassword(prev => !prev)}
                      disabled={adminReturnLoading}
                      contentStyle={styles.passwordActionContent}
                      labelStyle={styles.passwordActionLabel}
                    >
                      {showAdminPassword ? 'Ocultar' : 'Mostrar'}
                    </Button>
                  </View>

                  {adminReturnError ? (
                    <HelperText type="error">{adminReturnError}</HelperText>
                  ) : null}

                  <View style={styles.modalActions}>
                    <Button
                      mode="text"
                      onPress={closeAdminReturnModal}
                      disabled={adminReturnLoading}
                    >
                      Cancelar
                    </Button>

                    <Button
                      mode="contained"
                      onPress={handleBackToAdministrative}
                      loading={adminReturnLoading}
                      disabled={adminReturnLoading}
                    >
                      Entrar no administrativo
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
    maxWidth: 520,
    minHeight: 420,
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
    marginBottom: 6,
  },
  expectedInstructor: {
    color: '#1F2A37',
    fontWeight: '600',
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  primaryButton: {
    marginTop: 8,
  },
  secondaryButton: {
    marginTop: 8,
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
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  modalRoot: {
    flex: 1,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    color: '#1F2A37',
    fontWeight: '800',
    marginBottom: 12,
  },
  modalText: {
    color: '#667482',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  modalScreen: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  modalKeyboardRoot: {
    flex: 1,
  },
  modalContentCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalFixedCard: {
    width: '100%',
    maxWidth: 520,
    minHeight: 320,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
});