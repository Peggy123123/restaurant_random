const useStyle = () => {
    const handleMergeStyle = <T extends AnyObject>(defaultStyle: T, customizedStyle: T) => {
        const isStyle = (object: any): object is Style => {
            return typeof object === "object" && object !== null && "classes" in object;
        };

        if (!isStyle(defaultStyle) && !isStyle(customizedStyle)) {
            Object.keys(defaultStyle).forEach((key: string) => {
                Object.assign(defaultStyle[key], customizedStyle[key]);
            });
        } else if (isStyle(defaultStyle) && isStyle(customizedStyle)) {
            Object.assign(defaultStyle, customizedStyle);
        }
    };

    return {
        handleMergeStyle,
    };
};

export default useStyle;
