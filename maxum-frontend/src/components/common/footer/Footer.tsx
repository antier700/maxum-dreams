"use client";
import { Container } from "react-bootstrap";
import "./Footer.scss";
import FooterCard from "./FooterCard";

export default function Footer() {

  return (
    <footer className="siteFooter">
      <FooterCard />
      <div className="siteFooter_copyRightFooter">
        <Container className="text-center">
          <p>© {new Date().getFullYear()} Maxum Dreams. All rights reserved.</p>
        </Container>
      </div>
    </footer>
  );
}
