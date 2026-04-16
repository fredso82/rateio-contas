import { Button } from "@/components/ui/button";
import { continueWithGoogle } from "@/server/auth/actions";

type GoogleSignInButtonProps = {
  callbackUrl: string;
  label?: string;
};

function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.805 12.227c0-.75-.067-1.47-.192-2.159H12v4.087h5.497a4.7 4.7 0 0 1-2.04 3.084v2.563h3.3c1.93-1.776 3.048-4.396 3.048-7.575Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.965-.894 6.62-2.418l-3.3-2.563c-.916.614-2.089.977-3.32.977-2.55 0-4.71-1.72-5.48-4.03H3.11v2.636A9.998 9.998 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.52 13.966a5.996 5.996 0 0 1 0-3.834V7.496H3.11a9.999 9.999 0 0 0 0 8.47l3.41-2Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.004c1.468 0 2.786.505 3.823 1.497l2.867-2.868C16.96 3.023 14.695 2 12 2A9.998 9.998 0 0 0 3.11 7.496l3.41 2.636c.768-2.313 2.929-4.128 5.48-4.128Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GoogleSignInButton({
  callbackUrl,
  label = "Continuar com Google",
}: GoogleSignInButtonProps) {
  return (
    <form action={continueWithGoogle} className="w-full">
      <input name="callbackUrl" type="hidden" value={callbackUrl} />
      <Button fullWidth type="submit" variant="secondary">
        <GoogleMark />
        {label}
      </Button>
    </form>
  );
}
