import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Button, Card, HelperText, Text, TextInput } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


import { RootStackParamList } from '../navigation/AppNavigator';
import { loginAdmin } from '../services/authService';
import { saveUserSession } from '../storage/authStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isPortraitLike = width < 900;

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Preencha usuário e senha.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const session = await loginAdmin({
        username: username.trim(),
        password,
      });

      await saveUserSession(session);
      navigation.replace('Home');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível realizar o login.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View
          style={[
            styles.container,
            isPortraitLike ? styles.containerPortrait : styles.containerLandscape,
          ]}
        >
          <View
            style={[
              styles.leftPanel,
              isPortraitLike ? styles.leftPanelPortrait : styles.leftPanelLandscape,
            ]}
          >
            <Text variant="headlineLarge" style={styles.brandTitle}>
              SETE QS TREINAMENTOS
            </Text>
            <Text variant="bodyLarge" style={styles.brandText}>
              Acesso administrativo local para configuração das agendas e vínculo dos
              instrutores.
            </Text>
          </View>

          <View
            style={[
              styles.rightPanel,
              isPortraitLike ? styles.rightPanelPortrait : styles.rightPanelLandscape,
            ]}
          >
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="headlineSmall" style={styles.cardTitle}>
                  Acessar o sistema
                </Text>

                <TextInput
                  label="Usuário"
                  mode="outlined"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
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
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                  style={styles.loginButton}
                >
                  Entrar
                </Button>
              </Card.Content>
            </Card>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#F4F7FA',
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F7FA',
  },
  containerLandscape: {
    flexDirection: 'row',
  },
  containerPortrait: {
    flexDirection: 'column',
  },
  leftPanel: {
    backgroundColor: '#0F4C81',
    justifyContent: 'center',
    padding: 32,
  },
  leftPanelLandscape: {
    flex: 1,
  },
  leftPanelPortrait: {
    minHeight: 220,
  },
  rightPanel: {
    justifyContent: 'center',
    padding: 24,
  },
  rightPanelLandscape: {
    flex: 1,
  },
  rightPanelPortrait: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 24,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: 16,
  },
  brandText: {
    color: '#DCE7F2',
    maxWidth: 420,
  },
  card: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  cardTitle: {
    marginBottom: 20,
    color: '#1F2A37',
    fontWeight: '700',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  loginButton: {
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
});