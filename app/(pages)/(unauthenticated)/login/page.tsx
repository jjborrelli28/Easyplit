"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const LoginPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) router.push("/dashboard");
    else alert("Error");
  }

  return (
    <form
      onSubmit={handleLogin}
      className="max-w-md mx-auto mt-10 p-4 bg-gray-900 rounded shadow"
    >
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input"
      />
      <button className="btn">Login</button>
    </form>
  );
};

export default LoginPage;
