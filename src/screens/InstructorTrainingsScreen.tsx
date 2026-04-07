import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'InstructorTrainings'>;

const trainings = [
  {
    id: '1',
    name: 'NR-35 Trabalho em Altura',
    group: 'Turma A',
    workload: '8 horas',
    students: 18,
    status: 'Planejado',
  },
  {
    id: '2',
    name: 'Primeiros Socorros',
    group: 'Turma B',
    workload: '6 horas',
    students: 22,
    status: 'Em andamento',
  },
];

export function InstructorTrainingsScreen({ navigation }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Treinamentos
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Acompanhe os treinamentos sob sua responsabilidade.
      </Text>

      <View style={styles.list}>
        {trainings.map(item => (
          <Card key={item.id} style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardText}>Turma: {item.group}</Text>
              <Text style={styles.cardText}>Carga horária: {item.workload}</Text>
              <Text style={styles.cardText}>Alunos: {item.students}</Text>
              <Text style={styles.cardStatus}>Status: {item.status}</Text>

              <View style={styles.actions}>
                <Button mode="outlined">Ver turma</Button>
                <Button mode="contained">Abrir treinamento</Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>
      <View style={styles.footer}>
  <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.backButton}>
    Voltar
  </Button>
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
  topBar: {
    marginBottom: 8,
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
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  footer: {
  marginTop: 24,
  alignItems: 'center',
},

backButton: {
  minWidth: 180,
  borderColor: '#0F4C81',
},
});