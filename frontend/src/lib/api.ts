import { User, CoursePath, Lesson, LeaderboardUser, Achievement } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const authHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("duo_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};
async function request(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers); Object.entries(authHeaders()).forEach(([k,v]) => headers.set(k,v));
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers, cache: "no-store" });
  if (!res.ok) {
    let msg = "Request failed"; try { const d = await res.json(); msg = d.detail || msg; } catch {}
    throw new Error(msg);
  }
  return res;
}
export async function fetchUser(): Promise<User> { return (await request("/api/user/me")).json(); }
export async function fetchCoursePath(): Promise<CoursePath> { return (await request("/api/courses/current")).json(); }
export async function fetchLesson(id: number): Promise<Lesson> { return (await request(`/api/lessons/${id}`)).json(); }
export async function fetchNextLesson(skillId: number): Promise<number> { return (await request(`/api/courses/skill/${skillId}/next-lesson`)).json().then(d=>d.lesson_id); }
export async function fetchLanguages() { return (await request("/api/user/languages")).json(); }
export async function switchLanguage(id: number): Promise<User> { return (await request(`/api/user/language/${id}`, {method:"POST"})).json(); }
export async function login(identifier: string, password: string) {
  return (await request("/api/user/login", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({identifier,password})})).json();
}
export async function signup(data: {username:string;name:string;email:string;password:string}) {
  return (await request("/api/user/signup", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data)})).json();
}
export async function logout() { localStorage.removeItem("duo_token"); }
export async function checkExercise(exerciseId: number, userAnswer: any) {
  return (await request("/api/exercises/check",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({exercise_id:exerciseId,user_answer:userAnswer})})).json();
}
export async function completeLesson(lessonId:number,xpEarned:number,accuracy:number,mistakesCount:number) {
  return (await request(`/api/lessons/${lessonId}/complete`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({xp_earned:xpEarned,accuracy,mistakes_count:mistakesCount})})).json();
}
export async function decrementHeart(){ return (await request("/api/user/hearts/decrement",{method:"POST"})).json(); }
export async function refillHearts(method:"gems"|"practice"="gems"){ return (await request(`/api/user/hearts/refill?method=${method}`,{method:"POST"})).json(); }
export async function fetchLeaderboard():Promise<LeaderboardUser[]>{ return (await request("/api/leaderboard")).json(); }
export async function fetchAchievements():Promise<Achievement[]>{ return (await request("/api/achievements")).json(); }
export async function resetDatabase(){ return (await request("/api/ reset",{method:"POST"})).json(); }
