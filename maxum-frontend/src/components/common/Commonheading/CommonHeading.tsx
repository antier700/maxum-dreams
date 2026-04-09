import "./CommonHeading.scss";

const CommonHeading = ({ center, title, text }: any) => {
    return (
        <>
            <div className={`common_heading ${center ? 'text-center' : ''}`}>
                {title && (
                    <div>
                        <h2 className="black-gradient-text">{title}</h2>
                    </div>
                )}
                {text && (
                    <p>{text}</p>
                )}
            </div>
        </>
    );
};

export default CommonHeading
