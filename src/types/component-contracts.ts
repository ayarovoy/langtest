export interface TestOption {
  id: string
  text: string
  commentMarkdown?: string
}

export interface TestQuestion {
  id: string
  text: string
  multiple: boolean
  options: TestOption[]
  correctOptionIds: string[]
}

export interface FillBlankConfig {
  id: string
  correctAnswers: string[]
  commentMarkdown?: string
}

export interface FillTextTask {
  id: string
  title?: string
  content: string
  blanks: FillBlankConfig[]
}

export interface MatchOption {
  id: string
  text: string
}

export interface MatchRow {
  id: string
  prompt: string
  correctOptionId: string
  commentMarkdown?: string
}

export interface MatchTask {
  id: string
  title?: string
  leftColumnTitle?: string
  rightColumnTitle?: string
  rows: MatchRow[]
  options: MatchOption[]
}

export interface YesNoQuestion {
  id: string
  text: string
  correctAnswer: boolean
}

export interface YesNoTask {
  id: string
  title?: string
  texts: string[]
  questions: YesNoQuestion[]
}
