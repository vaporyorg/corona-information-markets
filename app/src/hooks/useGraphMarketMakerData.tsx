import { useQuery } from '@apollo/react-hooks'
import { BigNumber, bigNumberify } from 'ethers/utils'
import gql from 'graphql-tag'
import { useState } from 'react'

import { Question, Status } from '../util/types'

const query = gql`
  query GetMarket($id: ID!) {
    fixedProductMarketMaker(id: $id) {
      id
      creator
      collateralToken
      fee
      collateralVolume
      outcomeTokenAmounts
      condition {
        id
      }
      templateId
      title
      outcomes
      category
      language
      arbitrator
      openingTimestamp
      timeout
      resolutionTimestamp
      payouts
      currentAnswer
      answerFinalizedTimestamp
      question {
        id
        data
      }
    }
  }
`

type GraphResponse = {
  fixedProductMarketMaker: {
    id: string
    answerFinalizedTimestamp: Maybe<string>
    arbitrator: string
    category: string
    collateralToken: string
    collateralVolume: string
    condition: { id: string }
    creator: string
    currentAnswer: string
    fee: string
    language: string
    openingTimestamp: string
    outcomeTokenAmounts: string[]
    outcomes: Maybe<string[]>
    payouts: Maybe<string[]>
    question: {
      id: string
      data: string
    }
    resolutionTimestamp: string
    templateId: string
    timeout: string
    title: string
  }
}

export type GraphMarketMakerData = {
  address: string
  answerFinalizedTimestamp: Maybe<BigNumber>
  arbitratorAddress: string
  collateralAddress: string
  conditionId: string
  fee: BigNumber
  payouts: Maybe<number[]>
  question: Question
}

type Result = {
  marketMakerData: Maybe<GraphMarketMakerData>
  status: Status
}

const getOutcomes = (networkId: number, templateId: number) => {
  const isBinary = templateId === 0
  const isNuancedBinary = (networkId === 1 && templateId === 6) || (networkId === 4 && templateId === 5)
  if (isBinary || isNuancedBinary) {
    return ['No', 'Yes']
  } else {
    throw new Error(`Cannot get outcomes for network '${networkId}' and template id '${templateId}'`)
  }
}

const wrangleResponse = (response: GraphResponse, networkId: number): GraphMarketMakerData => {
  const data = response.fixedProductMarketMaker

  const outcomes = data.outcomes ? data.outcomes : getOutcomes(networkId, +data.templateId)

  return {
    address: data.id,
    answerFinalizedTimestamp: data.answerFinalizedTimestamp ? bigNumberify(data.answerFinalizedTimestamp) : null,
    arbitratorAddress: data.arbitrator,
    collateralAddress: data.collateralToken,
    conditionId: data.condition.id,
    fee: bigNumberify(data.fee),
    payouts: data.payouts ? data.payouts.map(Number) : null,
    question: {
      id: data.question.id,
      templateId: +data.templateId,
      raw: data.question.data,
      title: data.title,
      category: data.category,
      resolution: new Date(1000 * +data.openingTimestamp),
      arbitratorAddress: data.arbitrator,
      outcomes,
    },
  }
}

/**
 * Get data from the graph for the given market maker. All the information returned by this hook comes from the graph,
 * other necessary information should be fetched from the blockchain.
 */
export const useGraphMarketMakerData = (marketMakerAddress: string, networkId: number): Result => {
  const [marketMakerData, setMarketMakerData] = useState<Maybe<GraphMarketMakerData>>(null)

  const { data, error, loading } = useQuery<GraphResponse>(query, {
    notifyOnNetworkStatusChange: true,
    skip: marketMakerData !== null,
    variables: { id: marketMakerAddress },
  })

  if (data && !marketMakerData) {
    setMarketMakerData(wrangleResponse(data, networkId))
  }

  return {
    marketMakerData,
    status: error ? Status.Error : loading ? Status.Loading : Status.Ready,
  }
}
