"use client";
import {FormEvent,useState, type ReactNode} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {login} from "@/lib/api";
export default function LoginPage(){
 const router=useRouter(); const [identifier,setIdentifier]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();setError("");setLoading(true);try{const d=await login(identifier,password);localStorage.setItem("duo_token",d.token);router.push("/learn");router.refresh();}catch(e:any){setError(e.message||"Login failed");}finally{setLoading(false);}}
 return <AuthShell title="Welcome back!" subtitle="Log in to continue learning."><form onSubmit={submit} className="space-y-4">
  <input value={identifier} onChange={e=>setIdentifier(e.target.value)} placeholder="Username or email" className="auth-input" required/>
  <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="auth-input" required/>
  {error&&<p className="text-sm font-bold text-[#ff4b4b]">{error}</p>}<button disabled={loading} className="btn-duo-green w-full py-3">{loading?"LOGGING IN...":"LOG IN"}</button>
  <p className="text-center text-sm">New here? <Link className="text-[#1cb0f6] font-bold" href="/signup">Sign up</Link></p>
  <p className="text-center text-xs text-[#777]">Demo: learner / learner123</p>
 </form></AuthShell>
}
function AuthShell({title,subtitle,children}:{title:string;subtitle:string;children:ReactNode}){return <main className="min-h-screen flex items-center justify-center bg-[#f7f7f7] dark:bg-[#131f24] px-4"><div className="w-full max-w-md bg-white dark:bg-[#18272c] border-2 border-[#e5e5e5] dark:border-[#37464f] rounded-3xl p-8 shadow-xl"><Link href="/learn" className="block text-center text-3xl font-black text-[#58cc02] mb-8">duolingo</Link><h1 className="text-2xl font-black text-center">{title}</h1><p className="text-center text-[#777] dark:text-[#93a2a8] mt-2 mb-6">{subtitle}</p>{children}</div></main>}
