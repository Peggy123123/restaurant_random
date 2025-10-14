<template>
    <Tooltip
        :text="$t('button.no_auth')"
        :isDisplayed="!isAuthorized"
    >
        <button
            @click="handleButtonEvent"
            type="button"
            :aria-disabled="disabled || isLoading || isLoadingFromOutside || !isAuthorized"
            class="select-none"
            :class="[Object.values(computedStyle?.buttonStyle || {}), { '!pointer-events-none': disabled || isLoading || isLoadingFromOutside || !isAuthorized }]"
            :data-test="dataTest"
        >
            <font-awesome-icon
                v-if="icon.length && isAuthorized"
                :icon="icon"
                :class="[Object.values(computedStyle?.iconStyle || {}), { invisible: isLoading || isLoadingFromOutside }]"
                fixed-width
            />

            <font-awesome-icon
                v-if="!isAuthorized"
                :icon="['fas', 'lock']"
                class="text-xs text-gray-theme-400"
                fixed-width
            />

            <div
                v-if="$slots.iconLeft"
                class="order-1"
                :class="[{ invisible: isLoading || isLoadingFromOutside }]"
            >
                <slot name="iconLeft" />
            </div>

            <p
                class="order-2 whitespace-nowrap tabular-nums"
                :class="[{ invisible: (isLoading || isLoadingFromOutside) && !disableLoadingIcon }]"
            >
                {{ text }}
            </p>

            <div
                v-if="$slots.default"
                :class="[{ invisible: isLoading || isLoadingFromOutside }]"
            >
                <slot />
            </div>

            <!-- <Spinner
                v-show="(isLoading || isLoadingFromOutside) && !disableLoadingIcon"
                :size="24"
                :isGrayscale="true"
                class="absolute pointer-events-none"
            /> -->

            <div
                v-if="$slots.iconRight"
                class="order-3"
                :class="[{ invisible: isLoading || isLoadingFromOutside }]"
            >
                <slot name="iconRight" />
            </div>
        </button>
    </Tooltip>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import type { PropType } from "vue";
import useStyle from "../../hooks/useStyle";
import Tooltip from "./Tooltip.vue";
import type { ButtonStyle } from "@/types";

