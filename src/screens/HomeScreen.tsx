import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import NetInfo from '@react-native-community/netinfo';

import { RootStackParamList } from '../navigation/AppNavigator';
import {
  getUserSession,
  removeUserSession,
  UserRole,
  UserSession,
} from '../storage/authStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

type Panel = {
  title: string;
  description: string;
  roles: UserRole[];
  route?: keyof RootStackParamList;
};

const panels: Panel[] = [
  {
    title: 'Treinamentos',
    description: 'Acesse módulos, conteúdos e jornadas de capacitação.',
    roles: ['admin', 'instrutor'],
    route: 'InstructorTrainings',
  },
  {
    title: 'Agenda',
    description: 'Visualize cronogramas, eventos e atividades programadas.',
    roles: ['admin', 'instrutor'],
    route: 'InstructorAgenda',
  },
  {
    title: 'Consultas',
    description: 'Pesquise informações operacionais e registros internos.',
    roles: ['admin'],
  },
  {
    title: 'Alunos',
    description: 'Gerencie dados e acompanhamento dos participantes.',
    roles: ['admin'],
  },
  {
    title: 'Relatórios',
    description: 'Acompanhe indicadores, presença e resultados.',
    roles: ['admin'],
  },
  {
    title: 'Configurações',
    description: 'Ajustes internos, sincronização e parâmetros do tablet.',
    roles: ['admin'],
  },
];

export function HomeScreen({ navigation }: Props) {
  const [status, setStatus] = React.useState<'Online' | 'Offline'>('Offline');
  const [connectionLabel, setConnectionLabel] = React.useState('Sem conexão');
  const [session, setSession] = React.useState<UserSession | null>(null);

  React.useEffect(() => {
    async function loadSession() {
      const savedSession = await getUserSession();
      setSession(savedSession);
    }

    loadSession();
  }, []);

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isWifi = state.type === 'wifi';
      const hasInternet =
        state.isConnected === true && state.isInternetReachable !== false;

      if (isWifi && hasInternet) {
        setStatus('Online');
        setConnectionLabel('Wi-Fi conectado');
      } else {
        setStatus('Offline');
        setConnectionLabel('Sem conexão');
      }
    });

    return unsubscribe;
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Confirmar logout',
      'Deseja realmente sair e voltar para a tela de login?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await removeUserSession();
            navigation.replace('Login');
          },
        },
      ],
    );
  };

  const handleOpenPanel = (panel: Panel) => {
    if (panel.route) {
      navigation.navigate(panel.route);
      return;
    }

    Alert.alert('Em breve', `O módulo "${panel.title}" será implementado.`);
  };

  const online = status === 'Online';
  const userRole = session?.user.role ?? 'instrutor';
  const userName = session?.user.name ?? 'Usuário';

  const visiblePanels = panels.filter(panel => panel.roles.includes(userRole));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text variant="headlineMedium" style={styles.title}>
            Painel Inicial
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Bem-vindo, {userName}
          </Text>
          <Text style={styles.profileText}>
            Perfil: {userRole === 'admin' ? 'Administrador' : 'Instrutor'}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.statusBox}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text style={[styles.statusValue, online ? styles.online : styles.offline]}>
              {status}
            </Text>
            <Text style={styles.connectionText}>{connectionLabel}</Text>
          </View>

          <Button mode="outlined" onPress={handleLogout} style={styles.logoutButton}>
            Logout
          </Button>
        </View>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Ambiente corporativo</Text>
        <Text style={styles.bannerText}>
          Acesse rapidamente os principais módulos do sistema em uma interface
          simples, organizada e preparada para uso em tablet.
        </Text>
      </View>

      <View style={styles.grid}>
        {visiblePanels.map(panel => (
          <Pressable key={panel.title} onPress={() => handleOpenPanel(panel)} style={styles.pressable}>
            <Card style={styles.card} mode="elevated">
              <Card.Content>
                <Text variant="titleLarge" style={styles.cardTitle}>
                  {panel.title}
                </Text>
                <Text variant="bodyMedium" style={styles.cardText}>
                  {panel.description}
                </Text>
              </Card.Content>
            </Card>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#F4F7FA',
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 12,
  },
  title: {
    fontWeight: '800',
    color: '#1F2A37',
    marginBottom: 6,
  },
  subtitle: {
    color: '#667482',
    marginBottom: 4,
  },
  profileText: {
    color: '#0F4C81',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    minWidth: 150,
    borderWidth: 1,
    borderColor: '#D6E0EA',
  },
  statusLabel: {
    fontSize: 12,
    color: '#667482',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  online: {
    color: '#0F8A3C',
  },
  offline: {
    color: '#C62828',
  },
  connectionText: {
    fontSize: 12,
    color: '#667482',
  },
  logoutButton: {
    borderColor: '#0F4C81',
  },
  banner: {
    backgroundColor: '#0F4C81',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 10,
  },
  bannerText: {
    color: '#E8F1F8',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 760,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  pressable: {
    width: '48%',
    minWidth: 280,
  },
  card: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    fontWeight: '700',
    color: '#1F2A37',
    marginBottom: 8,
  },
  cardText: {
    color: '#667482',
    lineHeight: 22,
  },
});