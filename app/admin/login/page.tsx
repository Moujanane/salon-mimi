// app/admin/login/page.tsx
import LoginForm from "@/components/admin/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <h1 className="font-playfair text-3xl text-brun mb-10 text-center">
        Connexion Admin
      </h1>
      <LoginForm />
    </div>
  );
}
