import { FcGoogle } from "react-icons/fc";

export function GoogleMark({
  className = "shrink-0",
  size = 18,
}: {
  className?: string;
  size?: number;
}) {
  return <FcGoogle className={className} size={size} aria-hidden />;
}
