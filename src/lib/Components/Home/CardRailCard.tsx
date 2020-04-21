import colors from "lib/data/colors"
// @ts-ignore STRICTNESS_MIGRATION
import styled from "styled-components/native"

export const CARD_WIDTH = 270

export const CardRailCard = styled.TouchableHighlight.attrs({ underlayColor: "transparent" })`
  width: ${CARD_WIDTH}px;
  border: 1px solid ${colors["gray-regular"]};
  border-radius: 4px;
  overflow: hidden;
`
