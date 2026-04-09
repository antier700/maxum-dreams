import { useSelector } from "react-redux";
import "./Loader.scss";
// import { RootState } from "@/lib/redux/store";
const Loader = () => {
  const isLoading = false;
  if (isLoading) {
    return (
      <section className="loader">
        <div className="loader_inner"></div>
      </section>
    );
  } else return <></>;
};

export default Loader;
