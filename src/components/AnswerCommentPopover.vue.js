import { computed } from 'vue';
import { renderMarkdown } from '../utils/markdown';
const props = defineProps();
const emit = defineEmits();
const renderedComment = computed(() => renderMarkdown(props.markdown));
const toggle = () => emit('toggle');
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['comment-popover__content']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-popover__content']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-popover__content']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-popover__content']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-popover__content']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "comment-popover" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.toggle) },
    ...{ class: "comment-popover__trigger" },
    type: "button",
    'aria-expanded': (__VLS_ctx.isOpen),
    'aria-label': "Показать комментарий к ответу",
});
if (__VLS_ctx.isOpen) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "comment-popover__panel" },
        role: "dialog",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "comment-popover__content" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderedComment) }, null, null);
}
/** @type {__VLS_StyleScopedClasses['comment-popover']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-popover__trigger']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-popover__panel']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-popover__content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            renderedComment: renderedComment,
            toggle: toggle,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
