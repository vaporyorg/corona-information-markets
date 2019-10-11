import React, { useEffect, useState } from 'react'
import styled, { withTheme } from 'styled-components'
import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'

import { ViewCard } from '../view_card'
import { Button, OutcomeTable } from '../../common'
import { FullLoading } from '../../common/full_loading'
import { ButtonContainer } from '../../common/button_container'
import { SubsectionTitle } from '../../common/subsection_title'
import { TitleValue } from '../../common/title_value'
import { ClosedMarket } from '../../common/closed_market'
import { BalanceItem, OutcomeTableValue, Status } from '../../../util/types'
import { ERC20Service, MarketMakerService } from '../../../services'
import { getContractAddress } from '../../../util/addresses'
import { useConnectedWeb3Context } from '../../../hooks/connectedWeb3'
import { getLogger } from '../../../util/logger'
import { formatDate } from '../../../util/tools'
import { useContracts } from '../../../hooks/useContracts'

const Grid = styled.div`
  display: grid;
  grid-column-gap: 20px;
  grid-row-gap: 14px;
  grid-template-columns: 1fr;
  margin-bottom: 25px;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`

const ButtonContainerStyled = styled(ButtonContainer)`
  display: grid;
  grid-row-gap: 10px;
  grid-template-columns: 1fr;

  > button {
    margin-left: 0;
  }

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    display: flex;

    > button {
      margin-left: 10px;
    }
  }
`

interface Props {
  theme?: any
  balance: BalanceItem[]
  funding: BigNumber
  question: string
  resolution: Date | null
  marketAddress: string
}

const logger = getLogger('Market::ClosedMarketDetail')

export const ClosedMarketDetailWrapper = (props: Props) => {
  const context = useConnectedWeb3Context()
  const { conditionalTokens } = useContracts(context)

  const { theme, balance, marketAddress, resolution, funding } = props

  const [status, setStatus] = useState<Status>(Status.Ready)
  const [message, setMessage] = useState('')
  const [collateral, setCollateral] = useState<BigNumber>(new BigNumber(0))

  const provider = context.library
  const marketMaker = new MarketMakerService(marketAddress, conditionalTokens, provider)

  useEffect(() => {
    const fetchBalance = async () => {
      const provider = context.library
      const networkId = context.networkId

      const daiAddress = getContractAddress(networkId, 'dai')
      const daiService = new ERC20Service(daiAddress)
      const collateralBalance = await daiService.getCollateral(marketAddress, provider)
      setCollateral(collateralBalance)
    }

    fetchBalance()
  }, [collateral, context, marketAddress])

  const redeem = async () => {
    try {
      setMessage('Redeem payout...')
      setStatus(Status.Loading)

      const networkId = context.networkId

      const daiAddress = getContractAddress(networkId, 'dai')

      const conditionId = await marketMaker.getConditionId()

      await conditionalTokens.redeemPositions(daiAddress, conditionId)

      setStatus(Status.Ready)
    } catch (err) {
      setStatus(Status.Error)
      logger.log(`Error trying to redeem: ${err.message}`)
    }
  }

  const withdraw = async () => {
    try {
      setMessage('Withdraw collateral...')
      setStatus(Status.Loading)

      // TODO: TBD
      // await marketMaker.withdrawFees()

      setStatus(Status.Ready)
    } catch (err) {
      setStatus(Status.Error)
      logger.log(`Error trying to withdraw: ${err.message}`)
    }
  }

  const fundingFormat = ethers.utils.formatUnits(funding, 18)
  const collateralFormat = `${ethers.utils.formatUnits(collateral, 18)} DAI`
  const resolutionFormat = resolution ? formatDate(resolution) : ''

  const winningOutcome = balance.find((balanceItem: BalanceItem) => balanceItem.winningOutcome)
  const hasCollateral = collateral.isZero()

  return (
    <>
      <ClosedMarket date={resolutionFormat} />
      <ViewCard>
        {<SubsectionTitle>Balance</SubsectionTitle>}
        <OutcomeTable
          balance={balance}
          disabledColumns={[
            OutcomeTableValue.Probabilities,
            OutcomeTableValue.CurrentPrice,
            OutcomeTableValue.PriceAfterTrade,
          ]}
          withWinningOutcome={true}
        />

        <SubsectionTitle>Details</SubsectionTitle>
        <Grid>
          <TitleValue title="Category" value="Politics" />
          <TitleValue title="Oracle" value="realit.io and dxDAO" />
          <TitleValue title="Resolution Date" value={resolutionFormat} />
          <TitleValue title="Fee" value="1%" />
          <TitleValue title="Funding" value={fundingFormat} />
        </Grid>
        <SubsectionTitle>Market Results</SubsectionTitle>
        <Grid>
          <TitleValue title="Collateral" value={collateralFormat} />
        </Grid>

        <ButtonContainerStyled>
          <Button
            disabled={winningOutcome && winningOutcome.shares.isZero()}
            onClick={() => redeem()}
          >
            Redeem
          </Button>
          {/* TODO: TBD */}
          {/*{isMarketOwner && (*/}
          {/*<Button*/}
          {/*disabled={hasCollateral}*/}
          {/*backgroundColor={theme.colors.secondary}*/}
          {/*onClick={() => withdraw()}*/}
          {/*>*/}
          {/*Withdraw Collateral*/}
          {/*</Button>*/}
          {/*)}*/}
        </ButtonContainerStyled>
      </ViewCard>
      {status === Status.Loading ? <FullLoading message={message} /> : null}
    </>
  )
}

export const ClosedMarketDetail = withTheme(ClosedMarketDetailWrapper)