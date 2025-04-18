
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <div className="glass-card rounded-xl p-8 max-w-md">
        <h1 className="text-6xl font-satoshi font-bold text-lilac mb-4">404</h1>
        <h2 className="text-2xl font-medium mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-6">
          Oops! The page you're looking for at{" "}
          <span className="text-foreground font-mono">{location.pathname}</span> doesn't exist.
        </p>
        <Link to="/">
          <Button className="bg-lilac hover:bg-lilac/90 text-white rounded-full px-6">
            <Home size={16} className="mr-2" /> Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
