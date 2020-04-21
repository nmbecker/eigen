import React from "react"
import { TouchableWithoutFeedback } from "react-native"
import { createFragmentContainer, graphql } from "react-relay"
// @ts-ignore STRICTNESS_MIGRATION
import styled from "styled-components/native"

import OpaqueImageView from "lib/Components/OpaqueImageView/OpaqueImageView"
import Serif from "lib/Components/Text/Serif"
import fonts from "lib/data/fonts"
import Switchboard from "lib/NativeModules/SwitchBoard"

import { SaleListItem_sale } from "__generated__/SaleListItem_sale.graphql"

const Image = styled(OpaqueImageView)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

const Content = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
`

const Header = styled.View`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  padding: 10px;
`

const Footer = styled.View`
  padding: 5px;
  bottom: 0;
  position: absolute;
  margin: 5px;
`

const Title = styled(Serif)`
  color: white;
  font-size: 15px;
  flex: 1;
`

const Badge = styled.View`
  background: white;
  border-radius: 2px;
  padding: 1px 4px;
  margin-left: 3px;
`

const BadgeText = styled.Text`
  font-size: 7px;
  font-family: ${fonts["avant-garde-regular"]};
  letter-spacing: 1.5;
  align-self: center;
`

const Metadata = styled.Text`
  color: white;
  letter-spacing: 1.5;
  font-family: ${fonts["avant-garde-regular"]};
  font-size: 10px;
`

interface Props {
  sale: SaleListItem_sale
  containerWidth: number
}

export class SaleListItem extends React.Component<Props> {
  handleTap = () => {
    const {
      sale: { liveURLIfOpen, href },
    } = this.props
    const url = (liveURLIfOpen || href) as string
    Switchboard.presentNavigationViewController(this, url)
  }

  render() {
    const sale = this.props.sale
    const image = sale.coverImage
    // @ts-ignore STRICTNESS_MIGRATION
    const timestamp = sale.displayTimelyAt.toUpperCase()
    const containerWidth = this.props.containerWidth

    const Container = styled.View`
      width: ${containerWidth}px;
      height: ${containerWidth * 1.24}px;
      margin: 10px;
    `

    return (
      <TouchableWithoutFeedback onPress={this.handleTap}>
        <Container>
          <Image imageURL={image && image.url} />
          <Content>
            <Header>
              <Title numberOfLines={2}>{sale.name}</Title>
              {sale.liveStartAt && (
                <Badge>
                  <BadgeText>LIVE</BadgeText>
                </Badge>
              )}
            </Header>
            <Footer>
              <Metadata>{timestamp}</Metadata>
            </Footer>
          </Content>
        </Container>
      </TouchableWithoutFeedback>
    )
  }
}

export default createFragmentContainer(SaleListItem, {
  sale: graphql`
    fragment SaleListItem_sale on Sale {
      name
      href
      liveURLIfOpen
      liveStartAt
      displayTimelyAt
      coverImage {
        url(version: "large")
      }
    }
  `,
})
