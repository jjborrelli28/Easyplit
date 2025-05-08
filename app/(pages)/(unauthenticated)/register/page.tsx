"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const RegisterPage = () => {
  const router = useRouter();

  const [alias, setAlias] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ alias, email, password }),
    });

    if (res.ok) router.push("/dashboard");
    else alert("Error");
  }

  return (
    <form
      onSubmit={handleLogin}
      className="mx-auto mt-10 max-w-md rounded bg-gray-900 p-4 shadow"
    >
      <h2 className="mb-4 text-xl font-bold">Register</h2>
      <input
        type="text"
        placeholder="Alias"
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        className="input"
      />
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
      <button className="btn">Register</button>
    </form>
  );
};

export default RegisterPage;
