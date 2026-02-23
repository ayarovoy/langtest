import type { FillTextTask, MatchTask, TestQuestion } from './component-contracts'

export type TestComponentType = 'choose-correct-answer' | 'fill-in-the-blank' | 'match-pairs'

interface BaseTestConfig {
  id: string
  componentType: TestComponentType
  title?: string
  descriptionMarkdown?: string
}

export interface ChooseCorrectAnswerConfig extends BaseTestConfig {
  componentType: 'choose-correct-answer'
  questions: TestQuestion[]
}

export interface FillInTheBlankConfig extends BaseTestConfig {
  componentType: 'fill-in-the-blank'
  texts: FillTextTask[]
}

export interface MatchPairsConfig extends BaseTestConfig {
  componentType: 'match-pairs'
  tasks: MatchTask[]
}

export type TestComponentConfig = ChooseCorrectAnswerConfig | FillInTheBlankConfig | MatchPairsConfig
