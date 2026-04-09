"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import "./Header.scss";
import { Container } from "react-bootstrap";
import Link from "next/link";
import logoLight from "../../../../public/images/logo.svg";
import Image from "next/image";
import { Link as NavLink } from "react-scroll";
import CommonButton from "../ui/commonButton/CommonButton";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const [isActive, setIsActive] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuth();

  const toggleClass = () => {
    setIsActive(!isActive);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const publicLinks = [
    { name: "Home", path: "hero", offset: -80 },
    { name: "Features", path: "features", offset: -80 },
    { name: "Statistics", path: "stats", offset: -80 },
    { name: "Get Started", path: "cta", offset: -80 },
  ];

  const privateLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/settings", label: "Settings" },
    { href: "/staking", label: "Staking" },
    { href: "/contact-us", label: "Contact Us" },
  ];

  const isLandingPage = pathname === "/";

  const handleScroll = () => {
    if (window.scrollY > 100) {
      document.body.classList.add("scrolled");
    } else {
      document.body.classList.remove("scrolled");
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <header className={`siteHeader ${isActive ? "openmenu" : ""}`}>
        <Container className="">
          <div className="navbar">
            <Link
              href="/"
              className="brandLogo"
              onClick={(e) => {
                if (pathname === "/") {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              <Image
                src={logoLight}
                alt="Antier Peoplix Logo"
                className="d-inline-block"
              />
            </Link>
            <div className="menuNav">
              <div className="brandLogo d-block d-xl-none">
                <Image
                  src={logoLight}
                  alt="Antier Peoplix Logo"
                  className="d-inline-block"
                />
              </div>

              {!isAuthenticated ? (
                <>
                  {publicLinks.map((item, index) =>
                    isLandingPage ? (
                      <NavLink
                        key={item.name}
                        onClick={toggleClass}
                        to={item.path}
                        spy={true}
                        smooth={true}
                        offset={item.offset}
                        duration={500}
                        className="nav-link"
                      >
                        {item.name}
                      </NavLink>
                    ) : (
                      <Link
                        key={item.name}
                        href={item.name === "Home" ? "/" : `/#${item.path}`}
                        className="nav-link"
                        onClick={() => {
                          setIsActive(false);
                          if (item.name === "Home") {
                            requestAnimationFrame(() =>
                              window.scrollTo({ top: 0, behavior: "smooth" })
                            );
                          }
                        }}
                      >
                        {item.name}
                      </Link>
                    )
                  )}
                  <Link
                    href="/staking"
                    onClick={() => setIsActive(false)}
                    className={`nav-link ${pathname === "/staking" ? "active" : ""}`}
                  >
                    Staking
                  </Link>
                </>
              ) : (
                <>
                  {privateLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsActive(false)}
                      className={`nav-link ${pathname === href ? "active" : ""}`}
                    >
                      {label}
                    </Link>
                  ))}
                </>
              )}
            </div>

            <div className="siteHeader_rightSide">
              <div className="siteHeader_rightSide_btn">
                {!isAuthenticated ? (
                  <CommonButton
                    title="Login"
                    className=""
                    role="link"
                    to="/login"
                  />
                ) : (
                  <div className="siteHeader_userPanel">
                    <span className="user-name">
                      Welcome, {user?.name || "User"}
                    </span>
                    <CommonButton
                      onClick={handleLogout}
                      title="Logout"
                    />
                  </div>
                )}
              </div>
              <button
                className={`menu_btn ${isActive ? "close_menu" : ""}`}
                onClick={toggleClass}
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </Container>
        <div
          onClick={toggleClass}
          className={`${isActive ? "overlayBg" : ""}`}
        />
      </header>
    </>
  );
}