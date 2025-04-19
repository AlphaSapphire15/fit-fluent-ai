
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import PageContainer from "@/components/PageContainer";
import { useToast } from "@/hooks/use-toast";

const Signup = () => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get("next") || "/";
  const plan = searchParams.get("plan");
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signup(email, password);
      // We don't navigate here since the user needs to confirm their email
    } catch (err: any) {
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer showBackButton>
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-6 max-w-sm mx-auto">
        <div className="text-center space-y-2 mb-4">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground">
            Join DresAI to get detailed outfit feedback
          </p>
        </div>

        <form onSubmit={handleEmailSignup} className="w-full space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <p className="text-destructive text-sm">{error}</p>}
          
          <Button 
            type="submit"
            className="w-full bg-gradient-to-r from-lilac to-neonBlue text-white hover:shadow-[0_0_25px_rgba(167,139,250,0.6)]"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign up with Email"}
          </Button>
        </form>

        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button 
          onClick={() => login()}
          variant="outline"
          size="lg"
          className="w-full"
        >
          Continue with Google
        </Button>

        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </PageContainer>
  );
};

export default Signup;
