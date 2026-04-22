import React from 'react';
import { Alert, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Button, Card, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/AppNavigator';
import { getUserSession, removeUserSession, UserSession } from '../storage/authStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
type HomePanelRoute = 'ClassManagement';

type Panel = {
  title: string;
  description: string;
  route?: HomePanelRoute;
  roles: Array<'admin' | 'instrutor'>;
};

const panels: Panel[] = [
  {
    title: 'Agenda',
    description: 'Visualize e acompanhe as aulas agendadas.',
    route: 'ClassManagement',
    roles: ['admin', 'instrutor'],
  },
  {
    title: 'Relatórios',
    description: 'Acesse relatórios do sistema.',
    roles: ['admin'],
  },
];

export function HomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isCompactLayout = width < 900;
  const [session, setSession] = React.useState<UserSession | null>(null);
  const [networkLabel, setNetworkLabel] = React.useState('Sem conexão');

  React.useEffect(() => {
    async function loadSession() {
      const storedSession = await getUserSession();
      setSession(storedSession);
    }

    loadSession();

    const unsubscribe = NetInfo.addEventListener(state => {
      const isOnline = !!state.isConnected && !!state.isInternetReachable;
      setNetworkLabel(isOnline ? 'Online' : 'Sem conexão');
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await removeUserSession();
          navigation.replace('Login');
        },
      },
    ]);
  };

  const availablePanels = panels.filter(panel =>
    session?.user.role ? panel.roles.includes(session.user.role) : false,
  );

  const isOnline = networkLabel === 'Online';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View
        style={[
          styles.headerSection,
          isCompactLayout ? styles.headerSectionCompact : styles.headerSectionWide,
        ]}
      >
        <View
          style={[
            styles.welcomeContainer,
            isCompactLayout ? styles.welcomeContainerCompact : styles.welcomeContainerWide,
          ]}
        >
          <Text variant="headlineMedium" style={styles.title}>
            Bem-vindo
          </Text>
          <Text style={styles.subtitle}>{session?.user.name ?? 'Usuário'}</Text>
          <Text style={styles.subtitle}>
            Perfil: {session?.user.role === 'admin' ? 'Administrador' : 'Instrutor'}
          </Text>
        </View>

        <View
          style={[
            styles.statusContainer,
            isCompactLayout ? styles.statusContainerCompact : styles.statusContainerWide,
          ]}
        >
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Status</Text>
            <Text style={[styles.statusValue, !isOnline && styles.statusValueOffline]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
            <Text style={styles.statusDetail}>
              {isOnline ? 'Wi-Fi conectado' : 'Sem conexão'}
            </Text>
          </View>

          <Button mode="outlined" onPress={handleLogout} style={styles.logoutButton}>
            Logout
          </Button>
        </View>
      </View>

      <View style={styles.banner}>
        <Text variant="headlineSmall" style={styles.bannerTitle}>
          Painel principal
        </Text>
        <Text style={styles.bannerText}>
          Gerencie a agenda de aulas e acompanhe os recursos locais do aplicativo.
        </Text>
      </View>

      <View style={styles.grid}>
        {availablePanels.map(panel => (
          <Card
            key={panel.title}
            style={styles.card}
            onPress={() => {
              if (panel.route) {
                navigation.navigate(panel.route);
              } else {
                Alert.alert('Em breve', 'Este módulo será implementado futuramente.');
              }
            }}
          >
            <Card.Content>
              <Text style={styles.cardTitle}>{panel.title}</Text>
              <Text style={styles.cardDescription}>{panel.description}</Text>
            </Card.Content>
          </Card>
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
  headerSection: {
    marginBottom: 20,
  },
  headerSectionWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 16,
  },
  headerSectionCompact: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  welcomeContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    minHeight: 140,
  },
  welcomeContainerWide: {
    flex: 2.4,
  },
  welcomeContainerCompact: {
    flex: 1,
  },
  statusContainer: {
    justifyContent: 'space-between',
  },
  statusContainerWide: {
    flex: 1,
  },
  statusContainerCompact: {
    flex: 1,
  },
  title: {
    color: '#1F2A37',
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: '#667482',
    marginTop: 2,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    minHeight: 100,
    justifyContent: 'center',
  },
  statusTitle: {
    color: '#667482',
    marginBottom: 6,
  },
  statusValue: {
    color: '#2E7D32',
    fontWeight: '700',
    fontSize: 22,
    marginBottom: 4,
  },
  statusValueOffline: {
    color: '#B3261E',
  },
  statusDetail: {
    color: '#667482',
  },
  logoutButton: {
    alignSelf: 'center',
    minWidth: 140,
    borderColor: '#94A3B8',
  },
  banner: {
    backgroundColor: '#0F4C81',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: 8,
  },
  bannerText: {
    color: '#DCE7F2',
  },
  grid: {
    gap: 16,
  },
  card: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2A37',
    marginBottom: 8,
  },
  cardDescription: {
    color: '#667482',
  },
});