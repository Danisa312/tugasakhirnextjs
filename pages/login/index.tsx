import { useState } from "react";
import { useRouter } from "next/router";
import { Input, Button, Text } from "@nextui-org/react";
import { axiosInstance } from "../../utils/axiosInstance";

export default function Page() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axiosInstance.post("/login", { username, password });
      const token = res.data.token;
      const user = JSON.stringify(res.data.user);
      localStorage.setItem("token", token);
      localStorage.setItem("user", user);
      const pathAfterLogin = localStorage.getItem("path_after_login");
      router.push(pathAfterLogin ?? "/");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Login gagal. Periksa kembali data Anda."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f6f8fc",
        padding: "0",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100vw",
          maxWidth: "100vw",
          minHeight: "100vh",
          background: "#fff",
        }}
      >
        {/* Left Side: Form */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "0 0 0 8vw",
            background: "#fff",
          }}
        >
          <Text h2 css={{ color: "#b91c1c", fontWeight: 700, mb: 0, fontSize: 40 }}>
            SIGN IN!
          </Text>
          <Text css={{ mt: 8, mb: 0, fontSize: 22, color: '#222', fontWeight: 400 }}>
            Selamat Datang di website Kasify<br />
            Sistem Keuangan CV. Lantana Jaya Digital
          </Text>
          <form onSubmit={handleLogin} style={{ marginTop: 48, width: "100%", maxWidth: 420 }}>
            {error && (
              <Text size={14} color="error" css={{ mb: "1rem", textAlign: "center" }}>
                {error}
              </Text>
            )}
            <Input
              fullWidth
              required
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              css={{ mb: "1.5rem", background: "#fafbff", borderRadius: 16, fontSize: 18, height: 56, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}
              bordered
              size="lg"
            />
            <Input
              fullWidth
              required
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              css={{ mb: "0.5rem", background: "#fafbff", borderRadius: 16, fontSize: 18, height: 56, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}
              bordered
              size="lg"
              contentRight={<span style={{ color: '#bdbdbd' }}></span>}
            />
            <div style={{ textAlign: "right", marginBottom: "2.2rem" }}>
              <a
                href="#"
                style={{
                  color: "#3b6ba5",
                  fontSize: 15,
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
            
            
              </a>
            </div>
            <Button
              type="submit"
              css={{
                w: "100%",
                background: "#b91c1c",
                color: "#fff",
                fontWeight: 600,
                fontSize: 18,
                letterSpacing: 1,
                borderRadius: 16,
                height: 56,
                boxShadow: "0 2px 12px rgba(185,28,28,0.10)",
              }}
              disabled={loading}
              auto
            >
              {loading ? "Memproses..." : "SIGN IN"}
            </Button>
          </form>
        </div>
        {/* Right Side: Logo & Brand */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#fcfaf6",
            borderLeft: "1px solid #f0f0f0",
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src="/logo.png"
              alt="Kasify Logo"
              style={{
                width: "100%",
                height: "auto",
                maxWidth: "600px",
                maxHeight: "480px",
                display: "block",
                margin: "0 auto"
              }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
