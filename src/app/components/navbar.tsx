import { Link } from "./link";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

interface NavbarProps {
  userType: "admin" | "doctor" | "patient";
  userName?: string;
  onLogout: () => void;
}

export function Navbar({ userType, userName, onLogout }: NavbarProps) {
  return (
    <nav className="bg-green-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Ayurveda CRM</h1>
            <p className="text-sm text-green-100">
              {userType === "admin" && "Admin Portal"}
              {userType === "doctor" && `Doctor Portal - ${userName}`}
              {userType === "patient" && `Patient Portal - ${userName}`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-white hover:bg-green-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}