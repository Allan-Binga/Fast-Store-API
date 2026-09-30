import { Link, useLocation } from "react-router-dom";
import { returnPath } from "../utils/navigation";

export default function SignInLink({ children, ...linkProps }) {
  const location = useLocation();

  return (
    <Link
      {...linkProps}
      to="/login"
      state={{ returnTo: returnPath(location) }}
    >
      {children}
    </Link>
  );
}
