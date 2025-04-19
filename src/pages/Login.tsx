
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import PageContainer from "@/components/PageContainer";

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get("next") || "/";

  useEffect(() => {
    if (user) {
      navigate(nextPath);
    }
  }, [user, navigate, nextPath]);

  return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
        <h1 className="text-3xl font-bold">Welcome</h1>
        <p className="text-muted-foreground text-center">
          Sign in to access all features
        </p>
        <Button 
          onClick={login}
          size="lg"
          className="w-full max-w-sm"
        >
          Continue with Google
        </Button>
      </div>
    </PageContainer>
  );
};

export default Login;
