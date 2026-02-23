export function HomeFooter() {
  return (
    <footer className="flex h-12 shrink-0 items-center justify-center">
      <p className="text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} AI Cookbook App. All rights reserved.
      </p>
    </footer>
  );
}
