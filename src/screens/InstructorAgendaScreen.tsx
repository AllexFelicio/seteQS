import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'InstructorAgenda'>;

const classes = [
  {
    id: '1',
    training: 'NR-35 Trabalho em Altura',
    group: 'Turma A',
    time: '08:00 às 12:00',
    location: 'Sala 01',
    status: 'Agendado',
  },
  {
    id: '2',
    training: 'Primeiros Socorros',
    group: 'Turma B',
    time: '13:30 às 17:30',
    location: 'Sala 03',
    status: 'Em andamento',
  },
];

export function InstructorAgendaScreen({ navigation }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text variant="headlineMedium" style={styles.title}>
        Agenda do Instrutor
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Visualize suas aulas e atividades programadas para o dia.
      </Text>

      <View style={styles.list}>
        {classes.map(item => (
          <Card key={item.id} style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>{item.training}</Text>
              <Text style={styles.cardText}>Turma: {item.group}</Text>
              <Text style={styles.cardText}>Horário: {item.time}</Text>
              <Text style={styles.cardText}>Local: {item.location}</Text>
              <Text style={styles.cardStatus}>Status: {item.status}</Text>

              <View style={styles.actions}>
                <Button mode="outlined">Ver detalhes</Button>
                <Button mode="contained">Iniciar aula</Button>
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