import React, { useState } from 'react'
import { Network } from '../network'
import { MainMenu } from '../main_menu'
import { MobileMenu } from '../mobile_menu'
import styled from 'styled-components'
import { ConnectedWeb3 } from '../../../hooks/connectedWeb3'
import { ConnectWallet } from '../../connect_wallet'

const HeaderWrapper = styled.div`
  background: ${props => props.theme.header.backgroundColor};
  border-bottom: 1px solid ${props => props.theme.borders.borderColor};
  display: flex;
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  height: ${props => props.theme.header.height};
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 5;
`

const HeaderInner = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 100%;
  padding: 0 10px;
  width: ${props => props.theme.themeBreakPoints.xxl};

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    padding: 0 ${props => props.theme.paddings.mainPadding};
  }
`

const NetworkStyled = styled(Network)`
  margin: 0 0 0 auto;
`

const ConnectWalletStyled = styled(ConnectWallet)`
  margin: 0 0 0 auto;
`

const MobileMenuStyled = styled(MobileMenu)`
  display: inherit;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    display: none;
  }
`

const MainMenuStyled = styled(MainMenu)`
  display: none;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    display: inherit;
  }
`

export const Header: React.FC = props => {
  const { ...restProps } = props
  const [isMenuOpen, setMenuState] = useState(false)
  const toggleMenu = () => setMenuState(!isMenuOpen)

  return (
    <HeaderWrapper {...restProps}>
      <HeaderInner>
        <MainMenuStyled />
        <MobileMenuStyled toggleMenu={toggleMenu} isMenuOpen={isMenuOpen} />
        <ConnectedWeb3>
          <NetworkStyled />
        </ConnectedWeb3>
        <ConnectWalletStyled />
      </HeaderInner>
    </HeaderWrapper>
  )
}