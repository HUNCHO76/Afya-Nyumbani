import { usePage } from "@inertiajs/react";
import { useEffect } from "react";

const NotFound = () => {
  const { url } = usePage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", url);
  }, [url]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <h1 className="mb-2 text-6xl sm:text-7xl lg:text-8xl font-bold text-primary/20">404</h1>
        </div>
        <h2 className="mb-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Page Not Found</h2>
        <p className="mb-6 text-base sm:text-lg text-muted-foreground">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <a 
          href="/login" 
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
