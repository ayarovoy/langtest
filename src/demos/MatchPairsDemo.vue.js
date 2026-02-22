import MatchPairsTest from '../components/MatchPairsTest.vue';
import importedTasks from '../data/synthetic-match-pairs.json';
const tasks = importedTasks;
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {[typeof MatchPairsTest, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(MatchPairsTest, new MatchPairsTest({
    title: "Демо: сопоставь одно с другим",
    tasks: (__VLS_ctx.tasks),
}));
const __VLS_1 = __VLS_0({
    title: "Демо: сопоставь одно с другим",
    tasks: (__VLS_ctx.tasks),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_3 = {};
var __VLS_2;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            MatchPairsTest: MatchPairsTest,
            tasks: tasks,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
