import { useEffect, useState} from "react";
import {collection, onSnapshot, snapshotEqual} from "firebase/firestore";
import { db } from "../../firebaseConfig";

export const useAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "tasks"), (snapshot) =>{
            const tasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            calculateAnalytics(tasks);
        });

        return () => unsubscribe();
    }, []);

    const calculateAnalytics = (tasks) => {
        const completed = tasks.filter(t => t.completed);
        const total = tasks.length;

        //======= Completeion rate =====
        const completionRate = total ? completed.length / total : 0;

        //======= Time efficiency  =====
        const plannedMinutes = tasks.reduce(
            (sum, t) => sum + (t.duration || 0),
            0
        );

        const completedMinutes = completed.reduce(
            (sum, t) => sum + (t.duration || 0),
            0
        );

        const efficiency = plannedMinutes 
        ? completedMinutes / plannedMinutes : 0;

        //==== Productivity by hour ======
        const hourStats = Array(24).fill(0);

        completed.forEach(task => {
            if(!task.startTime) return;
                const hour = parseInt(task.startTime.split(':')[0]);
                hourStats[hour] += 1;
        });

        const bestHour = hourStats.indexOf(Math.max(...hourStats));

        // === Productivity by Day ====
        const weekStats = Array(7).fill(0);
        const weekDays = [
            "Понеделник",
            "Вторник",
            "Сряда",
            "Четвъртък",
            "Петък",
            "Събота",
            "Неделя"
        ];

        completed.forEach(task => {
            if (!task.date) return;
            const date = new Date(task.date);
            let day = date.getDay(); // 0 = Sunday
            day = day === 0 ? 6 : day - 1; // Monday = 0
            weekStats[day] += 1;
        })

        const bestDayIndex = weekStats.indexOf(Math.max(...weekStats));
        const bestDay = 
            weekStats.some(v => v > 0)
            ? weekDays[bestDayIndex]
            : null;
        // ===== Evening Productivity Check ====
        const eveningTasks = tasks.filter(t => {
            if(!t.startTime) return false;
            const hour = parseInt(t.startTime.split(':')[0]);
            return hour >= 18;
        });

        const eveningCompleted = eveningTasks.filter(t => t.completed);

        const eveningRate = eveningTasks.length
        ? eveningCompleted.length / eveningTasks.length
        : 1;

        // ===== Productivity Score (0-100) =====
        const consistency = 
            weekStats.filter(v => v > 0).length / 7;
        
        const score = Math.round(
            completionRate * 40 +
            efficiency * 30 +
            consistency * 30
        );

        // ===== Generate Recommendations ====
        const recommendations = [];

        if (bestHour >= 0 && hourStats[bestHour] > 0){
            recommendations.push(
                `Най-продуктивен си около ${bestHour}:00. Планирай важните задачи тогава.`
            );
        }

         if (bestDay) {
      recommendations.push(
        `В ${bestDay} имаш най-висока продуктивност. Използвай този ден за по-трудни задачи.`
      );
    }

    if (efficiency < 0.6) {
      recommendations.push(
        "Планираш повече време отколкото реално изпълняваш. Намали дневния обем задачи."
      );
    }

    if (eveningRate < 0.4) {
      recommendations.push(
        "Вечер продуктивността ти е ниска. Премести трудните задачи по-рано през деня."
      );
    }

    if (completionRate > 0.8) {
      recommendations.push(
        "Отлична дисциплина! Поддържаш високо ниво на завършване на задачите."
      );
    }

    setAnalytics({
      completionRate,
      efficiency,
      bestHour,
      bestDay,
      score,
      recommendations
    });
  };

  return analytics;
};

