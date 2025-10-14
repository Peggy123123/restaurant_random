interface AnyObject {
    [key: string]: any;
}

interface Route {
    name: string;
    paramKey: string;
    objectKey: string;
}

interface ExportExcelConfig {
    head: AnyObject;
    data: AnyObject[];
    fileName: string;
}

interface Link {
    title: string;
    icon?: string;
    routeName: string;
    toggle?: boolean;
    isAuthorized?: boolean | ComputedRef<boolean>;
    isDisplayed?: boolean | ComputedRef<boolean>;
    callback?: () => void;
    children?: {
        title: string;
        routeName: string;
        toggle?: boolean;
        isAuthorized?: boolean | ComputedRef<boolean>;
        isDisplayed?: boolean | ComputedRef<boolean>;
        callback?: () => void;
    }[];
}

interface DateInterval {
    date?: string;
    startDate?: string;
    endDate?: string;
}

interface Option {
    label: string;
    value: string | number | boolean | null;
    isSelected?: boolean;
}

interface Validation {
    [key: string]: boolean | boolean[];
}

/* 樣式 */
// 基本
type ComponentStyles = ButtonStyle &
    IconButtonStyle &
    InputStyle &
    SelectStyle &
    TableStyle &
    ToggleStyle &
    TabsStyle &
    DialogStyle &
    ProgressStyle &
    MultiSelectStyle &
    RadioStyle &
    CheckboxStyle &
    ChatStyle &
    NoteStyle;

interface Style {
    display?: string;
    layout?: string;
    order?: string;
    position?: string;
    boxSizing?: string;
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    height?: string;
    minHeight?: string;
    maxHeight?: string;
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
    translate?: string;
    rotate?: string;
    scale?: string;
    padding?: string;
    paddingTop?: string;
    paddingRight?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    margin?: string;
    marginTop?: string;
    marginRight?: string;
    marginBottom?: string;
    marginLeft?: string;
    textAlign?: string;
    lineHeight?: string;
    fontSize?: string;
    leading?: string;
    leading?: string;
    color?: string;
    hoverColor?: string;
    fontWeight?: string;
    borderWidth?: string;
    borderColor?: string;
    hoverBorderColor?: string;
    borderRadius?: string;
    strokeWidth?: string;
    strokeColor?: string;
    bgColor?: string;
    hoverBgColor?: string;
    checkedBgColor?: string;
    gap?: string;
    shadow?: string;
    hoverShadow?: string;
    overflow?: string;
    cursor?: string;
    pointerEvents?: string;
    zIndex?: string;
    duration?: string;
    whitespace?: string;
    select?: string;
    classes: string;
}

interface ButtonStyle {
    buttonStyle?: Style;
    iconStyle?: Style;
}

interface IconButtonStyle extends Style {}

interface InputStyle {
    labelStyle?: Style;
    iconStyle?: Style;
    inputStyle?: Style;
}

interface SelectStyle {
    labelStyle?: Style;
    selectStyle?: Style;
    iconStyle?: Style;
    dropdownStyle?: Style;
    optionStyle?: Style;
}

interface TableStyle {
    tableStyle?: Style;
    theadStyle?: Style;
    tbodyStyle?: Style;
}

interface ToggleStyle {
    trackStyle?: Style;
    thumbStyle?: Style;
}

interface TabsStyle {
    labelStyle?: Style;
    tabStyle?: Style;
    inactiveStyle?: Style;
    activeStyle?: Style;
}

interface DialogStyle {
    backdropStyle?: Style;
    dialogStyle?: Style;
    contentStyle?: Style;
}

interface ProgressStyle {
    backgroundStyle?: Style;
    barStyle?: Style;
}

interface MultiSelectStyle {
    labelStyle?: Style;
    selectStyle?: Style;
}

interface RadioStyle {
    labelStyle?: Style;
    radioStyle?: Style;
    boxStyle?: Style;
}

interface CheckboxStyle {
    containerStyle?: Style;
    checkboxStyle?: Style;
    labelStyle?: Style;
}

interface ChatStyle {
    containerStyle?: Style;
    inputStyle?: Style;
}

interface NoteStyle {
    imageContainerStyle?: Style;
}

interface Window {
    ECPay?: {
        initialize: (ServerType: string, IsLoading: number, callBack: (errMsg: string) => void) => void;
        createPayment: (Token: string, Language: string, callBack: (errMsg: string) => void, Version: string) => void;
        getPayToken: (callBack: (paymentInfo: any, errMsg: string) => void) => void;
        Language: {
            zhTW: string;
            enUS: string;
        };
    };
}

// Google Maps JS API 全域物件（避免在未安裝型別定義時的編譯錯誤）
declare const google: any;
