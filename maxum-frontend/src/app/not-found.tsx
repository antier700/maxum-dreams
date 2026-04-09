import { Container } from "react-bootstrap";

// src/app/not-found.tsx
export default function NotFound() {
  return (
    <>
      <Container>
        <div className="notFound">
          <h1>404 - Page Not Found</h1>
          <p>Sorry, we couldn’t find that page.</p>
        </div>
      </Container>
    </>
  );
}