const props = defineProps({
    icon: {
        type: Array as PropType<string[]>,
        default: [],
    },
    iconPosition: {
        type: String,
        default: "left",
        validator: (value: string) => ["left", "right"].includes(value),
    },
    variant: {
        type: String,
        default: "",
        validator: (value: string) => ["", "outline", "secondary", "warning", "text", "inactive"].includes(value),
    },
    size: {
        type: String,
        default: "",
        validator: (value: string) => ["", "lg", "sm", "xs"].includes(value),
    },
    text: {
        type: String,
        default: "",
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    isAuthorized: {
        type: Boolean,
        default: true,
    },
    isLoadingFromOutside: {
        type: Boolean,
        default: false,
    },
    disableLoadingIcon: {
        type: Boolean,
        default: false,
    },
    action: {
        type: Function as PropType<() => Promise<void> | VoidFunction>,
        default: () => {},
    },
    style: {
        type: Object as PropType<ButtonStyle>,
        default: {},
    },
    dataTest: {
        type: String,
        default: "",
    },  
});

const { handleMergeStyle } = useStyle();

const computedStyle = computed(() => {
    const defaultStyle: ButtonStyle = {
        buttonStyle: {
            position: "relative",
            width: "w-full",
            display: "flex",
            layout: "items-center justify-center",
            boxSizing: "box-border",
            padding: "px-3 md:px-4 py-1.5 md:py-2",
            color: "text-white",
            fontWeight: "font-bold",
            borderWidth: "border",
            borderRadius: "rounded-full",
            borderColor: "border-transparent",
            bgColor: "bg-green-theme-500",
            hoverBgColor: "hover:bg-green-theme-600",
            gap: "gap-2",
            duration: "duration-300",
            classes: "",
        },
        iconStyle: {
            fontSize: "text-xs",
            order: props.iconPosition === "left" ? "order-1" : "order-3",
            classes: "",
        },
    };
    let variantStyle: ButtonStyle = {};
    let sizeStyle: ButtonStyle = {};

    switch (props.variant) {
        case "outline": {
            variantStyle = {
                buttonStyle: {
                    color: "text-green-secondary-500",
                    hoverColor: "hover:text-white",
                    borderColor: "border-green-secondary-500",
                    bgColor: "bg-transparent",
                    hoverBgColor: "hover:bg-green-secondary-500",
                    classes: "",
                },
            };

            break;
        }
        case "secondary": {
            variantStyle = {
                buttonStyle: {
                    color: "text-white",
                    bgColor: "bg-green-secondary-500",
                    hoverBgColor: "hover:bg-green-secondary-600",
                    classes: "",
                },
            };

            break;
        }
        case "inactive": {
            variantStyle = {
                buttonStyle: {
                    color: "text-gray-theme-400",
                    hoverColor: "hover:text-white",
                    borderColor: "border-gray-theme-400",
                    hoverBorderColor: "hover:border-green-secondary-600",
                    bgColor: "bg-white",
                    hoverBgColor: "hover:bg-green-secondary-600",
                    classes: "",
                },
            };

            break;
        }
        case "warning": {
            variantStyle = {
                buttonStyle: {
                    color: "text-white",
                    bgColor: "bg-warning-500",
                    hoverBgColor: "hover:bg-yellow-theme-500",
                    classes: "",
                },
            };

            break;
        }
        case "text": {
            variantStyle = {
                buttonStyle: {
                    color: "text-green-theme-500",
                    hoverColor: "hover:text-green-secondary-500",
                    bgColor: "bg-transparent",
                    hoverBgColor: "hover:bg-transparent",
                    borderWidth: "!border-0",
                    gap: "gap-1",
                    classes: "",
                },
            };

            break;
        }
        default: {
            break;
        }
    }

    switch (props.size) {
        case "lg": {
            sizeStyle = {
                buttonStyle: {
                    fontSize: "text-xl md:text-2xl",
                    padding: "px-6 py-3",
                    classes: "",
                },
            };

            break;
        }
        case "sm": {
            sizeStyle = {
                buttonStyle: {
                    fontSize: "text-sm",
                    padding: "px-3 py-1.5",
                    classes: "",
                },
            };

            break;
        }
        case "xs": {
            sizeStyle = {
                buttonStyle: {
                    fontSize: "text-xs",
                    padding: "px-1.5 py-1",
                    classes: "",
                },
            };

            break;
        }
        default: {
            break;
        }
    }

    handleMergeStyle<ButtonStyle>(defaultStyle, variantStyle);
    handleMergeStyle<ButtonStyle>(defaultStyle, sizeStyle);
    handleMergeStyle<ButtonStyle>(defaultStyle, props.style);

    if (!defaultStyle.buttonStyle) return;

    if (props.disabled || isLoading.value || !props.isAuthorized || props.isLoadingFromOutside) {
        defaultStyle.buttonStyle.color = props.variant === "text" ? "!text-gray-theme-300" : "!text-gray-theme-400";
        defaultStyle.buttonStyle.bgColor = props.variant === "text" ? "" : "!bg-gray-theme-200";
        defaultStyle.buttonStyle.hoverBgColor = props.variant === "text" ? "" : "hover:!bg-gray-theme-200";
        defaultStyle.buttonStyle.borderColor = "!border-gray-theme-200";
        defaultStyle.buttonStyle.cursor = "!cursor-default";
    }

    if (props.variant === "text") {
        defaultStyle.buttonStyle.padding = "p-0";
    }

    return defaultStyle;
});

const isLoading = ref(false);

const handleButtonEvent = async () => {
    if (props.disabled || !props.isAuthorized || isLoading.value || props.isLoadingFromOutside) return;

    if (props.action) {
        isLoading.value = true;

        try {
            await props.action();
        } finally {
            isLoading.value = false;
        }
    }
};
</script>
