import Image from "next/image";

const OPTIMIZED_HOSTS = new Set(["images.unsplash.com"]);

export function ProductImage({
  src,
  alt,
  sizes,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  let host = "";
  try {
    host = new URL(src).hostname;
  } catch {
    return null;
  }
  if (OPTIMIZED_HOSTS.has(host)) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={`absolute inset-0 h-full w-full ${className ?? ""}`} />
  );
}
