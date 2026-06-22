import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "firebase/firestore";
import {db} from "../../firebaseConfig";

const taskCollection = collection(db,"tasks");

export const createTask = async (task, user) => {
    if(!user) throw new Error("User не е логнат");
    
    return await addDoc(taskCollection, {
        ...task,
        userId: user.uid,
        createAt: serverTimestamp()
    });
};

export const updateTask = async(id,updates) => {
    const taskRef = doc(db,"tasks", id);
    return await updateDoc(taskRef, updates);
};

export const deleteTask = async (id) =>{
    const taskRef = doc(db,"tasks", id);
    return await deleteDoc(taskRef);
};

export const toggleTaskComplete = async (id, completed) => {
    const taskRef = doc(db,"tasks",id);
    return await updateDoc(taskRef,{completed})
};
