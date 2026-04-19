import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logout } from "@/server/auth/actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button size="sm" type="submit" variant="secondary">
        <LogOut className="size-4" />
        Sair
      </Button>
    </form>
  );
}
