import { FC } from "react";

const NavBar: FC = () => {
    return (
        <nav className="absolute top-0 middle-0 flex space-x-6 m-4">
        <a href="/"
          className="text-lg text-white font-bold no-underline hover:underline"
        >
          Home
        </a>
        <a href="/stake"
          className="text-lg text-white font-bold no-underline hover:underline"
        >
          Stake
        </a>
        <a href="/claim"
          className="text-lg text-white font-bold no-underline hover:underline"
        >
          Claim
        </a>
      </nav>
    )
}

export default NavBar;