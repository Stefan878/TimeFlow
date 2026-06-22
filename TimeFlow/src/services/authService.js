import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sighOut
} from "firebase/auth";
import {auth} from "../../firebaseConfig";

export const register = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

export const login = (email,password) =>{
    return signInWithEmailAndPassword(auth,email,password);
};

export const logout = () => {
    return sighOut(auth);
};