import React, { ChangeEvent, useCallback, useState } from 'react'
import { useHistory } from 'react-router'
import styled, { css } from 'styled-components'

import { IS_CORONA_VERSION, MAX_OUTCOME_ALLOWED } from '../../../../common/constants'
import { useConnectedWeb3Context } from '../../../../hooks/connectedWeb3'
import { Arbitrator, Question } from '../../../../util/types'
import { Button } from '../../../button'
import { ButtonType } from '../../../button/button_styling_types'
import { CreateCard, DateField, FormRow } from '../../../common'
import { QuestionInput } from '../../../common/question_input'
import { Arbitrators } from '../../arbitrators'
import { Categories } from '../../categories'
import { ButtonContainerFullWidth, ButtonWithReadyToGoStatus, LeftButton } from '../common_styled'
import { Outcome, Outcomes } from '../outcomes'

const ButtonCategoryFocusCSS = css`
  &,
  &:hover {
    background-color: ${props => props.theme.colors.secondary};
    border-color: ${props => props.theme.colors.secondary};
    color: ${props => props.theme.colors.primary};
    font-weight: 500;
  }
`

const ButtonCategory = styled(Button)<{ focus: boolean; isACategorySelected: boolean }>`
  &,
  &:hover {
    color: ${props => (props.isACategorySelected ? props.theme.colors.textColorDark : '#86909e')};
    font-weight: 400;
  }

  max-width: 100%;
  padding-left: 10px;
  padding-right: 10px;
  width: 100%;

  ${props => (props.focus ? ButtonCategoryFocusCSS : '')}
`

const ButtonCategoryTextOverflow = styled.span`
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`

ButtonCategory.defaultProps = {
  focus: false,
}

const GridThreeColumns = styled.div`
  border-top: 1px solid ${props => props.theme.borders.borderColor};
  column-gap: 20px;
  display: grid;
  grid-template-columns: 1fr;
  padding: 20px 0;
  row-gap: 20px;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`

const Column = styled.div`
  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    max-width: 165px;
  }
`

interface Props {
  next: () => void
  values: {
    question: string
    category: string
    categoriesCustom: string[]
    resolution: Date | null
    arbitrator: Arbitrator
    arbitratorsCustom: Arbitrator[]
    loadedQuestionId: Maybe<string>
    outcomes: Outcome[]
  }
  addArbitratorCustom: (arbitrator: Arbitrator) => void
  addCategoryCustom: (category: string) => void
  handleArbitratorChange: (arbitrator: Arbitrator) => any
  handleChange: (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => any
  handleClearQuestion: () => any
  handleDateChange: (date: Date | null) => any
  handleOutcomesChange: (newOutcomes: Outcome[]) => any
  handleQuestionChange: (question: Question, arbitrator: Arbitrator) => any
}

const AskQuestionStep = (props: Props) => {
  const context = useConnectedWeb3Context()

  const {
    addArbitratorCustom,
    addCategoryCustom,
    handleArbitratorChange,
    handleChange,
    handleClearQuestion,
    handleDateChange,
    handleOutcomesChange,
    handleQuestionChange,
    values,
  } = props

  const { arbitratorsCustom, categoriesCustom, category, loadedQuestionId, outcomes, question, resolution } = values

  const history = useHistory()

  const errorMessages = []

  const totalProbabilities = outcomes.reduce((total, cur) => total + cur.probability, 0)
  if (totalProbabilities !== 100) {
    errorMessages.push('The total of all probabilities must be 100%')
  }

  const error = totalProbabilities !== 100 || outcomes.length < 2 || !question || !resolution

  const canAddOutcome = outcomes.length < MAX_OUTCOME_ALLOWED && !loadedQuestionId

  const [categoryButtonFocus, setCategoryButtonFocus] = useState(false)

  const toggleCategoryButtonFocus = useCallback(() => {
    setCategoryButtonFocus(!categoryButtonFocus)
  }, [categoryButtonFocus])

  return (
    <CreateCard>
      <FormRow
        formField={
          <QuestionInput
            addArbitratorCustomValue={addArbitratorCustom}
            addCategoryCustomValue={addCategoryCustom}
            context={context}
            disabled={!!loadedQuestionId}
            name="question"
            onChange={handleChange}
            onChangeQuestion={handleQuestionChange}
            onClearQuestion={handleClearQuestion}
            placeholder="What question do you want the world predict?"
            value={question}
          />
        }
      />
      <Outcomes
        canAddOutcome={canAddOutcome}
        disabled={!!loadedQuestionId}
        errorMessages={errorMessages}
        onChange={handleOutcomesChange}
        outcomes={outcomes}
        totalProbabilities={totalProbabilities}
      />
      <GridThreeColumns>
        <Column>
          <FormRow
            formField={
              <DateField
                disabled={!!loadedQuestionId}
                minDate={new Date()}
                name="resolution"
                onChange={handleDateChange}
                selected={resolution}
              />
            }
            title={'Resolution Date'}
          />
        </Column>
        <Column>
          <FormRow
            formField={
              <ButtonCategory
                buttonType={ButtonType.secondaryLine}
                disabled={!!loadedQuestionId}
                focus={categoryButtonFocus}
                isACategorySelected={category !== ''}
                onClick={toggleCategoryButtonFocus}
              >
                <ButtonCategoryTextOverflow>{category ? category : 'Select Category'}</ButtonCategoryTextOverflow>
              </ButtonCategory>
            }
            title={'Category'}
          />
        </Column>
        <Column>
          <FormRow
            formField={
              <Arbitrators
                customValues={arbitratorsCustom}
                disabled={!!loadedQuestionId || IS_CORONA_VERSION}
                networkId={context.networkId}
                onChangeArbitrator={handleArbitratorChange}
              />
            }
            title={'Arbitrator'}
          />
        </Column>
      </GridThreeColumns>
      {categoryButtonFocus && (
        <Categories categories={categoriesCustom} name="category" onChange={handleChange} selectedCategory={category} />
      )}
      <ButtonContainerFullWidth borderTop={true}>
        <LeftButton buttonType={ButtonType.secondaryLine} onClick={() => history.push(`/`)}>
          Cancel
        </LeftButton>
        <ButtonWithReadyToGoStatus
          buttonType={ButtonType.secondaryLine}
          disabled={error}
          onClick={props.next}
          readyToGo={!error}
        >
          Next
        </ButtonWithReadyToGoStatus>
      </ButtonContainerFullWidth>
    </CreateCard>
  )
}

export { AskQuestionStep }
