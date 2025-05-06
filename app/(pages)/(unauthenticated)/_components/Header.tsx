import Link from "next/link";

const Header = () => {
  return (
    <header className="bg-gray-900 justify-end p-4">
      <nav className="container flex justify-end gap-4">
        <Link href="/login" className="btn">
          Login
        </Link>
        <Link href="/register" className="btn">
          Register
        </Link>
      </nav>
    </header>
  );
};

export default Header;
