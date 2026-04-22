import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/AppNavigator';
import { getAgendaClassById, formatAgendaClassTime } from '../services/agendaService';
import { getStudentRegistrationById } from '../services/studentService';

type Props = NativeStackScreenProps<RootStackParamList, 'StudentMaterials'>;

export function StudentMaterialsScreen({ route }: Props) {
    const { classId, studentRegistrationId } = route.params;

    const [classTitle, setClassTitle] = React.useState('');
    const [classSubtitle, setClassSubtitle] = React.useState('');
    const [studentName, setStudentName] = React.useState('');

    React.useEffect(() => {
        async function loadData() {
            const agendaClass = await getAgendaClassById(classId);

            if (agendaClass) {
                setClassTitle(agendaClass.trainingName);
                setClassSubtitle(
                    `${agendaClass.className} • ${formatAgendaClassTime(agendaClass)} • ${agendaClass.location}`,
                );
            }

            const studentRegistration =
                await getStudentRegistrationById(studentRegistrationId);

            if (studentRegistration) {
                setStudentName(studentRegistration.name);
            }
        }

        loadData();
    }, [classId, studentRegistrationId]);

    return (
        <View style={styles.screen}>
            <View style={styles.contentWrap}>
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="headlineMedium" style={styles.title}>
                            Materiais da Aula
                        </Text>

                        <Text style={styles.classTitle}>
                            {classTitle || 'Carregando aula...'}
                        </Text>

                        {classSubtitle ? (
                            <Text style={styles.classSubtitle}>{classSubtitle}</Text>
                        ) : null}

                        <Text style={styles.studentLabel}>
                            Aluno registrado neste tablet: {studentName || 'Carregando aluno...'}
                        </Text>

                        <View style={styles.placeholderBox}>
                            <Text style={styles.placeholderTitle}>Conteúdo em preparação</Text>
                            <Text style={styles.placeholderText}>
                                Os materiais desta aula serão carregados futuramente. Esta tela já
                                representa o ponto em que o student seguirá com o treinamento após o registro.
                            </Text>
                        </View>

                        <Button mode="contained" disabled style={styles.primaryButton}>
                            Abrir materiais
                        </Button>
                    </Card.Content>
                </Card>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F4F7FA',
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
        marginBottom: 16,
    },
    studentLabel: {
        color: '#1F2A37',
        fontWeight: '600',
        marginBottom: 20,
    },
    placeholderBox: {
        backgroundColor: '#F4F7FA',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    placeholderTitle: {
        color: '#1F2A37',
        fontWeight: '700',
        marginBottom: 8,
    },
    placeholderText: {
        color: '#667482',
        lineHeight: 20,
    },
    primaryButton: {
        marginTop: 8,
    },
});