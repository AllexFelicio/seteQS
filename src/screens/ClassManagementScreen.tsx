import React from 'react';
import { Alert, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import { RootStackParamList } from '../navigation/AppNavigator';
import {
  AgendaClass,
  deleteAgendaClass,
  formatAgendaClassTime,
  getAgendaClasses,
} from '../services/agendaService';
import { getInstructors, Instructor } from '../services/instructorService';

type Props = NativeStackScreenProps<RootStackParamList, 'ClassManagement'>;

export function ClassManagementScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isCompactLayout = width < 900;

  const [classes, setClasses] = React.useState<AgendaClass[]>([]);
  const [instructors, setInstructors] = React.useState<Instructor[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);

      const [agendaData, instructorData] = await Promise.all([
        getAgendaClasses(),
        getInstructors(),
      ]);

      setClasses(agendaData);
      setInstructors(instructorData);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar as aulas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const getInstructorName = (instructorId?: string) => {
    if (!instructorId) {
      return 'Nenhum instrutor vinculado';
    }

    const found = instructors.find(item => item.id === instructorId);
    return found ? found.name : 'Instrutor não encontrado';
  };

  const handleDeleteClass = (item: AgendaClass) => {
    Alert.alert(
      'Excluir aula',
      `Deseja excluir a aula "${item.trainingName}" da ${item.className}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAgendaClass(item.id);
              await loadData();
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir a aula.');
            }
          },
        },
      ],
    );
  };

  const handleStartClass = (item: AgendaClass) => {
    if (!item.instructorId) {
      Alert.alert(
        'Instrutor obrigatório',
        'Antes de iniciar a aula, vincule um instrutor responsável.',
      );
      return;
    }

    navigation.navigate('InstructorLogin', { classId: item.id });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View
        style={[
          styles.header,
          isCompactLayout ? styles.headerCompact : styles.headerWide,
        ]}
      >
        <View style={styles.headerTextContainer}>
          <Text variant="headlineMedium" style={styles.title}>
            Gestão de Aulas
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Cadastre, acompanhe, vincule instrutores e inicie as aulas.
          </Text>
        </View>

        {!isCompactLayout ? (
          <Button
            mode="contained"
            onPress={() => navigation.navigate('ClassForm')}
            style={styles.newClassButtonWide}
          >
            Nova aula
          </Button>
        ) : null}
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Carregando aulas...</Text>
      ) : classes.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyTitle}>Nenhuma aula cadastrada</Text>
            <Text style={styles.emptyText}>
              Use o botão “Nova aula” para cadastrar a primeira aula.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <View style={styles.list}>
          {classes.map(item => (
            <Card key={item.id} style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>{item.trainingName}</Text>
                <Text style={styles.cardText}>Turma: {item.className}</Text>
                <Text style={styles.cardText}>Data: {item.date}</Text>
                <Text style={styles.cardText}>
                  Horário: {formatAgendaClassTime(item)}
                </Text>
                <Text style={styles.cardText}>Local: {item.location}</Text>

                {item.description ? (
                  <Text style={styles.cardText}>Descrição: {item.description}</Text>
                ) : null}

                <Text style={styles.cardStatus}>Status: {item.status}</Text>
                <Text style={styles.cardInstructor}>
                  Instrutor: {getInstructorName(item.instructorId)}
                </Text>

                <View style={styles.actions}>
                  <Button
                    mode="outlined"
                    onPress={() =>
                      navigation.navigate('AssignInstructor', { classId: item.id })
                    }
                  >
                    Vincular instrutor
                  </Button>

                  <Button mode="outlined" onPress={() => handleDeleteClass(item)}>
                    Excluir
                  </Button>

                  <Button mode="contained" onPress={() => handleStartClass(item)}>
                    Iniciar aula
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        {isCompactLayout ? (
          <View style={styles.footerActionsCompact}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('ClassForm')}
              style={styles.compactActionButton}
            >
              Nova aula
            </Button>

            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.compactActionButton}
            >
              Voltar
            </Button>
          </View>
        ) : (
          <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.backButton}>
            Voltar
          </Button>
        )}
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
    marginBottom: 24,
    gap: 16,
  },
  headerWide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  headerTextContainer: {
    flex: 1,
  },
  newClassButton: {
    alignSelf: 'flex-start',
  },
  newClassButtonCompact: {
    alignSelf: 'stretch',
  },
  title: {
    color: '#1F2A37',
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#667482',
  },
  loadingText: {
    color: '#667482',
    marginBottom: 16,
  },
  emptyCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2A37',
    marginBottom: 8,
  },
  emptyText: {
    color: '#667482',
  },
  list: {
    gap: 16,
  },
  card: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2A37',
    marginBottom: 12,
  },
  cardText: {
    color: '#667482',
    marginBottom: 6,
  },
  cardStatus: {
    color: '#0F4C81',
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 8,
  },
  cardInstructor: {
    color: '#1F2A37',
    fontWeight: '600',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  backButton: {
    minWidth: 180,
    borderColor: '#0F4C81',
  },
  newClassButtonWide: {
    minWidth: 140,
    alignSelf: 'flex-start',
  },
  footerActionsCompact: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  compactActionButton: {
    flex: 1,
  },
});