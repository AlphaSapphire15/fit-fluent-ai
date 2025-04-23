
import { useState } from "react";
import { Menu, Home, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const NavigationMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Upload", path: "/upload", icon: Upload },
    { label: "Profile", path: "/profile", icon: User },
    { label: user ? "Sign Out" : "Sign Up", path: user ? "/login" : "/signup" },
  ];

  const handleNavigation = async (path: string) => {
    setOpen(false);
    if (path === "/login" && user) {
      await logout();
      navigate("/");
      return;
    }
    navigate(path);
  };

  return (
    <div className="fixed right-4 top-4 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="bg-background/50 backdrop-blur-sm">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <nav className="flex flex-col gap-4">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => handleNavigation(item.path)}
              >
                {item.icon && <item.icon size={20} />}
                {item.label}
              </Button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};
