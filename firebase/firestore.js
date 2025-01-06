import { db } from './config';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

export const saveQuizToFirebase = async (quizData) => {
    try {
        const docRef = await addDoc(collection(db, 'quizzes'), {
            title: `اختبار ${Date.now()}`,
            questions: quizData,
            createdAt: new Date()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error saving quiz:', error);
        return null;
    }
};

export const getQuizzesFromFirebase = async () => {
    try {
        const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting quizzes:', error);
        return [];
    }
};
