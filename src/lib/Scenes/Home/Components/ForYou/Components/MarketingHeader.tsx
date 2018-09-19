import { BorderBox, Box, color, Sans, Separator } from "@artsy/palette"
import { InvertedButton } from "lib/Components/Buttons"
import { Video } from "lib/Components/Video"
import { Fonts } from "lib/data/fonts"
import Switchboard from "lib/NativeModules/SwitchBoard"
import React, { Component } from "react"
import { Dimensions } from "react-native"
import styled from "styled-components/native"

// TODO: Give this a try
// import Video from "react-native-video"

export class MarketingHeader extends Component {
  handleTap = () => {
    Switchboard.presentNavigationViewController(this, "http://www.artsy.net/collect2")
  }

  render() {
    const { width } = Dimensions.get("window")

    return (
      <Container>
        <BorderBox p={0} width="100%" height="220px" background={color("black5")} style={{ overflow: "hidden" }}>
          <Video
            source={require("../videos/9172018-bn-banner-xs.mp4")}
            resizeMode="cover"
            size={{ width, height: 220 }}
          />
        </BorderBox>

        <Box my={2}>
          <Sans size="3">
            Buying art on Artsy is easier than ever before. Our most in-demand works are now available for instant
            purchase, with simple checkout and hassle-free shipping.
          </Sans>
        </Box>

        <InvertedButton
          text="Browse works"
          onPress={this.handleTap}
          style={{
            width: 130,
            borderRadius: 2,
            borderColor: "transparent",
          }}
          textStyle={{
            color: "white",
            fontFamily: Fonts.Unica77LLMedium,
            fontSize: 14,
            textShadowColor: "white",
          }}
          key="1"
        />

        <Box mt={4} mb={-3}>
          <Separator />
        </Box>
      </Container>
    )
  }
}

const Container = styled.View`
  padding: 20px;
`
