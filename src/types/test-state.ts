import type { TestComponentType } from './test-config'

export interface ChooseCorrectAnswerState {
  selectedAnswers: Record<string, string[]>
  checkMode: boolean
  showAnswersMode: boolean
}

export interface FillInTheBlankState {
  userAnswers: Record<string, string>
  checkMode: boolean
  showAnswersMode: boolean
}

export interface MatchPairsState {
  assignments: Record<string, string>
  checkMode: boolean
  showAnswersMode: boolean
}

export interface YesNoQuestionsState {
  selectedAnswers: Record<string, boolean>
  checkMode: boolean
  showAnswersMode: boolean
}

export type TestComponentState =
  | ChooseCorrectAnswerState
  | FillInTheBlankState
  | MatchPairsState
  | YesNoQuestionsState

export interface TestComponentStateEnvelope {
  componentType: TestComponentType
  state: TestComponentState
}

export interface TestSuiteState {
  items: Record<string, TestComponentStateEnvelope>
}

export interface StatefulTestComponentHandle<TState = unknown> {
  getState: () => TState
  setState: (state: unknown) => void
}

export interface TestSuiteContainerHandle extends StatefulTestComponentHandle<TestSuiteState> {}
