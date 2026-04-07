import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, Card, HelperText, Text, TextInput } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/AppNavigator';
import { loginRequest } from '../services/authService';
import { saveUserSession } from '../storage/authStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleLogin = async () => {
    if (!usuario.trim() || !senha.trim()) {
      setErro('Preencha usuário e senha.');
      return;
    }

    try {
      setLoading(true);
      setErro('');

      const session = await loginRequest({
        username: usuario.trim(),
        password: senha,
      });

      await saveUserSession(session);

      navigation.replace('Home');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível realizar o login.';
      setErro(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.leftPanel}>
        <Text style={styles.brandMini}>SETEQS TREINAMENTOS</Text>
        <Text style={styles.brandTitle}>Painel Corporativo</Text>
        <Text style={styles.brandDescription}>
          Plataforma operacional para acesso rápido aos módulos e recursos internos.
        </Text>
      </View>

      <View style={styles.rightPanel}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              Acessar sistema
            </Text>

            <Text variant="bodyMedium" style={styles.subtitle}>
              Informe suas credenciais para continuar
            </Text>

            <TextInput
              label="Usuário"
              value={usuario}
              onChangeText={setUsuario}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              disabled={loading}
            />

            <View style={styles.passwordWrapper}>
              <TextInput
                label="Senha"
                value={senha}
                onChangeText={setSenha}
                mode="outlined"
                style={styles.passwordInput}
                secureTextEntry={!mostrarSenha}
                disabled={loading}
              />

              <Button
                mode="text"
                onPress={() => setMostrarSenha(!mostrarSenha)}
                compact
                disabled={loading}
                style={styles.showPasswordButton}
                labelStyle={styles.showPasswordLabel}
              >
                {mostrarSenha ? 'Ocultar' : 'Mostrar'}
              </Button>
            </View>

            {erro ? <HelperText type="error">{erro}</HelperText> : null}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Entrar
            </Button>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F4F7FA',
  },
  leftPanel: {
    flex: 1,
    backgroundColor: '#0F4C81',
    justifyContent: 'center',
    padding: 32,
  },
  brandMini: {
    color: '#D9E8F5',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 12,
  },
  brandDescription: {
    color: '#E7F0F8',
    fontSize: 18,
    lineHeight: 26,
  },
  rightPanel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    color: '#1F2A37',
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#5B6875',
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  passwordWrapper: {
    marginBottom: 8,
  },
  passwordInput: {
    backgroundColor: '#FFFFFF',
  },
  showPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  showPasswordLabel: {
    color: '#0F4C81',
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    marginTop: 8,
  },
});