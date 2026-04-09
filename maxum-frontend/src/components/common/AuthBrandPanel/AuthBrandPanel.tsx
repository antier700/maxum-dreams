import Image from "next/image";
import logo from "../../../../public/images/logo.svg";
import loginart from "../../../../public/images/about.png";
import Link from "next/link";

export default function AuthBrandPanel() {
    return (
        <div className="auth-page__brand-content">
            <div className="auth-page__brand-logo">
                <Link href="/"><Image src={logo} alt="Maxum Dreams Logo" /></Link>
            </div>
            <div className="auth-page__brand-graphic" aria-hidden>
                <Image src={loginart} alt="Brand Illustration" />
            </div>
            <p className="auth-page__brand-tagline">
                Together We Dream, Build, and Succeed!
            </p>
        </div>
    );
}
