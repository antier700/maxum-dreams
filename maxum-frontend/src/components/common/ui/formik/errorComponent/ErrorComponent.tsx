import { ReactNode } from "react";
import '../FormControl.scss';

interface ErrorComponentProps {
  error?: ReactNode;
}

const ErrorComponent: React.FC<ErrorComponentProps> = ({ error }) => {
  return error ? <div className="error_text">{error}</div> : null;
};

export default ErrorComponent;
