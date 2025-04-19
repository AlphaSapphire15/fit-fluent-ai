
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const NavigationMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "Upload", path: "/upload" },
    { label: user ? "Sign Out" : "Sign Up", path: "/login" },
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
    <div className="absolute right-4 top-4 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <nav className="flex flex-col gap-4">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigation(item.path)}
              >
                {item.label}
              </Button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};
