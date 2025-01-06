import { db } from './config';
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    orderBy 
} from 'firebase/firestore';

export const saveQuiz = async (quizData) => {
    try {
        const docRef = await addDoc(collection(db, 'quizzes'), {
            questions: quizData,
            createdAt: new Date(),
            userId: 'MOLOORD232'
        });
        return docRef.id;
    } catch (error) {
        console.error('خطأ في حفظ الاختبار:', error);
        throw error;
    }
};

export const getQuizzes = async () => {
    try {
        const q = query(
            collection(db, 'quizzes'),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('خطأ في جلب الاختبارات:', error);
        throw error;
    }
};
