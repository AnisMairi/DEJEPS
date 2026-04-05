import Link from "next/link"

export function Footer() {
  return (
    <footer className="text-center text-[10px] text-muted-foreground pt-4 mt-auto border-t">
      <p>
        © {new Date().getFullYear()} Fédération Française d'Escrime — Développé par{" "}
        <Link
          href="https://vane-solutions.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:underline underline-offset-4"
        >
          Vane Solutions
        </Link>
      </p>
    </footer>
  )
}

