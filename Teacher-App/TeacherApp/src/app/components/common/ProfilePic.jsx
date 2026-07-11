export const ProfilePic = ({ src, alt, className,onError ,type}) => {

    return (
        <img
            src={src}
            onError={onError}
            alt={alt}
            className={className}
        />
    )
}